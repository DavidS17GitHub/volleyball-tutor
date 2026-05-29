import { CosmosClient } from "@azure/cosmos";
import { config } from "./config.js";

export type Locale = "en" | "es";
export type UiTranslations = Partial<Record<Locale, Record<string, string>>>;

interface UiTranslationsDocument extends UiTranslations {
  id: string;
}

const isTranslationMap = (value: unknown): value is Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === "string");
};

const isUiTranslationsDocument = (value: unknown): value is UiTranslationsDocument => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<UiTranslationsDocument>;

  return (
    candidate.id === "ui" &&
    (candidate.en === undefined || isTranslationMap(candidate.en)) &&
    (candidate.es === undefined || isTranslationMap(candidate.es))
  );
};

export async function loadUiTranslations(): Promise<UiTranslations> {
  if (!config.cosmosConnectionString) {
    return {};
  }

  const client = new CosmosClient(config.cosmosConnectionString);
  const container = client
    .database(config.cosmosDatabaseName)
    .container(config.cosmosUiTranslationsContainerName);

  try {
    const { resource } = await container
      .item("ui", "ui")
      .read<UiTranslationsDocument>();

    if (!resource) {
      return {};
    }

    if (!isUiTranslationsDocument(resource)) {
      throw new Error(
        `UI translations document is invalid: ${config.cosmosDatabaseName}/${config.cosmosUiTranslationsContainerName}/ui`,
      );
    }

    return {
      en: resource.en,
      es: resource.es,
    };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === 404
    ) {
      return {};
    }

    throw error;
  }
}
