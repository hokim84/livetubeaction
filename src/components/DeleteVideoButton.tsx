"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteVideoAction } from "@/app/actions/videos";

export default function DeleteVideoButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("이 영상을 삭제할까요? 되돌릴 수 없습니다.")) return;
        startTransition(async () => {
          try {
            await deleteVideoAction(id);
            router.push("/");
          } catch (error) {
            alert(error instanceof Error ? error.message : "삭제하지 못했습니다.");
          }
        });
      }}
      className="rounded-full bg-surface px-3 py-1.5 text-xs text-muted transition hover:bg-brand/10 hover:text-brand disabled:opacity-50"
    >
      영상 삭제
    </button>
  );
}
