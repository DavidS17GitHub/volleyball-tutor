import cors from "cors";
import express from "express";
import { attachAuthenticatedUser, requireAuthenticatedUser } from "./auth.js";
import { createReadOnlyBlobUrl } from "./blobSas.js";
import { config } from "./config.js";
import { loadLessonClips, loadLessonClipsFromCosmos } from "./lessonStore.js";
import { getOrCreateUserProfile, hasPremiumAccess } from "./userProfileStore.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigins.includes("*") ? true : config.corsOrigins,
  }),
);
app.use(express.json());
app.use(attachAuthenticatedUser);

const requirePremiumUser: express.RequestHandler = async (request, response, next) => {
  if (!config.requirePremiumAccess) {
    next();
    return;
  }

  if (!request.user) {
    response.status(401).json({ error: "Authentication is required" });
    return;
  }

  try {
    const profile = await getOrCreateUserProfile({
      userId: request.user.id,
      email: request.user.email,
      displayName: request.user.displayName,
    });

    if (!hasPremiumAccess(profile)) {
      response.status(403).json({
        error: "Premium access is required",
        role: profile.role,
        planStatus: profile.planStatus,
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/me", requireAuthenticatedUser, async (request, response, next) => {
  if (!config.authRequired) {
    response.json({ authRequired: false });
    return;
  }

  if (!request.user) {
    response.status(401).json({ error: "Authentication is required" });
    return;
  }

  try {
    const profile = await getOrCreateUserProfile({
      userId: request.user.id,
      email: request.user.email,
      displayName: request.user.displayName,
    });

    response.setHeader("Cache-Control", "no-store");
    response.json({
      user: {
        id: request.user.id,
        email: request.user.email,
        displayName: request.user.displayName,
      },
      profile,
      hasPremiumAccess: hasPremiumAccess(profile),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/lessons", requirePremiumUser, async (_request, response, next) => {
  try {
    const lessons = await (async () => {
      if (config.lessonStore === "file") {
        return loadLessonClips(config.lessonsFilePath);
      }

      if (!config.cosmosConnectionString) {
        throw new Error("Missing required environment variable: COSMOS_CONNECTION_STRING");
      }

      return loadLessonClipsFromCosmos({
        connectionString: config.cosmosConnectionString,
        databaseName: config.cosmosDatabaseName,
        containerName: config.cosmosContainerName,
      });
    })();

    const signedLessons = await Promise.all(
      lessons.map(async (lesson) => {
        if (!lesson.videoPath) {
          return lesson;
        }

        return {
          ...lesson,
          videoUrl: await createReadOnlyBlobUrl(lesson.videoPath),
        };
      }),
    );

    response.setHeader("Cache-Control", "no-store");
    response.json(signedLessons);
  } catch (error) {
    next(error);
  }
});

app.get("/api/video-url/:blobName", requirePremiumUser, async (request, response, next) => {
  try {
    const { blobName } = request.params;

    if (typeof blobName !== "string") {
      response.status(400).json({ error: "Blob name is required" });
      return;
    }

    const videoUrl = await createReadOnlyBlobUrl(blobName);
    response.setHeader("Cache-Control", "no-store");
    response.json({ videoUrl });
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    response.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected API error",
    });
  },
);

app.listen(config.port, () => {
  console.log(`SAS API listening on port ${config.port}`);
});
