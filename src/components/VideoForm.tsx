"use client";

import Image from "next/image";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { fetchVideoMetadataAction, type VideoFormState } from "@/app/actions/videos";
import type { CategoryRow } from "@/lib/categories";
import type { Video } from "@/lib/videos";
import { parseYouTubeId, thumbnailUrl } from "@/lib/youtube";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "저장 중…" : label}
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-fg">{label}</label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-muted";

export default function VideoForm({
  action,
  video,
  submitLabel,
  defaultUploaderLabel,
  categories,
}: {
  action: (prev: VideoFormState, formData: FormData) => Promise<VideoFormState>;
  video?: Video;
  submitLabel: string;
  defaultUploaderLabel?: string;
  categories: CategoryRow[];
}) {
  const [state, formAction] = useActionState<VideoFormState, FormData>(action, {
    error: null,
  });

  const initialUrl = video
    ? `https://www.youtube.com/watch?v=${video.youtube_id}`
    : "";
  const [url, setUrl] = useState(initialUrl);
  const previewId = parseYouTubeId(url);

  const [title, setTitle] = useState(video?.title ?? "");
  const [description, setDescription] = useState(video?.description ?? "");
  const [metaError, setMetaError] = useState<string | null>(null);
  const [isFetchingMeta, startFetchingMeta] = useTransition();

  function handleFetchMetadata() {
    if (!previewId) return;
    setMetaError(null);
    startFetchingMeta(async () => {
      const result = await fetchVideoMetadataAction(previewId);
      if (result.ok) {
        setTitle(result.title);
        setDescription(result.description);
      } else {
        setMetaError(result.error);
      }
    });
  }

  return (
    <form action={formAction} className="grid gap-6 sm:grid-cols-[1fr_260px]">
      <div className="space-y-4">
        <Field
          label="YouTube 링크"
          hint="일부공개(Unlisted) 영상 링크를 붙여넣으세요. watch, youtu.be, shorts, embed 형태를 모두 인식합니다."
        >
          <div className="flex gap-2">
            <input
              name="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://youtu.be/..."
              className={inputClass}
            />
            <button
              type="button"
              disabled={!previewId || isFetchingMeta}
              onClick={handleFetchMetadata}
              className="shrink-0 rounded-lg border border-border px-3.5 py-2.5 text-sm whitespace-nowrap text-fg/90 transition hover:bg-surface-hover disabled:opacity-50"
            >
              {isFetchingMeta ? "가져오는 중…" : "정보 가져오기"}
            </button>
          </div>
          {metaError ? <p className="text-xs text-brand">{metaError}</p> : null}
        </Field>

        <Field
          label="카테고리"
          hint={
            categories.length === 0
              ? "아직 카테고리가 없습니다. 관리자에게 카테고리 생성을 요청해 주세요."
              : undefined
          }
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <label key={cat.id}>
                <input
                  type="radio"
                  name="category"
                  value={cat.name}
                  defaultChecked={(video?.category ?? categories[0]?.name) === cat.name}
                  className="peer sr-only"
                />
                <span className="block cursor-pointer rounded-lg border border-border px-3.5 py-2.5 text-center text-sm text-fg/90 transition peer-checked:border-brand peer-checked:bg-brand/10 peer-checked:text-fg">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </Field>

        <Field label="제목">
          <input
            name="title"
            required
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label="설명"
          hint="정보 가져오기로 채운 설명은 YouTube가 앞부분만 제공하므로 일부만 채워집니다. 필요하면 직접 보완하세요."
        >
          <textarea
            name="description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="업로더 표시명" hint="예: 민수">
            <input
              name="uploaderLabel"
              maxLength={40}
              defaultValue={video?.uploader_label || defaultUploaderLabel}
              className={inputClass}
            />
          </Field>
          <Field label="길이" hint="예: 12:34">
            <input
              name="durationText"
              maxLength={10}
              defaultValue={video?.duration_text}
              placeholder="12:34"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="날짜" hint="예: 2026-08-13">
            <input
              name="recordedAt"
              maxLength={20}
              defaultValue={video?.recorded_at}
              placeholder="2026-08-13"
              className={inputClass}
            />
          </Field>
          <Field label="태그" hint="쉼표로 구분">
            <input
              name="tags"
              defaultValue={video?.tags}
              placeholder="여행, 2026"
              className={inputClass}
            />
          </Field>
        </div>

        {state.error ? (
          <p
            role="alert"
            className="rounded-lg border border-brand/40 bg-brand/10 px-3.5 py-2.5 text-sm text-fg"
          >
            {state.error}
          </p>
        ) : null}

        <SubmitButton label={submitLabel} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-fg">썸네일 미리보기</p>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
          {previewId ? (
            <Image
              key={previewId}
              src={thumbnailUrl(previewId)}
              alt="썸네일 미리보기"
              fill
              sizes="260px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted">
              링크를 입력하면 여기에 썸네일이 표시됩니다
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
