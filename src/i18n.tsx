import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { LessonClip, SetOption } from "./types";

export type Locale = "en" | "es";

const defaultLocale: Locale = "en";

const translations = {
  en: {
    accuracy: "Accuracy",
    attempts: "Attempts",
    beginSession: "Begin Session",
    bestStreak: "Best streak",
    center: "Center",
    closeProgressChart: "Close progress chart",
    completed: "Completed",
    correct: "Correct",
    correctRead: "Correct read",
    currentClip: "Current clip",
    decisionPoint: "Decision point",
    finishLesson: "Finish lesson",
    finishSessionToAddPoint: "Finish a training session to add the first accuracy point.",
    lesson: "Lesson",
    lessonComplete: "Lesson complete",
    lessonsUnavailable: "Lessons are unavailable",
    loading: "Loading",
    metadataIssue: "Metadata issue",
    newRandomSession: "New random session",
    nextClip: "Next clip",
    noLessonClipsFound: "No lesson clips were found.",
    noSessionDataYet: "No session data yet",
    notQuite: "Not quite",
    opposite: "Opposite",
    outside: "Outside",
    pauseAt: "Pause at {seconds}s",
    pipe: "Pipe",
    premiumAccess: "Premium access",
    preparingLessonClips: "Preparing lesson clips",
    progressChart: "Progress Chart",
    resetChart: "Reset chart",
    resetProgress: "Reset progress",
    restartSession: "Restart session",
    replayClip: "Replay clip",
    session: "Session",
    sessionCompleteMessage:
      "The session has been completed.",
    sessionCorrectReads: "{count} correct reads",
    sessionHistory: "Session history",
    sessionVideoCount: "Session video count",
    setSelectionReads: "Set selection reads",
    showDecision: "Show decision",
    signIn: "Sign in",
    signInToStartTraining: "Sign in to start training",
    signOut: "Sign out",
    trainingSession: "Training session",
    userProgressAccount: "Your progress and lesson access are tied to your account.",
    videoCountLabel: "videos",
    videos: "Videos",
    viewChart: "View chart",
    viewProgressChart: "View progress chart",
    whatSetShouldSetterChoose: "What set should the setter choose?",
  },
  es: {
    accuracy: "Precisión",
    attempts: "Intentos",
    beginSession: "Comenzar sesión",
    bestStreak: "Mejor racha",
    center: "Central",
    closeProgressChart: "Cerrar gráfico de progreso",
    completed: "Completado",
    correct: "Correctas",
    correctRead: "Lectura correcta",
    currentClip: "Video actual",
    decisionPoint: "Punto de decisión",
    finishLesson: "Terminar sesión",
    finishSessionToAddPoint:
      "Termina una sesión de entrenamiento para agregar el primer punto de precisión.",
    lesson: "Lección",
    lessonComplete: "Sesión completada",
    lessonsUnavailable: "Las lecciones no están disponibles",
    loading: "Cargando",
    metadataIssue: "Problema de metadatos",
    newRandomSession: "Nueva sesión aleatoria",
    nextClip: "Siguiente video",
    noLessonClipsFound: "No se encontraron videos de lección.",
    noSessionDataYet: "Todavía no hay datos de sesión",
    notQuite: "Casi",
    opposite: "Opuesto",
    outside: "Punta",
    pauseAt: "Pausa en {seconds}s",
    pipe: "Pipe",
    premiumAccess: "Acceso premium",
    preparingLessonClips: "Preparando videos de lección",
    progressChart: "Gráfico de Progreso",
    resetChart: "Reiniciar gráfico",
    resetProgress: "Reiniciar progreso",
    restartSession: "Reiniciar sesión",
    replayClip: "Repetir video",
    session: "Sesión",
    sessionCompleteMessage:
      "La sesión ha sido completada.",
    sessionCorrectReads: "{count} lecturas correctas",
    sessionHistory: "Historial de sesiones",
    sessionVideoCount: "Cantidad de videos por sesión",
    setSelectionReads: "Lecturas de selección de armador",
    showDecision: "Mostrar decisión",
    signIn: "Iniciar sesión",
    signInToStartTraining: "Inicia sesión para entrenar",
    signOut: "Cerrar sesión",
    trainingSession: "Sesión de entrenamiento",
    userProgressAccount: "Tu progreso y acceso a las lecciones están vinculados a tu cuenta.",
    videoCountLabel: "videos",
    videos: "Videos",
    viewChart: "Ver gráfico",
    viewProgressChart: "Ver gráfico de progreso",
    whatSetShouldSetterChoose: "¿Qué pase debería elegir el armador?",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

const setOptionTranslationKeys: Record<SetOption, TranslationKey> = {
  center: "center",
  opposite: "opposite",
  outside: "outside",
  pipe: "pipe",
};

const supportedLocales: Locale[] = ["en", "es"];

const getInitialLocale = (): Locale => {
  const browserLocale = window.navigator.language.toLowerCase();
  return browserLocale.startsWith("es") ? "es" : defaultLocale;
};

const interpolate = (template: string, values?: Record<string, string | number>) =>
  Object.entries(values ?? {}).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  supportedLocales: Locale[];
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      supportedLocales,
      t: (key, values) => interpolate(translations[locale][key], values),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}

export function getLocalizedLessonText(clip: LessonClip, locale: Locale) {
  if (locale !== "es") {
    return {
      explanation: clip.explanation,
      skillFocus: clip.skillFocus,
      title: clip.title,
    };
  }

  return {
    explanation: clip.explanationEs ?? clip.explanation,
    skillFocus: clip.skillFocusEs ?? clip.skillFocus,
    title: clip.titleEs ?? clip.title,
  };
}

export function useSetOptionLabel() {
  const { t } = useI18n();

  return (option: SetOption) => t(setOptionTranslationKeys[option]);
}
