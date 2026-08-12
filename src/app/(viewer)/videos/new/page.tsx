import { createVideoAction } from "@/app/actions/videos";
import VideoForm from "@/components/VideoForm";
import { requireUser } from "@/lib/auth";
import { listCategories } from "@/lib/categories";

export default async function NewVideoPage() {
  const user = await requireUser();
  const categories = listCategories();

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="mb-4 text-lg font-semibold text-fg">영상 추가</h1>
      <VideoForm
        action={createVideoAction}
        submitLabel="추가하기"
        defaultUploaderLabel={user.display_name}
        categories={categories}
      />
    </div>
  );
}
