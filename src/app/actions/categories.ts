"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { createCategory, deleteCategory } from "@/lib/categories";

export type CategoryFormState = { error: string | null };

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();
  const result = createCategory(String(formData.get("name") ?? ""));
  if (!result.ok) return { error: result.error };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { error: null };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireAdmin();
  const result = deleteCategory(id);
  if (!result.ok) throw new Error(result.error);

  revalidatePath("/");
  revalidatePath("/admin/categories");
}
