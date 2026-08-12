"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, resetPassword } from "@/lib/auth";
import {
  countAdmins,
  deleteUser,
  listUsers,
  setUserActive,
  setUserRole,
} from "@/lib/users";

/** 마지막 남은 관리자를 스스로 강등/비활성화하는 실수를 막는다. */
function assertNotLastAdmin(targetIsAdmin: boolean) {
  if (targetIsAdmin && countAdmins() <= 1) {
    throw new Error("마지막 관리자는 강등하거나 비활성화할 수 없습니다.");
  }
}

export async function setUserActiveAction(
  userId: string,
  active: boolean,
): Promise<void> {
  const admin = await requireAdmin();
  const target = listUsers().find((u) => u.id === userId);

  if (!active && target?.role === "admin") assertNotLastAdmin(true);
  if (userId === admin.id && !active) {
    throw new Error("자기 자신은 비활성화할 수 없습니다.");
  }

  setUserActive(userId, active);
  revalidatePath("/admin/users");
}

export async function setUserRoleAction(
  userId: string,
  role: "admin" | "viewer",
): Promise<void> {
  const admin = await requireAdmin();
  const target = listUsers().find((u) => u.id === userId);

  if (role === "viewer" && target?.role === "admin") assertNotLastAdmin(true);
  if (userId === admin.id && role === "viewer") {
    throw new Error("자기 자신의 관리자 권한은 해제할 수 없습니다.");
  }

  setUserRole(userId, role);
  revalidatePath("/admin/users");
}

export async function deleteUserAction(userId: string): Promise<void> {
  const admin = await requireAdmin();
  const target = listUsers().find((u) => u.id === userId);

  if (target?.role === "admin") assertNotLastAdmin(true);
  if (userId === admin.id) {
    throw new Error("자기 자신의 계정은 삭제할 수 없습니다.");
  }

  deleteUser(userId);
  revalidatePath("/admin/users");
}

/** 비밀번호를 지워서 다음 로그인 때 새로 설정하게 만든다. 잠긴 관리자 계정을 풀어줄 때 쓴다. */
export async function resetAdminPasswordAction(userId: string): Promise<void> {
  await requireAdmin();
  resetPassword(userId);
  revalidatePath("/admin/users");
}
