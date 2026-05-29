import { ChartLine, Play, RotateCcw, Trophy, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProgressRail } from "./components/ProgressRail";
import { SessionProgressModal } from "./components/SessionProgressModal";
import { VideoQuizPlayer } from "./components/VideoQuizPlayer";
import { loadLessonClips } from "./services/lessonCatalog";
import {
  loadPlayerProgress,
  recordPlayerAnswer,
  resetPlayerProgress,
} from "./services/playerProgress";
import {
  createSessionProgressPoint,
  loadSessionProgress,
  resetSessionProgress,
  saveSessionProgress,
} from "./services/sessionProgress";
import type { LessonClip, PlayerProgress, SessionProgressPoint, SetOption } from "./types";

interface AppProps {
  getAccessToken?: () => Promise<string>;
}

const sessionSizeOptions = [10, 20, 30] as const;

const buildRandomSession = (clips: LessonClip[], requestedSize: number) => {
  const shuffled = [...clips];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.min(requestedSize, clips.length));
};

export function App({ getAccessToken }: AppProps) {
  const [availableClips, setAvailableClips] = useState<LessonClip[]>([]);
  const [sessionClips, setSessionClips] = useState<LessonClip[]>([]);
  const [sessionSize, setSessionSize] = useState<(typeof sessionSizeOptions)[number]>(10);
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, boolean>>({});
  const [sessionProgress, setSessionProgress] = useState<SessionProgressPoint[]>(() =>
    loadSessionProgress(),
  );
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null);
  const currentClip = sessionClips[currentIndex];

  const sessionStats = useMemo(() => {
    let bestStreak = 0;
    let currentStreak = 0;
    let attempts = 0;
    let correct = 0;

    sessionClips.forEach((clip) => {
      const answer = sessionAnswers[clip.id];

      if (typeof answer !== "boolean") {
        return;
      }

      attempts += 1;

      if (answer) {
        correct += 1;
        currentStreak += 1;
        bestStreak = Math.max(bestStreak, currentStreak);
        return;
      }

      currentStreak = 0;
    });

    return { attempts, bestStreak, correct };
  }, [sessionAnswers, sessionClips]);

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

        setAvailableClips(clips);
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
    setSessionAnswers((existing) => ({
      ...existing,
      [input.clipId]: input.isCorrect,
    }));
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
    if (currentIndex === sessionClips.length - 1) {
      const progressPoint = createSessionProgressPoint({
        correctCount: sessionStats.correct,
        existingPoints: sessionProgress,
        videoCount: sessionClips.length,
      });
      const nextProgress = [...sessionProgress, progressPoint];

      setSessionProgress(nextProgress);
      saveSessionProgress(nextProgress);
      setIsFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  const handleStartSession = () => {
    setSessionClips(buildRandomSession(availableClips, sessionSize));
    setCurrentIndex(0);
    setCompletedIds([]);
    setSessionAnswers({});
    setIsFinished(false);
    setHasStartedSession(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedIds([]);
    setSessionAnswers({});
    setIsFinished(false);
  };

  const handleResetProgress = async () => {
    setCurrentIndex(0);
    setCompletedIds([]);
    setSessionAnswers({});
    setIsFinished(false);
    setHasStartedSession(false);

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

  const handleResetSessionProgress = () => {
    resetSessionProgress();
    setSessionProgress([]);
  };

  if (isLoading) {
    return (
      <main className="center-state">
        <p className="eyebrow">Loading</p>
        <h1>Preparing lesson clips</h1>
      </main>
    );
  }

  if (loadError || availableClips.length === 0) {
    return (
      <main className="center-state">
        <p className="eyebrow">Metadata issue</p>
        <h1>Lessons are unavailable</h1>
        <p>{loadError ?? "No lesson clips were found."}</p>
      </main>
    );
  }

  if (!hasStartedSession) {
    return (
      <main className="center-state session-start">
        <Video size={44} />
        <p className="eyebrow">Training session</p>
        <h1>Set selection reads</h1>
        <div className="session-options" aria-label="Session video count">
          {sessionSizeOptions.map((option) => (
            <button
              aria-pressed={sessionSize === option}
              className={[
                "session-option",
                sessionSize === option ? "selected" : "",
              ].join(" ")}
              key={option}
              onClick={() => setSessionSize(option)}
              type="button"
            >
              <span>{option}</span>
              videos
            </button>
          ))}
        </div>
        <button className="primary-action" onClick={handleStartSession} type="button">
          <Play size={18} />
          Begin Session
        </button>
        <button
          className="text-action"
          onClick={() => setIsProgressModalOpen(true)}
          type="button"
        >
          <ChartLine size={16} />
          View progress chart
        </button>
        {progressError ? <p className="error-text">{progressError}</p> : null}
        {isProgressModalOpen ? (
          <SessionProgressModal
            onClose={() => setIsProgressModalOpen(false)}
            onReset={handleResetSessionProgress}
            points={sessionProgress}
          />
        ) : null}
      </main>
    );
  }

  return (
    <div className="app-shell">
      <ProgressRail
        clips={sessionClips}
        completedIds={completedIds}
        currentIndex={currentIndex}
        playerProgress={playerProgress}
        sessionStats={sessionStats}
        onResetProgress={handleResetProgress}
        onViewSessionProgress={() => setIsProgressModalOpen(true)}
      />

      {isFinished ? (
        <main className="finish-state">
          <Trophy size={44} />
          <p className="eyebrow">Lesson complete</p>
          <h1>{sessionStats.correct} correct reads</h1>
          <p>
            The MVP flow is ready for real volleyball clips: upload videos to Azure,
            set each pause timestamp, and tune the feedback for your coaching model.
          </p>
          {progressError ? <p className="error-text">{progressError}</p> : null}
          <button className="primary-action" onClick={handleRestart} type="button">
            Restart session
          </button>
          <button className="text-action" onClick={handleStartSession} type="button">
            <Play size={16} />
            New random session
          </button>
          <button
            className="text-action"
            onClick={() => setIsProgressModalOpen(true)}
            type="button"
          >
            <ChartLine size={16} />
            View progress chart
          </button>
          <button className="text-action" onClick={handleResetProgress} type="button">
            <RotateCcw size={16} />
            Reset progress
          </button>
        </main>
      ) : (
        <VideoQuizPlayer
          clip={currentClip}
          isLastClip={currentIndex === sessionClips.length - 1}
          onComplete={handleComplete}
          onNext={handleNext}
          progressError={progressError}
        />
      )}
      {isProgressModalOpen ? (
        <SessionProgressModal
          onClose={() => setIsProgressModalOpen(false)}
          onReset={handleResetSessionProgress}
          points={sessionProgress}
        />
      ) : null}
    </div>
  );
}
