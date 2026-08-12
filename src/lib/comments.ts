import "server-only";

import { randomUUID } from "node:crypto";

import { execute, queryAll, queryOne } from "./db";

export type Comment = {
  id: string;
  video_id: string;
  user_id: string;
  body: string;
  created_at: string;
  display_name: string;
  username: string;
};

export function listComments(videoId: string): Comment[] {
  return queryAll<Comment>(
    `SELECT c.*, u.display_name, u.username
       FROM comments c
       JOIN users u ON u.id = c.user_id
      WHERE c.video_id = ?
      ORDER BY c.created_at DESC`,
    videoId,
  );
}

export function countComments(videoId: string): number {
  const row = queryOne<{ count: number }>(
    "SELECT COUNT(*) AS count FROM comments WHERE video_id = ?",
    videoId,
  );
  return row?.count ?? 0;
}

export function getComment(id: string): Comment | null {
  return queryOne<Comment>(
    `SELECT c.*, u.display_name, u.username
       FROM comments c
       JOIN users u ON u.id = c.user_id
      WHERE c.id = ?`,
    id,
  );
}

export function createComment(videoId: string, userId: string, body: string): void {
  execute(
    `INSERT INTO comments (id, video_id, user_id, body, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    randomUUID(),
    videoId,
    userId,
    body,
    new Date().toISOString(),
  );
}

export function deleteComment(id: string): void {
  execute("DELETE FROM comments WHERE id = ?", id);
}
