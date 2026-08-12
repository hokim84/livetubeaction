import EmptyState from "@/components/EmptyState";
import VideoCard from "@/components/VideoCard";
import { requireUser } from "@/lib/auth";
import { listCategories } from "@/lib/categories";
import { listVideos, type Video } from "@/lib/videos";

function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  await requireUser();
  const params = await searchParams;

  const search = typeof params.q === "string" ? params.q : undefined;
  const tag = typeof params.tag === "string" ? params.tag : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;

  const isFiltered = Boolean(search || tag || category);

  // 검색·태그·카테고리 필터가 하나라도 걸려 있으면 카테고리 구분 없이 단일 결과 목록으로 보여준다.
  if (isFiltered) {
    const videos = listVideos({ search, tag, category });
    const heading = search ? `"${search}" 검색 결과` : category ? category : `#${tag}`;

    return (
      <div className="p-4 sm:p-6">
        <p className="mb-4 text-sm text-muted">
          {heading} · {videos.length}개
        </p>

        {videos.length === 0 ? (
          <EmptyState
            title="결과가 없습니다"
            description="다른 검색어나 태그, 카테고리로 찾아보세요."
          />
        ) : (
          <VideoGrid videos={videos} />
        )}
      </div>
    );
  }

  const categories = listCategories();
  const sections = categories.map((cat) => ({
    name: cat.name,
    videos: listVideos({ category: cat.name }),
  }));
  const hasAnyVideo = sections.some((section) => section.videos.length > 0);

  if (!hasAnyVideo) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          title="아직 등록된 영상이 없습니다"
          description="YouTube 일부공개 링크를 붙여넣어 첫 영상을 추가해 보세요."
          actionHref="/videos/new"
          actionLabel="영상 추가하기"
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 sm:p-6">
      {sections.map((section) => (
        <section key={section.name}>
          <h2 className="mb-4 text-base font-semibold text-fg">{section.name}</h2>
          {section.videos.length === 0 ? (
            <p className="text-sm text-muted">아직 이 카테고리에 올라온 영상이 없습니다.</p>
          ) : (
            <VideoGrid videos={section.videos} />
          )}
        </section>
      ))}
    </div>
  );
}
