import path from "node:path";

const required = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const lessonStore =
  process.env.LESSON_STORE ?? (process.env.COSMOS_CONNECTION_STRING ? "cosmos" : "file");

if (!["cosmos", "file"].includes(lessonStore)) {
  throw new Error("LESSON_STORE must be either 'cosmos' or 'file'");
}

export const config = {
  port: Number(process.env.PORT ?? 8080),
  storageAccountName: required("AZURE_STORAGE_ACCOUNT_NAME"),
  storageContainerName: required("AZURE_STORAGE_CONTAINER_NAME"),
  lessonStore,
  lessonsFilePath:
    process.env.LESSONS_FILE_PATH ?? path.resolve(process.cwd(), "public", "lessons.json"),
  cosmosConnectionString:
    lessonStore === "cosmos" ? required("COSMOS_CONNECTION_STRING") : undefined,
  cosmosDatabaseName: process.env.COSMOS_DATABASE_NAME ?? "lessons",
  cosmosContainerName: process.env.COSMOS_CONTAINER_NAME ?? "lessonClips",
  sasTtlMinutes: Number(process.env.SAS_TTL_MINUTES ?? 15),
  corsOrigins: (process.env.CORS_ORIGINS ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
