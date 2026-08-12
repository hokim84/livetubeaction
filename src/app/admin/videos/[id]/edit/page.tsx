import { notFound } from "next/navigation";

import { updateVideoAction } from "@/app/actions/videos";
import VideoForm from "@/components/VideoForm";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/categories";
import { getVideo } from "@/lib/videos";

export default async function EditVideoPage({
  params,
}: PageProps<"/admin/videos/[id]/edit">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const video = getVideo(id);
  if (!video) notFound();

  const action = updateVideoAction.bind(null, id);
  const categories = listCategories();

  return (
    <div>
      <h2 className="mb-4 text-base font-medium text-fg">영상 수정</h2>
      <VideoForm
        action={action}
        video={video}
        submitLabel="저장하기"
        defaultUploaderLabel={admin.display_name}
        categories={categories}
      />
    </div>
  );
}
