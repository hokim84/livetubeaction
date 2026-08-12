"use client";

import Link from "next/link";
import { useTransition } from "react";

import { deleteVideoAction, togglePinAction } from "@/app/actions/videos";

export default function VideoRowActions({
  id,
  pinned,
}: {
  id: string;
  pinned: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => togglePinAction(id, !pinned))}
        className="rounded-full border border-border px-2.5 py-1 text-xs text-fg/90 transition hover:bg-surface-hover disabled:opacity-50"
      >
        {pinned ? "고정 해제" : "상단 고정"}
      </button>
      <Link
        href={`/admin/videos/${id}/edit`}
        className="rounded-full border border-border px-2.5 py-1 text-xs text-fg/90 transition hover:bg-surface-hover"
      >
        수정
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("이 영상을 삭제할까요? 되돌릴 수 없습니다.")) return;
          startTransition(() => deleteVideoAction(id));
        }}
        className="rounded-full border border-border px-2.5 py-1 text-xs text-brand transition hover:bg-brand/10 disabled:opacity-50"
      >
        삭제
      </button>
    </div>
  );
}
