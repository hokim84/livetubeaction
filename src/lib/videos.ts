import "server-only";

import { randomUUID } from "node:crypto";

import { execute, queryAll, queryOne } from "./db";
import { parseTags } from "./youtube";

/** 카테고리는 관리자가 자유롭게 추가하는 이름이라 고정된 값 집합이 아니다. `src/lib/categories.ts` 참고. */
export type Category = string;

export type Video = {
  id: string;
  youtube_id: string;
  title: string;
  description: string;
  uploader_label: string;
  duration_text: string;
  category: Category;
  tags: string;
  recorded_at: string;
  sort_index: number;
  added_by: string | null;
  created_at: string;
};

export type VideoInput = {
  youtubeId: string;
  title: string;
  description: string;
  uploaderLabel: string;
  durationText: string;
  category: Category;
  tags: string;
  recordedAt: string;
};

/** 고정 순서(sort_index)가 먼저, 그 안에서는 최신 등록순. */
const ORDER = "ORDER BY sort_index DESC, created_at DESC";

/** LIKE에서 특수문자가 와일드카드로 동작하지 않도록 이스케이프한다. */
function likeTerm(raw: string): string {
  return `%${raw.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export function listVideos(
  options: { search?: string; tag?: string; category?: Category } = {},
): Video[] {
  const search = options.search?.trim();

  let rows = search
    ? queryAll<Video>(
        `SELECT * FROM videos
          WHERE title LIKE ?1 ESCAPE '\\'
             OR description LIKE ?1 ESCAPE '\\'
             OR uploader_label LIKE ?1 ESCAPE '\\'
             OR tags LIKE ?1 ESCAPE '\\'
          ${ORDER}`,
        likeTerm(search),
      )
    : queryAll<Video>(`SELECT * FROM videos ${ORDER}`);

  if (options.category) {
    rows = rows.filter((video) => video.category === options.category);
  }

  const tag = options.tag?.trim();
  if (!tag) return rows;

  // 태그는 쉼표 문자열이라 SQL LIKE로는 부분 일치가 섞인다. 규모가 작으므로 여기서 정확히 거른다.
  return rows.filter((video) => parseTags(video.tags).includes(tag));
}

export function getVideo(id: string): Video | null {
  return queryOne<Video>("SELECT * FROM videos WHERE id = ?", id);
}

export function getVideoByYoutubeId(youtubeId: string): Video | null {
  return queryOne<Video>("SELECT * FROM videos WHERE youtube_id = ?", youtubeId);
}

export function listRelatedVideos(excludeId: string, limit = 12): Video[] {
  return queryAll<Video>(
    `SELECT * FROM videos WHERE id != ? ${ORDER} LIMIT ?`,
    excludeId,
    limit,
  );
}

export function listAllTags(): string[] {
  const rows = queryAll<{ tags: string }>(
    "SELECT tags FROM videos WHERE tags != ''",
  );
  const unique = new Set<string>();
  for (const row of rows) {
    for (const tag of parseTags(row.tags)) unique.add(tag);
  }
  return [...unique].sort((a, b) => a.localeCompare(b, "ko"));
}

export function createVideo(input: VideoInput, addedBy: string): Video {
  const video: Video = {
    id: randomUUID(),
    youtube_id: input.youtubeId,
    title: input.title,
    description: input.description,
    uploader_label: input.uploaderLabel,
    duration_text: input.durationText,
    category: input.category,
    tags: parseTags(input.tags).join(", "),
    recorded_at: input.recordedAt,
    sort_index: 0,
    added_by: addedBy,
    created_at: new Date().toISOString(),
  };

  execute(
    `INSERT INTO videos
       (id, youtube_id, title, description, uploader_label, duration_text,
        category, tags, recorded_at, sort_index, added_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    video.id,
    video.youtube_id,
    video.title,
    video.description,
    video.uploader_label,
    video.duration_text,
    video.category,
    video.tags,
    video.recorded_at,
    video.sort_index,
    video.added_by,
    video.created_at,
  );

  return video;
}

export function updateVideo(id: string, input: VideoInput): void {
  execute(
    `UPDATE videos
        SET youtube_id = ?, title = ?, description = ?, uploader_label = ?,
            duration_text = ?, category = ?, tags = ?, recorded_at = ?
      WHERE id = ?`,
    input.youtubeId,
    input.title,
    input.description,
    input.uploaderLabel,
    input.durationText,
    input.category,
    parseTags(input.tags).join(", "),
    input.recordedAt,
    id,
  );
}

export function deleteVideo(id: string): void {
  execute("DELETE FROM videos WHERE id = ?", id);
}

/** 목록 맨 앞으로 고정 / 고정 해제. */
export function setPinned(id: string, pinned: boolean): void {
  execute("UPDATE videos SET sort_index = ? WHERE id = ?", pinned ? 1 : 0, id);
}

export function recordWatch(userId: string, videoId: string): void {
  execute(
    `INSERT INTO watch_events (user_id, video_id, watched_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, video_id) DO UPDATE SET watched_at = excluded.watched_at`,
    userId,
    videoId,
    new Date().toISOString(),
  );
}

export function listWatchHistory(userId: string): (Video & { watched_at: string })[] {
  return queryAll<Video & { watched_at: string }>(
    `SELECT v.*, w.watched_at
       FROM watch_events w
       JOIN videos v ON v.id = w.video_id
      WHERE w.user_id = ?
      ORDER BY w.watched_at DESC`,
    userId,
  );
}

/** 영상별 시청자 수 — 카드에 "N명이 봤어요"로 표시한다. */
export function watchCounts(): Map<string, number> {
  const rows = queryAll<{ video_id: string; count: number }>(
    "SELECT video_id, COUNT(*) AS count FROM watch_events GROUP BY video_id",
  );
  return new Map(rows.map((row) => [row.video_id, row.count]));
}
