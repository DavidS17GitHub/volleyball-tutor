import { CosmosClient } from "@azure/cosmos";
import { config } from "./config.js";
import type { PlayerProgress, ProgressAnswerInput } from "./types.js";

let client: CosmosClient | undefined;

const getContainer = () => {
  if (!config.cosmosConnectionString) {
    throw new Error("Missing required environment variable: COSMOS_CONNECTION_STRING");
  }

  client ??= new CosmosClient(config.cosmosConnectionString);

  return client
    .database(config.cosmosDatabaseName)
    .container(config.cosmosPlayerProgressContainerName);
};

const createEmptyProgress = (userId: string): PlayerProgress => {
  const now = new Date().toISOString();

  return {
    id: userId,
    userId,
    totalAttempts: 0,
    totalCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    lessonStats: {},
    createdAt: now,
    updatedAt: now,
  };
};

const isPlayerProgress = (value: unknown): value is PlayerProgress => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PlayerProgress>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.userId === "string" &&
    typeof candidate.totalAttempts === "number" &&
    typeof candidate.totalCorrect === "number" &&
    typeof candidate.currentStreak === "number" &&
    typeof candidate.bestStreak === "number" &&
    typeof candidate.lessonStats === "object" &&
    candidate.lessonStats !== null &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
};

export async function getPlayerProgress(userId: string): Promise<PlayerProgress> {
  try {
    const { resource } = await getContainer().item(userId, userId).read<PlayerProgress>();

    if (!resource) {
      return createEmptyProgress(userId);
    }

    if (!isPlayerProgress(resource)) {
      throw new Error(`Player progress document is invalid: ${userId}`);
    }

    return resource;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 404) {
      return createEmptyProgress(userId);
    }

    throw error;
  }
}

export async function recordProgressAnswer(
  userId: string,
  answer: ProgressAnswerInput,
): Promise<PlayerProgress> {
  const existing = await getPlayerProgress(userId);
  const now = new Date().toISOString();
  const lessonStats = { ...existing.lessonStats };
  const existingLessonStats = lessonStats[answer.lessonId] ?? { attempts: 0, correct: 0 };

  lessonStats[answer.lessonId] = {
    attempts: existingLessonStats.attempts + 1,
    correct: existingLessonStats.correct + (answer.isCorrect ? 1 : 0),
    lastAnsweredAt: now,
  };

  const currentStreak = answer.isCorrect ? existing.currentStreak + 1 : 0;
  const progress: PlayerProgress = {
    ...existing,
    totalAttempts: existing.totalAttempts + 1,
    totalCorrect: existing.totalCorrect + (answer.isCorrect ? 1 : 0),
    currentStreak,
    bestStreak: Math.max(existing.bestStreak, currentStreak),
    lessonStats,
    updatedAt: now,
  };

  const { resource } = await getContainer().items.upsert<PlayerProgress>(progress);

  if (!resource || !isPlayerProgress(resource)) {
    throw new Error(`Unable to update player progress: ${userId}`);
  }

  return resource;
}

export async function resetPlayerProgress(userId: string): Promise<PlayerProgress> {
  const progress = createEmptyProgress(userId);
  const { resource } = await getContainer().items.upsert<PlayerProgress>(progress);

  if (!resource || !isPlayerProgress(resource)) {
    throw new Error(`Unable to reset player progress: ${userId}`);
  }

  return resource;
}
