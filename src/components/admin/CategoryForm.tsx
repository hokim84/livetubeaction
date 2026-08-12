"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createCategoryAction, type CategoryFormState } from "@/app/actions/categories";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "추가 중…" : "추가"}
    </button>
  );
}

export default function CategoryForm() {
  const [state, formAction] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    { error: null },
  );

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <input
          name="name"
          required
          maxLength={20}
          placeholder="예: 여행"
          className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-muted"
        />
        <SubmitButton />
      </div>
      {state.error ? <p className="text-xs text-brand">{state.error}</p> : null}
    </form>
  );
}
