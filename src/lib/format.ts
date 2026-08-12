/**
 * "3분 전" 같은 상대 시간 문자열. 일주일이 넘으면 절대 날짜로 바꾼다.
 * 서버 컴포넌트에서 한 번 계산해 문자열로 내려보내는 용도 — 클라이언트에서 다시
 * 계산하면 렌더 시점이 달라 hydration mismatch가 날 수 있으므로 여기서만 호출한다.
 */
export function formatRelativeTime(isoString: string, now: Date = new Date()): string {
  const then = new Date(isoString);
  const diffSeconds = Math.round((now.getTime() - then.getTime()) / 1000);

  if (diffSeconds < 60) return "방금 전";

  const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return rtf.format(-diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return rtf.format(-diffDays, "day");

  return then.toISOString().slice(0, 10);
}
