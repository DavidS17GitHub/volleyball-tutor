# Volleyball Tutor

An initial MVP for teaching volleyball set selection from video clips.

The core lesson flow is:

1. Play a clip.
2. Pause at a configured decision timestamp.
3. Ask the learner to choose the set option: outside, pipe, center, or opposite.
4. Show feedback.
5. Continue to the next clip.

## Run locally

```bash
npm install
npm run dev
```

## Lesson metadata

Lesson metadata lives in `public/lessons.json` for the MVP. Add or edit one object
per clip:

```json
{
  "id": "serve-receive-outside-1",
  "title": "Serve Receive: Left Pin Tempo",
  "skillFocus": "Read setter body angle and outside hitter approach.",
  "videoPath": "clips/serve-receive-outside-1.mp4",
  "pauseAtSeconds": 4.2,
  "correctAnswer": "outside",
  "explanation": "Why this is the correct read."
}
```

The UI loads metadata through `src/services/lessonCatalog.ts`. By default it reads
`/lessons.json`. When a backend is ready, set `VITE_LESSONS_METADATA_URL` to an API
endpoint that returns the same JSON array.

## Video hosting

The app is ready for Azure-hosted videos. Put clip URLs in `public/lessons.json`, or set `VITE_AZURE_VIDEO_BASE_URL` and use relative `videoPath` values in the lesson data.

For the current development storage account, create a local `.env` file with:

```bash
VITE_AZURE_VIDEO_BASE_URL=https://volleyballtutordevsa.blob.core.windows.net/volleyballtutordevcontainer
```

Then point each lesson at one uploaded blob filename:

```json
{
  "videoPath": "volleyball1_00030997_V1-0001.mov"
}
```

The app will combine those into:

```text
https://volleyballtutordevsa.blob.core.windows.net/volleyballtutordevcontainer/volleyball1_00030997_V1-0001.mov
```

For production, use Azure Blob Storage static URLs or Azure Media Services/Streaming Endpoint URLs with CORS enabled for the app domain.

## Database direction

Do not connect the browser directly to MongoDB or Cosmos DB. Keep database credentials
on a backend API, then have the UI call that API through `VITE_LESSONS_METADATA_URL`.

For this MVP, `public/lessons.json` is the cheapest option because lesson metadata is
small and changes manually. For an Azure-hosted production app, Azure Cosmos DB is the
natural next choice because it has an Azure-native free tier for small workloads and
keeps hosting, videos, and metadata under one cloud account. MongoDB Atlas is still a
good option if portability or MongoDB-specific tooling matters more.
