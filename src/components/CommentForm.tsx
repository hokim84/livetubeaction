"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { addCommentAction, type CommentFormState } from "@/app/actions/comments";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "등록 중…" : "등록"}
    </button>
  );
}

export default function CommentForm({ videoId }: { videoId: string }) {
  const action = addCommentAction.bind(null, videoId);
  const [state, formAction] = useActionState<CommentFormState, FormData>(action, {
    error: null,
    successId: 0,
  });

  return (
    // successId가 성공 시마다 바뀌므로 폼이 리마운트되며 입력창이 자연스럽게 비워진다.
    <form key={state.successId} action={formAction} className="space-y-2">
      <textarea
        name="body"
        required
        rows={2}
        maxLength={1000}
        placeholder="댓글을 남겨보세요"
        className="w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-muted"
      />
      {state.error ? (
        <p role="alert" className="text-xs text-brand">
          {state.error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
