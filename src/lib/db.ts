import "server-only";

import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "livetube.db");

// CREATE ... IF NOT EXISTS 뿐이라 매 커넥션마다 그대로 실행해도 안전하다.
// 별도 마이그레이션 도구를 두는 대신 이 문자열 하나를 스키마의 단일 출처로 쓴다.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,
  username     TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'viewer',
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS videos (
  id             TEXT PRIMARY KEY,
  youtube_id     TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  uploader_label TEXT NOT NULL DEFAULT '',
  duration_text  TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT 'album',
  tags           TEXT NOT NULL DEFAULT '',
  recorded_at    TEXT NOT NULL DEFAULT '',
  sort_index     INTEGER NOT NULL DEFAULT 0,
  added_by       TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS watch_events (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id   TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watched_at TEXT NOT NULL,
  PRIMARY KEY (user_id, video_id)
);
CREATE INDEX IF NOT EXISTS idx_watch_user_time ON watch_events(user_id, watched_at DESC);

CREATE TABLE IF NOT EXISTS comments (
  id         TEXT PRIMARY KEY,
  video_id   TEXT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_video ON comments(video_id, created_at DESC);

CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  sort_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
`;

/**
 * CREATE TABLE IF NOT EXISTS는 이미 만들어진 테이블에 새 컬럼을 추가해 주지 않는다.
 * 컬럼이 없을 때만 ALTER TABLE로 채워 넣는 최소한의 마이그레이션 — 컬럼이 하나둘
 * 늘어나는 정도라면 이 정도로 충분하고, 별도 마이그레이션 도구는 과하다.
 */
function ensureColumn(connection: DatabaseSync, table: string, column: string, ddl: string): void {
  const columns = connection.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((c) => c.name === column)) {
    connection.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

/**
 * 카테고리가 고정 2개(앨범/추천영상)이던 시절의 흔적을 정리한다:
 * 1) categories 테이블이 비어 있으면 그 두 개로 시드한다.
 * 2) 그때 videos.category에 박혀 있던 영문 키('album'/'recommended')를 새 한글 이름으로 옮긴다.
 * 둘 다 조건부라 이미 마이그레이션된 DB에서 다시 실행해도 아무 일도 일어나지 않는다.
 */
function ensureDefaultCategories(connection: DatabaseSync): void {
  const { n } = connection.prepare("SELECT COUNT(*) AS n FROM categories").get() as { n: number };
  if (n === 0) {
    const now = new Date().toISOString();
    const insert = connection.prepare(
      "INSERT INTO categories (id, name, sort_index, created_at) VALUES (?, ?, ?, ?)",
    );
    insert.run(randomUUID(), "앨범", 0, now);
    insert.run(randomUUID(), "추천영상", 1, now);
  }
  connection.exec(`UPDATE videos SET category = '앨범' WHERE category = 'album'`);
  connection.exec(`UPDATE videos SET category = '추천영상' WHERE category = 'recommended'`);
}

function createConnection(): DatabaseSync {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const connection = new DatabaseSync(DB_PATH);
  // 빌드 시 Next.js가 여러 워커 프로세스에서 동시에 이 파일을 여는데, WAL 없이는
  // 서로 "database is locked"로 즉시 실패한다. busy_timeout으로 잠금이 풀릴 때까지 기다리게 한다.
  connection.exec("PRAGMA busy_timeout = 5000");
  connection.exec("PRAGMA journal_mode = WAL");
  connection.exec("PRAGMA foreign_keys = ON");
  connection.exec(SCHEMA);
  ensureColumn(connection, "videos", "category", "category TEXT NOT NULL DEFAULT '앨범'");
  ensureColumn(connection, "users", "password_hash", "password_hash TEXT");
  ensureColumn(connection, "users", "password_salt", "password_salt TEXT");
  ensureDefaultCategories(connection);
  return connection;
}

// dev 모드 HMR에서 모듈이 다시 평가될 때마다 커넥션이 쌓이지 않도록 globalThis에 캐싱한다.
const globalForDb = globalThis as typeof globalThis & {
  __livetubeDb?: DatabaseSync;
};

export const db: DatabaseSync = (globalForDb.__livetubeDb ??= createConnection());

/**
 * node:sqlite는 결과 행을 null-prototype 객체로 돌려준다 — React Server Component가
 * 이걸 그대로 클라이언트 컴포넌트에 prop으로 넘기면 "plain object가 아니다"라며 거부한다.
 * 스프레드로 일반 객체로 바꿔서 어디로 넘기든 안전하게 만든다.
 */
export function queryAll<T>(sql: string, ...params: unknown[]): T[] {
  const rows = db.prepare(sql).all(...(params as never[]));
  return rows.map((row) => ({ ...row })) as unknown as T[];
}

export function queryOne<T>(sql: string, ...params: unknown[]): T | null {
  const row = db.prepare(sql).get(...(params as never[]));
  return row ? ({ ...row } as unknown as T) : null;
}

export function execute(sql: string, ...params: unknown[]): void {
  db.prepare(sql).run(...(params as never[]));
}
