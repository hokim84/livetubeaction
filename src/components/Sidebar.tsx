"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

function NavItem({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-surface-hover font-medium text-fg"
          : "text-fg/90 hover:bg-surface"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      {children}
    </Link>
  );
}

const iconClass = "h-5 w-5 fill-none stroke-current stroke-[1.8]";

export default function Sidebar({
  tags,
  categories,
  isAdmin,
}: {
  tags: string[];
  categories: string[];
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const activeCategory = searchParams.get("category");
  const isHome = pathname === "/";

  return (
    <nav className="hidden w-56 shrink-0 overflow-y-auto border-r border-border p-3 md:block">
      <div className="space-y-1">
        <NavItem
          href="/"
          active={isHome && !activeTag && !activeCategory}
          icon={
            <svg viewBox="0 0 24 24" className={iconClass}>
              <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
            </svg>
          }
        >
          홈
        </NavItem>

        {categories.map((name) => (
          <NavItem
            key={name}
            href={`/?category=${encodeURIComponent(name)}`}
            active={isHome && activeCategory === name}
            icon={
              <svg viewBox="0 0 24 24" className={iconClass}>
                <path d="M3 7a1 1 0 0 1 1-1h4.5l1.5 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
              </svg>
            }
          >
            {name}
          </NavItem>
        ))}

        <NavItem
          href="/history"
          active={pathname === "/history"}
          icon={
            <svg viewBox="0 0 24 24" className={iconClass}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" strokeLinecap="round" />
            </svg>
          }
        >
          시청 기록
        </NavItem>

        <NavItem
          href="/videos/new"
          active={pathname === "/videos/new"}
          icon={
            <svg viewBox="0 0 24 24" className={iconClass}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8 12h8" strokeLinecap="round" />
            </svg>
          }
        >
          영상 추가
        </NavItem>

        {isAdmin && (
          <NavItem
            href="/admin"
            active={pathname.startsWith("/admin")}
            icon={
              <svg viewBox="0 0 24 24" className={iconClass}>
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.1a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-3-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.1-3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 3 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            }
          >
            관리
          </NavItem>
        )}
      </div>

      {tags.length > 0 && (
        <>
          <hr className="my-3 border-border" />
          <p className="px-3 pb-1 text-xs font-medium tracking-wide text-muted">
            태그
          </p>
          <div className="space-y-0.5">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className={`block truncate rounded-lg px-3 py-2 text-sm transition ${
                  activeTag === tag
                    ? "bg-surface-hover font-medium text-fg"
                    : "text-fg/90 hover:bg-surface"
                }`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}
