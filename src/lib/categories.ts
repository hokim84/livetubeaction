import "server-only";

import { randomUUID } from "node:crypto";

import { execute, queryAll, queryOne } from "./db";

export type CategoryRow = {
  id: string;
  name: string;
  sort_index: number;
  created_at: string;
};

export function listCategories(): CategoryRow[] {
  return queryAll<CategoryRow>(
    "SELECT * FROM categories ORDER BY sort_index ASC, created_at ASC",
  );
}

export function categoryExists(name: string): boolean {
  return queryOne<{ id: string }>("SELECT id FROM categories WHERE name = ?", name) !== null;
}

export function createCategory(rawName: string): { ok: true } | { ok: false; error: string } {
  const name = rawName.trim();
  if (!name) return { ok: false, error: "카테고리 이름을 입력해 주세요." };
  if (name.length > 20) return { ok: false, error: "카테고리 이름은 20자를 넘을 수 없습니다." };
  if (categoryExists(name)) return { ok: false, error: "이미 있는 카테고리 이름입니다." };

  const maxSort = queryOne<{ max: number | null }>(
    "SELECT MAX(sort_index) AS max FROM categories",
  );

  execute(
    "INSERT INTO categories (id, name, sort_index, created_at) VALUES (?, ?, ?, ?)",
    randomUUID(),
    name,
    (maxSort?.max ?? -1) + 1,
    new Date().toISOString(),
  );

  return { ok: true };
}

export function countVideosInCategory(name: string): number {
  const row = queryOne<{ n: number }>(
    "SELECT COUNT(*) AS n FROM videos WHERE category = ?",
    name,
  );
  return row?.n ?? 0;
}

export function deleteCategory(id: string): { ok: true } | { ok: false; error: string } {
  const category = queryOne<CategoryRow>("SELECT * FROM categories WHERE id = ?", id);
  if (!category) return { ok: false, error: "존재하지 않는 카테고리입니다." };

  if (countVideosInCategory(category.name) > 0) {
    return { ok: false, error: "이 카테고리를 쓰는 영상이 있어 삭제할 수 없습니다." };
  }
  if (listCategories().length <= 1) {
    return { ok: false, error: "마지막 카테고리는 삭제할 수 없습니다." };
  }

  execute("DELETE FROM categories WHERE id = ?", id);
  return { ok: true };
}
