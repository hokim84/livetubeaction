import { Suspense } from "react";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { requireUser } from "@/lib/auth";
import { listCategories } from "@/lib/categories";
import { listAllTags } from "@/lib/videos";

export default async function ViewerLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const tags = listAllTags();
  const categories = listCategories().map((c) => c.name);

  return (
    <div className="flex h-dvh flex-col">
      <Header user={user} />
      <div className="flex min-h-0 flex-1">
        <Suspense fallback={<div className="hidden w-56 shrink-0 md:block" />}>
          <Sidebar tags={tags} categories={categories} isAdmin={user.role === "admin"} />
        </Suspense>
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
