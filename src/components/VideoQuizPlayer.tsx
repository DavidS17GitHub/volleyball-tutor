import { Flag, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveVideoUrl } from "../data/lessons";
import { getLocalizedLessonText, useI18n } from "../i18n";
import type { AnswerState, LessonClip, SetOption } from "../types";
import { AnswerPanel } from "./AnswerPanel";

interface VideoQuizPlayerProps {
  clip: LessonClip;
  isLastClip: boolean;
  onComplete: (input: {
    clipId: string;
    selectedAnswer: SetOption;
    isCorrect: boolean;
  }) => void;
  onNext: () => void;
  progressError?: string | null;
}

export function VideoQuizPlayer({
  clip,
  isLastClip,
  onComplete,
  onNext,
  progressError,
}: VideoQuizPlayerProps) {
  const { locale, t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPausedForQuestion, setHasPausedForQuestion] = useState(false);
  const [answer, setAnswer] = useState<AnswerState | null>(null);
  const [decisionElapsedSeconds, setDecisionElapsedSeconds] = useState(0);
  const videoUrl = useMemo(() => resolveVideoUrl(clip), [clip]);
  const clipText = getLocalizedLessonText(clip, locale);

  useEffect(() => {
    setAnswer(null);
    setHasPausedForQuestion(false);
    setDecisionElapsedSeconds(0);
  }, [clip.id]);

  useEffect(() => {
    if (!hasPausedForQuestion || answer) {
      return undefined;
    }

    setDecisionElapsedSeconds(0);
    const timerId = window.setInterval(() => {
      setDecisionElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [answer, hasPausedForQuestion]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (!video || hasPausedForQuestion || video.currentTime < clip.pauseAtSeconds) {
      return;
    }

    video.pause();
    setHasPausedForQuestion(true);
    setDecisionElapsedSeconds(0);
  };

  const handleAnswer = (selected: SetOption) => {
    const video = videoRef.current;
    const isCorrect = selected === clip.correctAnswer;

    setAnswer({ selected, isCorrect });
    setDecisionElapsedSeconds(0);
    onComplete({ clipId: clip.id, selectedAnswer: selected, isCorrect });

    if (video) {
      void video.play();
    }
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setAnswer(null);
    setHasPausedForQuestion(false);
    setDecisionElapsedSeconds(0);
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
    setDecisionElapsedSeconds(0);
  };

  return (
    <main className="player-shell">
      <section className="video-stage">
        <div className="video-heading">
          <div>
            <p className="eyebrow">{t("currentClip")}</p>
            <h1>{clipText.title}</h1>
          </div>
          <button className="icon-button" onClick={handleReplay} type="button" aria-label={t("replayClip")}>
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="video-wrap">
          <video
            controls
            key={clip.id}
            onTimeUpdate={handleTimeUpdate}
            playsInline
            ref={videoRef}
            src={videoUrl}
          />
          {hasPausedForQuestion && !answer ? (
            <div className="decision-overlay" aria-live="polite">
              <strong>{t("waitingForAnswer")}</strong>
              <span>{t("decisionTimer", { seconds: decisionElapsedSeconds })}</span>
            </div>
          ) : null}
        </div>

        <div className="clip-meta">
          <span>{t("pauseAt", { seconds: clip.pauseAtSeconds.toFixed(1) })}</span>
          <span>{clipText.skillFocus}</span>
          <button className="text-action" onClick={handleShowDecision} type="button">
            <Flag size={16} />
            {t("showDecision")}
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
          progressError={progressError}
        />
      )}
    </main>
  );
}
