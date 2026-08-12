import "server-only";

import { execute, queryAll } from "./db";
import type { Role, User } from "./auth";

export type UserSummary = User & { watched_count: number };

export function listUsers(): UserSummary[] {
  return queryAll<UserSummary>(
    `SELECT u.*, COUNT(w.video_id) AS watched_count
       FROM users u
       LEFT JOIN watch_events w ON w.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at ASC`,
  );
}

export function countAdmins(): number {
  const rows = queryAll<{ count: number }>(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND is_active = 1",
  );
  return rows[0]?.count ?? 0;
}

export function setUserActive(userId: string, active: boolean): void {
  execute("UPDATE users SET is_active = ? WHERE id = ?", active ? 1 : 0, userId);
  if (!active) {
    // 차단은 즉시 효력이 있어야 하므로 살아 있는 세션도 함께 지운다.
    execute("DELETE FROM sessions WHERE user_id = ?", userId);
  }
}

export function setUserRole(userId: string, role: Role): void {
  execute("UPDATE users SET role = ? WHERE id = ?", role, userId);
}

export function deleteUser(userId: string): void {
  execute("DELETE FROM users WHERE id = ?", userId);
}
