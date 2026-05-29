import { readFile } from "node:fs/promises";
import { CosmosClient, type SqlQuerySpec } from "@azure/cosmos";
import type { LessonClip, SetOption } from "./types.js";

const setOptions: SetOption[] = ["outside", "pipe", "center", "opposite"];

interface LessonDocument extends LessonClip {
  isPublished?: boolean;
  sortOrder?: number;
}

const isLessonClip = (value: unknown): value is LessonDocument => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LessonDocument>;

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
      typeof candidate.videoPath === "string") &&
    (candidate.isPublished === undefined || typeof candidate.isPublished === "boolean") &&
    (candidate.sortOrder === undefined ||
      (typeof candidate.sortOrder === "number" && Number.isFinite(candidate.sortOrder)))
  );
};

const toPublicLessonClip = (lesson: LessonDocument): LessonClip => ({
  id: lesson.id,
  title: lesson.title,
  skillFocus: lesson.skillFocus,
  videoUrl: lesson.videoUrl,
  videoPath: lesson.videoPath,
  pauseAtSeconds: lesson.pauseAtSeconds,
  correctAnswer: lesson.correctAnswer,
  explanation: lesson.explanation,
});

export async function loadLessonClips(filePath: string): Promise<LessonClip[]> {
  const raw = await readFile(filePath, "utf-8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed) || !parsed.every(isLessonClip)) {
    throw new Error(`Lesson metadata file is invalid: ${filePath}`);
  }

  return parsed.map(toPublicLessonClip);
}

export async function loadLessonClipsFromCosmos(options: {
  connectionString: string;
  databaseName: string;
  containerName: string;
}): Promise<LessonClip[]> {
  const client = new CosmosClient(options.connectionString);
  const container = client
    .database(options.databaseName)
    .container(options.containerName);

  const query: SqlQuerySpec = {
    query: "SELECT * FROM c WHERE NOT IS_DEFINED(c.isPublished) OR c.isPublished = @published",
    parameters: [{ name: "@published", value: true }],
  };

  const { resources } = await container.items.query<LessonDocument>(query).fetchAll();

  if (!resources.every(isLessonClip)) {
    throw new Error(
      `Lesson documents are invalid in Cosmos DB container: ${options.databaseName}/${options.containerName}`,
    );
  }

  return resources
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .map(toPublicLessonClip);
}
