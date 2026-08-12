"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createComment, deleteComment, getComment } from "@/lib/comments";

export type CommentFormState = { error: string | null; successId: number };

const MAX_LENGTH = 1000;

export async function addCommentAction(
  videoId: string,
  prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();

  if (!body) return { error: "댓글 내용을 입력해 주세요.", successId: prev.successId };
  if (body.length > MAX_LENGTH) {
    return {
      error: `댓글은 ${MAX_LENGTH}자를 넘을 수 없습니다.`,
      successId: prev.successId,
    };
  }

  createComment(videoId, user.id, body);
  revalidatePath(`/watch/${videoId}`);
  // successId를 바꿔서 <form key={successId}>가 리마운트되도록 한다 — 입력창을 비우는 가장 단순한 방법.
  return { error: null, successId: prev.successId + 1 };
}

export async function deleteCommentAction(commentId: string): Promise<void> {
  const user = await requireUser();
  const comment = getComment(commentId);
  if (!comment) return;

  // 표시용 버튼 숨김과 별개로, 실제 권한 판정은 여기서 한다: 본인 댓글이거나 관리자여야 한다.
  if (comment.user_id !== user.id && user.role !== "admin") {
    throw new Error("본인 댓글만 삭제할 수 있습니다.");
  }

  deleteComment(commentId);
  revalidatePath(`/watch/${comment.video_id}`);
}
