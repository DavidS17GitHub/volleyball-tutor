import { readFile } from "node:fs/promises";
import type { LessonClip, SetOption } from "./types.js";

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

export async function loadLessonClips(filePath: string): Promise<LessonClip[]> {
  const raw = await readFile(filePath, "utf-8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed) || !parsed.every(isLessonClip)) {
    throw new Error(`Lesson metadata file is invalid: ${filePath}`);
  }

  return parsed;
}
