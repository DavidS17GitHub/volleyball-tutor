import { getRuntimeConfig } from "../runtimeConfig";
import type { PlayerProgress, SetOption } from "../types";

const progressUrl = () => {
  const lessonsUrl =
    getRuntimeConfig().lessonsMetadataUrl ??
    import.meta.env.VITE_LESSONS_METADATA_URL ??
    "/lessons.json";

  return new URL("/api/progress", lessonsUrl).toString();
};

const requestHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

const parseProgressResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Premium access is required to save progress.");
    }

    throw new Error("Unable to sync progress.");
  }

  return (await response.json()) as PlayerProgress;
};

export async function loadPlayerProgress(accessToken: string) {
  const response = await fetch(progressUrl(), {
    headers: requestHeaders(accessToken),
  });

  return parseProgressResponse(response);
}

export async function recordPlayerAnswer(input: {
  accessToken: string;
  lessonId: string;
  selectedAnswer: SetOption;
  isCorrect: boolean;
}) {
  const response = await fetch(`${progressUrl()}/answers`, {
    body: JSON.stringify({
      lessonId: input.lessonId,
      selectedAnswer: input.selectedAnswer,
      isCorrect: input.isCorrect,
    }),
    headers: requestHeaders(input.accessToken),
    method: "POST",
  });

  return parseProgressResponse(response);
}

export async function resetPlayerProgress(accessToken: string) {
  const response = await fetch(`${progressUrl()}/reset`, {
    headers: requestHeaders(accessToken),
    method: "POST",
  });

  return parseProgressResponse(response);
}
