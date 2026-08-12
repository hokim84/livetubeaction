import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import { SESSION_COOKIE } from "./auth.shared";
import { execute, queryOne } from "./db";

export { SESSION_COOKIE };

// 친구들이 각자 개인 기기로 접속하는 걸 전제로 길게 잡는다. 만료돼도 비밀번호가 없으니
// 같은 아이디를 다시 입력하기만 하면 되므로, 짧게 잡아서 얻는 보안 이득이 크지 않다.
const SESSION_DAYS = 365;

export type Role = "admin" | "viewer";

export type User = {
  id: string;
  username: string;
  display_name: string;
  role: Role;
  is_active: number;
  password_hash: string | null;
  password_salt: string | null;
  created_at: string;
};

export const MIN_PASSWORD_LENGTH = 4;

const SCRYPT_KEYLEN = 64;

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const stored = Buffer.from(hash, "hex");
  // 길이가 다르면 timingSafeEqual이 바로 예외를 던지므로 먼저 걸러낸다.
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

/** 아이디 규칙: 영문 소문자·숫자·`_`·`-` 2~20자. 대소문자 구분 없이 같은 사람으로 취급한다. */
export const USERNAME_PATTERN = /^[a-z0-9_-]{2,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

function adminUsernames(): string[] {
  return (process.env.ADMIN_USERNAMES ?? "")
    .split(",")
    .map((name) => normalizeUsername(name))
    .filter(Boolean);
}

function isoNow(): string {
  return new Date().toISOString();
}

export function findUserByUsername(username: string): User | null {
  return queryOne<User>("SELECT * FROM users WHERE username = ?", username);
}

function willBecomeAdmin(username: string): boolean {
  const userCount = queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM users");
  const isFirstUser = (userCount?.count ?? 0) === 0;
  return isFirstUser || adminUsernames().includes(username);
}

/**
 * 일반 계정은 비밀번호 없이 아이디 + 표시 이름만으로 로그인한다. 해당 아이디가 없으면
 * 그 자리에서 계정을 만들고, 있으면 표시 이름만 갱신한다.
 *
 * 관리자 계정만 예외다: 관리자는 강한 권한(영상·계정 관리)을 가지므로 비밀번호가 필요하다.
 * 아직 비밀번호가 없는 관리자 계정(처음 관리자가 되는 순간, 또는 다른 관리자가 초기화한 뒤)은
 * 이번에 입력한 값을 그 자리에서 새 비밀번호로 저장한다 — 별도의 "비밀번호 설정" 화면을 두지 않는다.
 */
export function signInOrRegister(
  rawUsername: string,
  rawDisplayName: string,
  password: string,
): { ok: true; user: User } | { ok: false; error: string } {
  const username = normalizeUsername(rawUsername);
  const displayName = rawDisplayName.trim();

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "아이디는 영문 소문자·숫자·_·- 조합으로 2~20자여야 합니다.",
    };
  }
  if (displayName.length < 1 || displayName.length > 30) {
    return { ok: false, error: "이름은 1~30자로 입력해 주세요." };
  }

  const existing = findUserByUsername(username);

  if (existing) {
    if (!existing.is_active) {
      return { ok: false, error: "비활성화된 계정입니다. 관리자에게 문의하세요." };
    }

    if (existing.role === "admin") {
      if (existing.password_hash && existing.password_salt) {
        if (!password) {
          return { ok: false, error: "관리자 계정은 비밀번호가 필요합니다." };
        }
        if (!verifyPassword(password, existing.password_hash, existing.password_salt)) {
          return { ok: false, error: "비밀번호가 올바르지 않습니다." };
        }
      } else {
        if (password.length < MIN_PASSWORD_LENGTH) {
          return {
            ok: false,
            error: `관리자 계정이라 비밀번호 설정이 필요합니다. ${MIN_PASSWORD_LENGTH}자 이상 입력해 주세요.`,
          };
        }
        const { hash, salt } = hashPassword(password);
        execute(
          "UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?",
          hash,
          salt,
          existing.id,
        );
        existing.password_hash = hash;
        existing.password_salt = salt;
      }
    }

    if (existing.display_name !== displayName) {
      execute("UPDATE users SET display_name = ? WHERE id = ?", displayName, existing.id);
      existing.display_name = displayName;
    }
    return { ok: true, user: existing };
  }

  // 첫 번째로 만들어지는 계정, 또는 ADMIN_USERNAMES에 등록된 아이디는 관리자가 된다.
  const role: Role = willBecomeAdmin(username) ? "admin" : "viewer";

  let passwordHash: string | null = null;
  let passwordSalt: string | null = null;
  if (role === "admin") {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        ok: false,
        error: `관리자 계정이라 비밀번호가 필요합니다. ${MIN_PASSWORD_LENGTH}자 이상 입력해 주세요.`,
      };
    }
    const hashed = hashPassword(password);
    passwordHash = hashed.hash;
    passwordSalt = hashed.salt;
  }

  const user: User = {
    id: randomUUID(),
    username,
    display_name: displayName,
    role,
    is_active: 1,
    password_hash: passwordHash,
    password_salt: passwordSalt,
    created_at: isoNow(),
  };

  execute(
    `INSERT INTO users
       (id, username, display_name, role, is_active, password_hash, password_salt, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    user.id,
    user.username,
    user.display_name,
    user.role,
    user.is_active,
    user.password_hash,
    user.password_salt,
    user.created_at,
  );

  return { ok: true, user };
}

/** 다른 관리자가 잠긴 계정을 풀어줄 때 사용. 다음 로그인 때 입력한 값이 새 비밀번호가 된다. */
export function resetPassword(userId: string): void {
  execute("UPDATE users SET password_hash = NULL, password_salt = NULL WHERE id = ?", userId);
}

/** 세션 행을 만들고 쿠키를 심는다. Server Action / Route Handler에서만 호출 가능. */
export async function startSession(userId: string): Promise<void> {
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  execute("DELETE FROM sessions WHERE expires_at < ?", isoNow());
  execute(
    "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    sessionId,
    userId,
    expiresAt.toISOString(),
    isoNow(),
  );

  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    // LAN에서 평문 HTTP로 접속하므로 secure를 켜면 쿠키가 저장되지 않아 로그인이 조용히 실패한다.
    secure: false,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    execute("DELETE FROM sessions WHERE id = ?", sessionId);
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const row = queryOne<User & { expires_at: string }>(
    `SELECT u.*, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = ?`,
    sessionId,
  );
  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now() || !row.is_active) {
    execute("DELETE FROM sessions WHERE id = ?", sessionId);
    return null;
  }

  return row;
}

/** 로그인 필수 페이지에서 사용. proxy.ts의 쿠키 검사와 달리 여기가 최종 판정이다. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
