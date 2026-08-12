/**
 * YouTube 링크 파싱 및 URL 생성. 서버/클라이언트 양쪽에서 쓰이므로 Node 전용 API를 쓰지 않는다.
 * (관리자 폼에서 붙여넣는 즉시 썸네일 미리보기를 띄우기 위해 클라이언트에서도 호출된다.)
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

/** 경로 첫 세그먼트가 이것들 중 하나면 그 다음 세그먼트가 영상 ID다. */
const PATH_PREFIXES = new Set(["embed", "shorts", "live", "v"]);

/**
 * 다음 형태를 모두 처리한다:
 *   https://www.youtube.com/watch?v=ID&t=30s
 *   https://youtu.be/ID?si=...
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/live/ID
 *   ID (11자 원본 ID)
 * 인식하지 못하면 null을 돌려준다.
 */
export function parseYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (VIDEO_ID.test(trimmed)) return trimmed;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);

  if (SHORT_HOSTS.has(host)) {
    const candidate = segments[0];
    return candidate && VIDEO_ID.test(candidate) ? candidate : null;
  }

  if (!YOUTUBE_HOSTS.has(host)) return null;

  const fromQuery = url.searchParams.get("v");
  if (fromQuery && VIDEO_ID.test(fromQuery)) return fromQuery;

  if (segments.length >= 2 && PATH_PREFIXES.has(segments[0].toLowerCase())) {
    const candidate = segments[1];
    if (VIDEO_ID.test(candidate)) return candidate;
  }

  return null;
}

/**
 * hqdefault는 일부공개 영상을 포함해 항상 존재한다.
 * maxresdefault는 원본 해상도가 낮으면 404가 나므로 쓰지 않는다.
 */
export function thumbnailUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

/** 쿠키를 덜 남기는 nocookie 도메인을 쓴다. 일부공개 영상도 동일하게 재생된다. */
export function embedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`;
}

export function watchOnYouTubeUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

export function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
