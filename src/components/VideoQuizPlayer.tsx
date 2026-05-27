import { Flag, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveVideoUrl } from "../data/lessons";
import type { AnswerState, LessonClip, SetOption } from "../types";
import { AnswerPanel } from "./AnswerPanel";

interface VideoQuizPlayerProps {
  clip: LessonClip;
  isLastClip: boolean;
  onComplete: (clipId: string) => void;
  onNext: () => void;
}

export function VideoQuizPlayer({
  clip,
  isLastClip,
  onComplete,
  onNext,
}: VideoQuizPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPausedForQuestion, setHasPausedForQuestion] = useState(false);
  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const videoUrl = useMemo(() => resolveVideoUrl(clip), [clip]);

  useEffect(() => {
    setAnswer(null);
    setHasPausedForQuestion(false);
  }, [clip.id]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (!video || hasPausedForQuestion || video.currentTime < clip.pauseAtSeconds) {
      return;
    }

    video.pause();
    setHasPausedForQuestion(true);
  };

  const handleAnswer = (selected: SetOption) => {
    const isCorrect = selected === clip.correctAnswer;
    setAnswer({ selected, isCorrect });
    onComplete(clip.id);
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setAnswer(null);
    setHasPausedForQuestion(false);
    video.currentTime = 0;
    void video.play();
  };

  const handleShowDecision = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(clip.pauseAtSeconds, video.duration || clip.pauseAtSeconds);
      video.pause();
    }

    setHasPausedForQuestion(true);
  };

  return (
    <main className="player-shell">
      <section className="video-stage">
        <div className="video-heading">
          <div>
            <p className="eyebrow">Current clip</p>
            <h1>{clip.title}</h1>
          </div>
          <button className="icon-button" onClick={handleReplay} type="button" aria-label="Replay clip">
            <RotateCcw size={20} />
          </button>
        </div>

        <video
          controls
          key={clip.id}
          onTimeUpdate={handleTimeUpdate}
          ref={videoRef}
          src={videoUrl}
        />

        <div className="clip-meta">
          <span>Pause at {clip.pauseAtSeconds.toFixed(1)}s</span>
          <span>{clip.skillFocus}</span>
          <button className="text-action" onClick={handleShowDecision} type="button">
            <Flag size={16} />
            Show decision
          </button>
        </div>
      </section>

      {hasPausedForQuestion && (
        <AnswerPanel
          answer={answer}
          clip={clip}
          isLastClip={isLastClip}
          onAnswer={handleAnswer}
          onContinue={onNext}
        />
      )}
    </main>
  );
}
