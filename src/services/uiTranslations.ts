import { getRuntimeConfig } from "../runtimeConfig";
import type { Locale, RuntimeTranslations } from "../i18n";

const isTranslationMap = (value: unknown): value is Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
};

const isRuntimeTranslations = (value: unknown): value is RuntimeTranslations => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<Record<Locale, unknown>>;

  return (
    (candidate.en === undefined || isTranslationMap(candidate.en)) &&
    (candidate.es === undefined || isTranslationMap(candidate.es))
  );
};

const translationsUrl = () => {
  const lessonsUrl =
    getRuntimeConfig().lessonsMetadataUrl ??
    import.meta.env.VITE_LESSONS_METADATA_URL ??
    "/lessons.json";

  return new URL(
    "/api/translations",
    new URL(lessonsUrl, window.location.origin),
  ).toString();
};

export async function loadUiTranslations(): Promise<RuntimeTranslations> {
  const response = await fetch(translationsUrl());

  if (!response.ok) {
    throw new Error("Unable to load UI translations.");
  }

  const data: unknown = await response.json();

  if (!isRuntimeTranslations(data)) {
    throw new Error("UI translations are not in the expected format.");
  }

  return data;
}
