import { Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProgressRail } from "./components/ProgressRail";
import { VideoQuizPlayer } from "./components/VideoQuizPlayer";
import { loadLessonClips } from "./services/lessonCatalog";
import type { LessonClip } from "./types";

export function App() {
  const [lessonClips, setLessonClips] = useState<LessonClip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentClip = lessonClips[currentIndex];

  const score = useMemo(() => completedIds.length, [completedIds]);

  useEffect(() => {
    let isActive = true;

    loadLessonClips()
      .then((clips) => {
        if (!isActive) {
          return;
        }

        setLessonClips(clips);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Unable to load lessons.",
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleComplete = (clipId: string) => {
    setCompletedIds((existing) =>
      existing.includes(clipId) ? existing : [...existing, clipId],
    );
  };

  const handleNext = () => {
    if (currentIndex === lessonClips.length - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedIds([]);
    setIsFinished(false);
  };

  if (isLoading) {
    return (
      <main className="center-state">
        <p className="eyebrow">Loading</p>
        <h1>Preparing lesson clips</h1>
      </main>
    );
  }

  if (loadError || lessonClips.length === 0) {
    return (
      <main className="center-state">
        <p className="eyebrow">Metadata issue</p>
        <h1>Lessons are unavailable</h1>
        <p>{loadError ?? "No lesson clips were found."}</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <ProgressRail
        clips={lessonClips}
        completedIds={completedIds}
        currentIndex={currentIndex}
      />

      {isFinished ? (
        <main className="finish-state">
          <Trophy size={44} />
          <p className="eyebrow">Lesson complete</p>
          <h1>{score} clips reviewed</h1>
          <p>
            The MVP flow is ready for real volleyball clips: upload videos to Azure,
            set each pause timestamp, and tune the feedback for your coaching model.
          </p>
          <button className="primary-action" onClick={handleRestart} type="button">
            Restart lesson
          </button>
        </main>
      ) : (
        <VideoQuizPlayer
          clip={currentClip}
          isLastClip={currentIndex === lessonClips.length - 1}
          onComplete={handleComplete}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
