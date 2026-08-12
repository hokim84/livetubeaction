import Image from "next/image";
import Link from "next/link";

import VideoRowActions from "@/components/admin/VideoRowActions";
import { listVideos } from "@/lib/videos";
import { thumbnailUrl } from "@/lib/youtube";

export default function AdminVideosPage() {
  const videos = listVideos();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">영상 {videos.length}개</p>
        <Link
          href="/videos/new"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          + 영상 추가
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted">
          아직 등록된 영상이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {videos.map((video) => (
            <li key={video.id} className="flex items-center gap-3 p-3">
              <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-surface">
                <Image
                  src={thumbnailUrl(video.youtube_id)}
                  alt={video.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {video.title}
                  <span className="ml-2 rounded bg-surface-hover px-1.5 py-0.5 text-[10px] font-normal text-muted">
                    {video.category}
                  </span>
                  {video.sort_index > 0 && (
                    <span className="ml-1 rounded bg-surface-hover px-1.5 py-0.5 text-[10px] font-normal text-muted">
                      고정됨
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted">
                  {video.uploader_label || "업로더 미입력"} · {video.youtube_id}
                </p>
              </div>

              <VideoRowActions id={video.id} pinned={video.sort_index > 0} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
