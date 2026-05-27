import path from "node:path";

const required = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 8080),
  storageAccountName: required("AZURE_STORAGE_ACCOUNT_NAME"),
  storageContainerName: required("AZURE_STORAGE_CONTAINER_NAME"),
  lessonsFilePath:
    process.env.LESSONS_FILE_PATH ?? path.resolve(process.cwd(), "public", "lessons.json"),
  sasTtlMinutes: Number(process.env.SAS_TTL_MINUTES ?? 15),
  corsOrigins: (process.env.CORS_ORIGINS ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
