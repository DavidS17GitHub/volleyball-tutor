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

export const lessonClips: LessonClip[] = [
  {
    id: "serve-receive-outside-1",
    title: "Serve Receive: Left Pin Tempo",
    skillFocus: "Read setter body angle and outside hitter approach.",
    videoPath: "clips/serve-receive-outside-1.mp4",
    pauseAtSeconds: 4.2,
    correctAnswer: "outside",
    explanation:
      "The pass keeps the setter inside the court and the left-side attacker starts a clear outside approach before the middle can commit.",
  },
  {
    id: "transition-pipe-1",
    title: "Transition: Back-Row Attack",
    skillFocus: "Identify when the pipe is available behind the middle.",
    videoPath: "clips/transition-pipe-1.mp4",
    pauseAtSeconds: 5.5,
    correctAnswer: "pipe",
    explanation:
      "The middle holds the block and the back-row attacker is already loaded through zone six, making pipe the best attacking window.",
  },
  {
    id: "free-ball-center-1",
    title: "Free Ball: First Tempo Middle",
    skillFocus: "Spot a clean pass that enables the center option.",
    videoPath: "clips/free-ball-center-1.mp4",
    pauseAtSeconds: 3.8,
    correctAnswer: "center",
    explanation:
      "The setter receives a clean ball at the net with the middle attacker in rhythm, so the center set is available before the block closes.",
  },
  {
    id: "out-of-system-opposite-1",
    title: "Out of System: Right Pin Release",
    skillFocus: "Choose the safer outlet when the setter is pushed off target.",
    videoPath: "clips/out-of-system-opposite-1.mp4",
    pauseAtSeconds: 6.1,
    correctAnswer: "opposite",
    explanation:
      "The setter is drifting right and the opposite is presenting a stable target, which makes the right-pin set the highest-control choice.",
  },
];
