"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login, type LoginState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "들어가는 중…" : "입장하기"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-medium text-fg">
          아이디
        </label>
        <input
          id="username"
          name="username"
          required
          autoFocus
          autoComplete="username"
          placeholder="minsu"
          pattern="[A-Za-z0-9_\-]{2,20}"
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-muted"
        />
        <p className="text-xs text-muted">
          영문 소문자·숫자·_·- 조합 2~20자. 다음에 들어올 때 같은 아이디를 쓰면 됩니다.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="displayName" className="block text-sm font-medium text-fg">
          이름
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          maxLength={30}
          autoComplete="nickname"
          placeholder="김민수"
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-muted"
        />
        <p className="text-xs text-muted">친구들에게 보여질 이름입니다.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-fg">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-muted"
        />
        <p className="text-xs text-muted">
          관리자 계정만 필요합니다. 일반 계정은 비워 두세요.
        </p>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-brand/40 bg-brand/10 px-3.5 py-2.5 text-sm text-fg"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
