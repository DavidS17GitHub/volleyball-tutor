import cors from "cors";
import express from "express";
import { createReadOnlyBlobUrl } from "./blobSas.js";
import { config } from "./config.js";
import { loadLessonClips, loadLessonClipsFromCosmos } from "./lessonStore.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigins.includes("*") ? true : config.corsOrigins,
  }),
);

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/lessons", async (_request, response, next) => {
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

app.get("/api/video-url/:blobName", async (request, response, next) => {
  try {
    const videoUrl = await createReadOnlyBlobUrl(request.params.blobName);
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
