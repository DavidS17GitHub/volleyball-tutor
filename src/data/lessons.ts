import type { LessonClip } from "../types";

const azureBaseUrl = import.meta.env.VITE_AZURE_VIDEO_BASE_URL;

export const resolveVideoUrl = (clip: LessonClip) => {
  if (clip.videoUrl) {
    return clip.videoUrl;
  }

  if (azureBaseUrl && clip.videoPath) {
    return `${azureBaseUrl.replace(/\/$/, "")}/${clip.videoPath.replace(/^\//, "")}`;
  }

  return "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
};
