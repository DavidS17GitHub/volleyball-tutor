import path from "node:path";

const required = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const optionalRequired = (condition: boolean, name: string) =>
  condition ? required(name) : process.env[name];

const booleanFromEnv = (name: string, defaultValue: boolean) => {
  const value = process.env[name];

  if (value === undefined) {
    return defaultValue;
  }

  if (["1", "true", "yes"].includes(value.toLowerCase())) {
    return true;
  }

  if (["0", "false", "no"].includes(value.toLowerCase())) {
    return false;
  }

  throw new Error(`${name} must be true or false`);
};

const lessonStore =
  process.env.LESSON_STORE ?? (process.env.COSMOS_CONNECTION_STRING ? "cosmos" : "file");

if (!["cosmos", "file"].includes(lessonStore)) {
  throw new Error("LESSON_STORE must be either 'cosmos' or 'file'");
}

const authRequired = booleanFromEnv("AUTH_REQUIRED", false);
const requirePremiumAccess = booleanFromEnv("REQUIRE_PREMIUM_ACCESS", authRequired);

if (requirePremiumAccess && !authRequired) {
  throw new Error("AUTH_REQUIRED must be true when REQUIRE_PREMIUM_ACCESS is true");
}

const needsCosmos = lessonStore === "cosmos" || authRequired || requirePremiumAccess;

export const config = {
  port: Number(process.env.PORT ?? 8080),
  storageAccountName: required("AZURE_STORAGE_ACCOUNT_NAME"),
  storageContainerName: required("AZURE_STORAGE_CONTAINER_NAME"),
  lessonStore,
  lessonsFilePath:
    process.env.LESSONS_FILE_PATH ?? path.resolve(process.cwd(), "public", "lessons.json"),
  cosmosConnectionString: needsCosmos ? required("COSMOS_CONNECTION_STRING") : undefined,
  cosmosDatabaseName: process.env.COSMOS_DATABASE_NAME ?? "lessons",
  cosmosContainerName: process.env.COSMOS_CONTAINER_NAME ?? "lessonClips",
  cosmosUserProfilesContainerName: process.env.COSMOS_USER_PROFILES_CONTAINER_NAME ?? "userProfiles",
  authRequired,
  authJwksUri: optionalRequired(authRequired, "AUTH_JWKS_URI"),
  authIssuer: optionalRequired(authRequired, "AUTH_ISSUER"),
  authAudience: optionalRequired(authRequired, "AUTH_AUDIENCE"),
  requirePremiumAccess,
  sasTtlMinutes: Number(process.env.SAS_TTL_MINUTES ?? 15),
  corsOrigins: (process.env.CORS_ORIGINS ?? "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
