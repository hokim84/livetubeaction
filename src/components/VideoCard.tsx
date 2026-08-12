import Image from "next/image";
import Link from "next/link";

import type { Video } from "@/lib/videos";
import { thumbnailUrl } from "@/lib/youtube";

import Thumbnail from "./Thumbnail";

function metaLine(video: Video): string {
  const parts: string[] = [];
  if (video.uploader_label) parts.push(video.uploader_label);
  if (video.recorded_at) parts.push(video.recorded_at);
  return parts.join(" · ");
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/watch/${video.id}`} className="group block">
      <Thumbnail
        src={thumbnailUrl(video.youtube_id)}
        alt={video.title}
        durationText={video.duration_text}
      />

      <div className="mt-3 flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-sm font-semibold text-muted">
          {video.uploader_label ? video.uploader_label.slice(0, 1) : "?"}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm leading-5 font-medium text-fg">
            {video.title}
          </h3>
          <p className="mt-1 truncate text-xs text-muted">
            {metaLine(video)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/** 시청 페이지 우측 "다음 동영상" 목록에 쓰는 가로형 카드. */
export function VideoRow({ video }: { video: Video }) {
  return (
    <Link
      href={`/watch/${video.id}`}
      className="flex gap-2 rounded-xl p-1 transition hover:bg-surface-hover"
    >
      <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-surface">
        <Image
          src={thumbnailUrl(video.youtube_id)}
          alt={video.title}
          fill
          sizes="160px"
          className="object-cover"
        />
        {video.duration_text ? (
          <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-medium text-white">
            {video.duration_text}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 pt-0.5">
        <h4 className="line-clamp-2 text-xs leading-4 font-medium text-fg">
          {video.title}
        </h4>
        <p className="mt-1 truncate text-[11px] text-muted">
          {video.uploader_label}
        </p>
      </div>
    </Link>
  );
}
