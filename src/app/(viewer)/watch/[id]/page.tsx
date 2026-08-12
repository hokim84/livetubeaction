import Link from "next/link";
import { notFound } from "next/navigation";

import CommentSection from "@/components/CommentSection";
import DeleteVideoButton from "@/components/DeleteVideoButton";
import DescriptionBox from "@/components/DescriptionBox";
import Player from "@/components/Player";
import { VideoRow } from "@/components/VideoCard";
import { requireUser } from "@/lib/auth";
import { getVideo, listRelatedVideos, recordWatch } from "@/lib/videos";
import { parseTags, watchOnYouTubeUrl } from "@/lib/youtube";

export default async function WatchPage({ params }: PageProps<"/watch/[id]">) {
  const user = await requireUser();
  const { id } = await params;

  const video = getVideo(id);
  if (!video) notFound();

  // (user_id, video_id) 기준 upsert라 렌더가 두 번 돌아도 결과가 같다.
  recordWatch(user.id, video.id);

  const related = listRelatedVideos(video.id);
  const tags = parseTags(video.tags);

  const meta = [video.uploader_label, video.recorded_at].filter(Boolean).join(" · ");

  const canDelete = user.role === "admin" || video.added_by === user.id;

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <Player youtubeId={video.youtube_id} title={video.title} />

        <h1 className="mt-4 text-lg font-semibold text-fg sm:text-xl">
          {video.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-surface px-3 py-1.5 text-xs text-fg/90 transition hover:bg-surface-hover"
            >
              #{tag}
            </Link>
          ))}
          <a
            href={watchOnYouTubeUrl(video.youtube_id)}
            target="_blank"
            rel="noreferrer"
            className="ml-auto rounded-full bg-surface px-3 py-1.5 text-xs text-muted transition hover:bg-surface-hover hover:text-fg"
          >
            YouTube에서 열기 ↗
          </a>
          {canDelete && <DeleteVideoButton id={video.id} />}
        </div>

        <div className="mt-4">
          <DescriptionBox meta={meta} description={video.description} />
        </div>

        <CommentSection videoId={video.id} currentUser={user} />
      </div>

      <aside className="w-full shrink-0 lg:w-96">
        <h2 className="mb-2 text-sm font-medium text-fg">다음 동영상</h2>
        {related.length === 0 ? (
          <p className="text-sm text-muted">다른 영상이 아직 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {related.map((item) => (
              <VideoRow key={item.id} video={item} />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
