import EmptyState from "@/components/EmptyState";
import VideoCard from "@/components/VideoCard";
import { requireUser } from "@/lib/auth";
import { listWatchHistory } from "@/lib/videos";

export default async function HistoryPage() {
  const user = await requireUser();
  const history = listWatchHistory(user.id);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-lg font-semibold text-fg">시청 기록</h1>

      {history.length === 0 ? (
        <EmptyState
          title="아직 본 영상이 없습니다"
          description="영상을 시청하면 여기에 최근 본 순서로 표시됩니다."
        />
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {history.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
