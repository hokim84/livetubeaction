import "server-only";

export type VideoMetadata = { title: string; description: string };

const FETCH_TIMEOUT_MS = 6000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/** `<meta name="description" content="...">` 같은 태그에서 속성 순서와 무관하게 content 값을 뽑는다. */
function extractMetaContent(
  html: string,
  attr: "property" | "name",
  value: string,
): string | null {
  const tagMatch = html.match(new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*>`, "i"));
  if (!tagMatch) return null;
  const contentMatch = tagMatch[0].match(/content=["']([^"']*)["']/i);
  return contentMatch ? decodeHtmlEntities(contentMatch[1]) : null;
}

/**
 * API 키 없이 가져온다: 제목은 YouTube 공식 oEmbed 엔드포인트에서 정확히,
 * 설명은 시청 페이지 HTML의 description 메타 태그에서 얻는다 — YouTube가 앞부분(약 150자)만
 * 채워 넣으므로 설명은 항상 일부만 채워진다. 비공개(Private) 영상은 oEmbed와 페이지 접근이
 * 모두 막혀 있어 실패한다(임베드 재생이 막히는 것과 같은 이유).
 */
export async function fetchVideoMetadata(youtubeId: string): Promise<VideoMetadata> {
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  let title: string | null = null;
  try {
    const oembedRes = await fetchWithTimeout(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
    );
    if (oembedRes.ok) {
      const data = (await oembedRes.json()) as { title?: string };
      title = data.title?.trim() || null;
    }
  } catch {
    // oEmbed가 실패해도 아래에서 og:title로 한 번 더 시도한다.
  }

  let description = "";
  try {
    const pageRes = await fetchWithTimeout(watchUrl);
    if (pageRes.ok) {
      const html = await pageRes.text();
      if (!title) title = extractMetaContent(html, "property", "og:title");
      description =
        extractMetaContent(html, "property", "og:description") ??
        extractMetaContent(html, "name", "description") ??
        "";
    }
  } catch {
    // 페이지를 못 가져와도 oEmbed 제목만으로 계속 진행한다.
  }

  if (!title) throw new Error("이 영상의 정보를 가져오지 못했습니다.");

  return { title, description };
}
