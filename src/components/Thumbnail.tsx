"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * 썸네일은 외부(YouTube CDN)에서 오므로 삭제된 영상이나 오타 ID면 404가 난다.
 * 그 경우 깨진 이미지 대신 자리 표시자를 보여준다.
 */
export default function Thumbnail({
  src,
  alt,
  durationText,
  priority = false,
}: {
  src: string;
  alt: string;
  durationText?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted">
          썸네일을 불러올 수 없습니다
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={() => setFailed(true)}
          className="object-cover transition duration-200 group-hover:scale-[1.02]"
        />
      )}

      {durationText ? (
        <span className="absolute right-1.5 bottom-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {durationText}
        </span>
      ) : null}
    </div>
  );
}
