"use client";

import { useTransition } from "react";

import {
  deleteUserAction,
  resetAdminPasswordAction,
  setUserActiveAction,
  setUserRoleAction,
} from "@/app/actions/users";
import type { Role } from "@/lib/auth";

export default function UserRowActions({
  id,
  role,
  isActive,
  isSelf,
  hasPassword,
}: {
  id: string;
  role: Role;
  isActive: boolean;
  isSelf: boolean;
  hasPassword: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        alert(error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.");
      }
    });
  }

  const passwordResetButton = role === "admin" && hasPassword && (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("비밀번호를 초기화할까요? 다음 로그인 때 새 비밀번호를 설정하게 됩니다.")) {
          return;
        }
        run(() => resetAdminPasswordAction(id));
      }}
      className="rounded-full border border-border px-2.5 py-1 text-xs text-fg/90 transition hover:bg-surface-hover disabled:opacity-50"
    >
      비밀번호 초기화
    </button>
  );

  if (isSelf) {
    return (
      <div className="flex items-center gap-1.5">
        {passwordResetButton}
        <span className="text-xs text-muted">현재 계정</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {passwordResetButton}
      <button
        type="button"
        disabled={isPending}
        onClick={() => run(() => setUserRoleAction(id, role === "admin" ? "viewer" : "admin"))}
        className="rounded-full border border-border px-2.5 py-1 text-xs text-fg/90 transition hover:bg-surface-hover disabled:opacity-50"
      >
        {role === "admin" ? "관리자 해제" : "관리자로 지정"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => run(() => setUserActiveAction(id, !isActive))}
        className="rounded-full border border-border px-2.5 py-1 text-xs text-fg/90 transition hover:bg-surface-hover disabled:opacity-50"
      >
        {isActive ? "차단" : "차단 해제"}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("이 계정을 삭제할까요? 시청 기록도 함께 삭제됩니다.")) return;
          run(() => deleteUserAction(id));
        }}
        className="rounded-full border border-border px-2.5 py-1 text-xs text-brand transition hover:bg-brand/10 disabled:opacity-50"
      >
        삭제
      </button>
    </div>
  );
}
