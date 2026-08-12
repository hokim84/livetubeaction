import Link from "next/link";
import { Suspense } from "react";

import { logout } from "@/app/actions/auth";
import type { User } from "@/lib/auth";

import Logo from "./Logo";
import SearchBar from "./SearchBar";

export default function Header({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg px-4">
      <Link href="/" aria-label="홈으로">
        <Logo />
      </Link>

      <Suspense fallback={<div className="mx-auto w-full max-w-xl" />}>
        <SearchBar />
      </Suspense>

      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-sm text-muted sm:inline">
          {user.display_name}
        </span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
          title={`${user.display_name} (${user.username})`}
        >
          {user.display_name.slice(0, 1)}
        </span>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:bg-surface-hover hover:text-fg"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
