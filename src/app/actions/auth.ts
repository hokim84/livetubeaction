"use server";

import { redirect } from "next/navigation";

import { endSession, signInOrRegister, startSession } from "@/lib/auth";

export type LoginState = { error: string | null };

/**
 * 아이디 + 이름만 받는다. 관리자 계정일 때만 비밀번호가 함께 필요하다 — 나머지는
 * signInOrRegister가 판단한다(처음 보는 아이디면 그 자리에서 계정을 만든다).
 */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = signInOrRegister(username, displayName, password);
  if (!result.ok) return { error: result.error };

  await startSession(result.user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}
