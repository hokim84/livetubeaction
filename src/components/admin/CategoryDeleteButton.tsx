"use client";

import { useTransition } from "react";

import { deleteCategoryAction } from "@/app/actions/categories";

export default function CategoryDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("이 카테고리를 삭제할까요?")) return;
        startTransition(async () => {
          try {
            await deleteCategoryAction(id);
          } catch (error) {
            alert(error instanceof Error ? error.message : "삭제하지 못했습니다.");
          }
        });
      }}
      className="rounded-full border border-border px-2.5 py-1 text-xs text-muted transition hover:bg-brand/10 hover:text-brand disabled:opacity-50"
    >
      삭제
    </button>
  );
}
