"use client";

import { useSearchParams } from "next/navigation";

/**
 * JS 없이도 동작하는 GET 폼. 레이아웃은 searchParams를 받을 수 없어서
 * 현재 검색어를 여기서 직접 읽어 입력창에 채운다.
 */
export default function SearchBar() {
  const query = useSearchParams().get("q") ?? "";

  return (
    <form action="/" className="mx-auto flex w-full max-w-xl items-center">
      <input
        type="search"
        name="q"
        key={query}
        defaultValue={query}
        placeholder="영상 검색"
        aria-label="영상 검색"
        className="h-9 w-full rounded-l-full border border-border bg-surface px-4 text-sm text-fg outline-none placeholder:text-muted/70 focus:border-muted"
      />
      <button
        type="submit"
        aria-label="검색"
        className="h-9 rounded-r-full border border-l-0 border-border bg-surface-hover px-5 transition hover:bg-border"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-fg stroke-2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
