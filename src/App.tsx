import { RotateCcw, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProgressRail } from "./components/ProgressRail";
import { VideoQuizPlayer } from "./components/VideoQuizPlayer";
import { loadLessonClips } from "./services/lessonCatalog";
import {
  loadPlayerProgress,
  recordPlayerAnswer,
  resetPlayerProgress,
} from "./services/playerProgress";
import type { LessonClip, PlayerProgress, SetOption } from "./types";

interface AppProps {
  getAccessToken?: () => Promise<string>;
}

export function App({ getAccessToken }: AppProps) {
  const [lessonClips, setLessonClips] = useState<LessonClip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null);
  const currentClip = lessonClips[currentIndex];

  const score = useMemo(
    () =>
      completedIds.filter((clipId) => {
        const stats = playerProgress?.lessonStats[clipId];
        return stats && stats.correct > 0;
      }).length,
    [completedIds, playerProgress],
  );

  useEffect(() => {
    let isActive = true;

    Promise.resolve(getAccessToken?.())
      .then(async (accessToken) => {
        const [clips, progress] = await Promise.all([
          loadLessonClips(accessToken),
          accessToken ? loadPlayerProgress(accessToken) : Promise.resolve(null),
        ]);

        return { clips, progress };
      })
      .then(({ clips, progress }) => {
        if (!isActive) {
          return;
        }

        setLessonClips(clips);
        setPlayerProgress(progress);
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
  }, [getAccessToken]);

  const handleComplete = async (input: {
    clipId: string;
    selectedAnswer: SetOption;
    isCorrect: boolean;
  }) => {
    setCompletedIds((existing) =>
      existing.includes(input.clipId) ? existing : [...existing, input.clipId],
    );

    if (!getAccessToken) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const progress = await recordPlayerAnswer({
        accessToken,
        lessonId: input.clipId,
        selectedAnswer: input.selectedAnswer,
        isCorrect: input.isCorrect,
      });

      setPlayerProgress(progress);
      setProgressError(null);
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : "Unable to save progress.");
    }
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

  const handleResetProgress = async () => {
    setCurrentIndex(0);
    setCompletedIds([]);
    setIsFinished(false);

    if (!getAccessToken) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      const progress = await resetPlayerProgress(accessToken);
      setPlayerProgress(progress);
      setProgressError(null);
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : "Unable to reset progress.");
    }
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
        playerProgress={playerProgress}
        onResetProgress={handleResetProgress}
      />

      {isFinished ? (
        <main className="finish-state">
          <Trophy size={44} />
          <p className="eyebrow">Lesson complete</p>
          <h1>{score} correct reads</h1>
          <p>
            The MVP flow is ready for real volleyball clips: upload videos to Azure,
            set each pause timestamp, and tune the feedback for your coaching model.
          </p>
          {progressError ? <p className="error-text">{progressError}</p> : null}
          <button className="primary-action" onClick={handleRestart} type="button">
            Restart lesson
          </button>
          <button className="text-action" onClick={handleResetProgress} type="button">
            <RotateCcw size={16} />
            Reset progress
          </button>
        </main>
      ) : (
        <VideoQuizPlayer
          clip={currentClip}
          isLastClip={currentIndex === lessonClips.length - 1}
          onComplete={handleComplete}
          onNext={handleNext}
          progressError={progressError}
        />
      )}
    </div>
  );
}
