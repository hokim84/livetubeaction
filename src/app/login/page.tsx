import { redirect } from "next/navigation";

import Logo from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";

import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <p className="text-sm text-muted">
            비밀번호는 없습니다. 아이디와 이름만 입력하면 바로 시작합니다.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/40 p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
