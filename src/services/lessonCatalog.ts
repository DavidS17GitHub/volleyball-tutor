import type { LessonClip, SetOption } from "../types";
import { getRuntimeConfig } from "../runtimeConfig";

const setOptions: SetOption[] = ["outside", "pipe", "center", "opposite"];

const isLessonClip = (value: unknown): value is LessonClip => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LessonClip>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.skillFocus === "string" &&
    typeof candidate.pauseAtSeconds === "number" &&
    Number.isFinite(candidate.pauseAtSeconds) &&
    typeof candidate.correctAnswer === "string" &&
    setOptions.includes(candidate.correctAnswer) &&
    typeof candidate.explanation === "string" &&
    (typeof candidate.videoUrl === "string" ||
      typeof candidate.videoPath === "string")
  );
};

export async function loadLessonClips(): Promise<LessonClip[]> {
  const metadataUrl =
    getRuntimeConfig().lessonsMetadataUrl ??
    import.meta.env.VITE_LESSONS_METADATA_URL ??
    "/lessons.json";

  const response = await fetch(metadataUrl);

  if (!response.ok) {
    throw new Error(`Unable to load lesson metadata from ${metadataUrl}`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data) || !data.every(isLessonClip)) {
    throw new Error("Lesson metadata is not in the expected format.");
  }

  return data;
}
