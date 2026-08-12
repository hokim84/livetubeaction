"use client";

import { useState } from "react";

export default function DescriptionBox({
  meta,
  description,
}: {
  meta: string;
  description: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 180 || description.includes("\n");

  return (
    <div className="rounded-xl bg-surface p-3 text-sm">
      <p className="font-medium text-fg">{meta}</p>

      {description ? (
        <p
          className={`mt-2 whitespace-pre-wrap text-fg/90 ${
            expanded ? "" : "line-clamp-2"
          }`}
        >
          {description}
        </p>
      ) : (
        <p className="mt-2 text-muted">설명이 없습니다.</p>
      )}

      {description && isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1.5 text-sm font-medium text-muted transition hover:text-fg"
        >
          {expanded ? "간략히" : "더보기"}
        </button>
      ) : null}
    </div>
  );
}
