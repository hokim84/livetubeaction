"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin, requireUser } from "@/lib/auth";
import { categoryExists } from "@/lib/categories";
import {
  createVideo,
  deleteVideo,
  getVideo,
  setPinned,
  updateVideo,
  type VideoInput,
} from "@/lib/videos";
import { parseYouTubeId } from "@/lib/youtube";
import { fetchVideoMetadata } from "@/lib/youtubeMetadata";

export type VideoFormState = { error: string | null };

export type MetadataResult =
  | { ok: true; title: string; description: string }
  | { ok: false; error: string };

function readInput(formData: FormData): { input: VideoInput | null; error: string | null } {
  const rawUrl = String(formData.get("url") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const rawCategory = String(formData.get("category") ?? "");

  const youtubeId = parseYouTubeId(rawUrl);
  if (!youtubeId) {
    return { input: null, error: "YouTube 링크를 인식하지 못했습니다. 링크를 다시 확인해 주세요." };
  }
  if (!title) {
    return { input: null, error: "제목을 입력해 주세요." };
  }
  if (!rawCategory || !categoryExists(rawCategory)) {
    return { input: null, error: "카테고리를 선택해 주세요." };
  }

  return {
    input: {
      youtubeId,
      title,
      description: String(formData.get("description") ?? "").trim(),
      uploaderLabel: String(formData.get("uploaderLabel") ?? "").trim(),
      durationText: String(formData.get("durationText") ?? "").trim(),
      category: rawCategory,
      tags: String(formData.get("tags") ?? "").trim(),
      recordedAt: String(formData.get("recordedAt") ?? "").trim(),
    },
    error: null,
  };
}

/** 영상 추가는 로그인한 사람이면 누구나 할 수 있다 — 관리자로 제한하지 않는다. */
export async function createVideoAction(
  _prev: VideoFormState,
  formData: FormData,
): Promise<VideoFormState> {
  const user = await requireUser();
  const { input, error } = readInput(formData);
  if (!input) return { error };

  const video = createVideo(input, user.id);
  revalidatePath("/");
  redirect(`/watch/${video.id}`);
}

export async function updateVideoAction(
  id: string,
  _prev: VideoFormState,
  formData: FormData,
): Promise<VideoFormState> {
  await requireAdmin();
  const { input, error } = readInput(formData);
  if (!input) return { error };

  if (!getVideo(id)) return { error: "존재하지 않는 영상입니다." };

  updateVideo(id, input);
  revalidatePath("/");
  revalidatePath(`/watch/${id}`);
  redirect("/admin");
}

/** 관리자는 아무 영상이나, 일반 계정은 본인이 추가한 영상만 삭제할 수 있다. */
export async function deleteVideoAction(id: string): Promise<void> {
  const user = await requireUser();
  const video = getVideo(id);
  if (!video) return;

  if (user.role !== "admin" && video.added_by !== user.id) {
    throw new Error("본인이 추가한 영상만 삭제할 수 있습니다.");
  }

  deleteVideo(id);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/watch/${id}`);
}

export async function togglePinAction(id: string, pinned: boolean): Promise<void> {
  await requireAdmin();
  setPinned(id, pinned);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function fetchVideoMetadataAction(youtubeId: string): Promise<MetadataResult> {
  await requireUser();
  try {
    const meta = await fetchVideoMetadata(youtubeId);
    return { ok: true, ...meta };
  } catch {
    return { ok: false, error: "정보를 가져오지 못했습니다. 직접 입력해 주세요." };
  }
}
