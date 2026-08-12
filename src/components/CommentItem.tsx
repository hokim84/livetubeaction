"use client";

import { useTransition } from "react";

import { deleteCommentAction } from "@/app/actions/comments";

export default function CommentItem({
  id,
  displayName,
  createdAtLabel,
  body,
  canDelete,
}: {
  id: string;
  displayName: string;
  createdAtLabel: string;
  body: string;
  canDelete: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-fg">
        {displayName.slice(0, 1)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-fg">{displayName}</span>
          <span className="text-xs text-muted">{createdAtLabel}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm text-fg/90">{body}</p>
      </div>

      {canDelete ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!confirm("이 댓글을 삭제할까요?")) return;
            startTransition(() => deleteCommentAction(id));
          }}
          className="h-fit shrink-0 rounded-full border border-border px-2 py-1 text-xs text-muted transition hover:bg-brand/10 hover:text-brand disabled:opacity-50"
        >
          삭제
        </button>
      ) : null}
    </div>
  );
}
