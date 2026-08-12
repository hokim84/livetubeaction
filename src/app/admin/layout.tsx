import Link from "next/link";

import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="홈으로 돌아가기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-fg/90 transition hover:bg-surface-hover"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-current stroke-[1.8]"
            >
              <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-fg">관리</h1>
        </div>
        <nav className="flex gap-1 rounded-full border border-border p-1 text-sm">
          <Link
            href="/admin"
            className="rounded-full px-3 py-1.5 text-fg/90 transition hover:bg-surface-hover"
          >
            영상
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-full px-3 py-1.5 text-fg/90 transition hover:bg-surface-hover"
          >
            카테고리
          </Link>
          <Link
            href="/admin/users"
            className="rounded-full px-3 py-1.5 text-fg/90 transition hover:bg-surface-hover"
          >
            계정
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
