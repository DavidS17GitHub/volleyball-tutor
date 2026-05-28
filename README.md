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

## Run with Docker

Build and run the production container:

```bash
docker build -t volleyball-tutor .
docker run --rm -p 8080:8080 volleyball-tutor
```

Then open `http://localhost:8080`.

For Azure Web App for Containers, configure the app setting:

```bash
WEBSITES_PORT=8080
```

The frontend container writes `/config.js` at startup from Azure App Settings. For
private Storage Account access, point the frontend at the SAS API instead of directly
at Blob Storage:

```bash
VITE_LESSONS_METADATA_URL=https://your-sas-api.azurewebsites.net/api/lessons
```

Do not set `VITE_AZURE_VIDEO_BASE_URL` in production when the Storage Account has
anonymous access disabled. The SAS API will return signed `videoUrl` values.

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

## Private video access

The static frontend cannot securely access a private Storage Account by itself. The
repository includes a separate backend scaffold in `apps/sas-api` that can be deployed
as another Azure Web App. It uses managed identity to generate short-lived read-only
SAS URLs for private blobs.

The backend Web App managed identity needs a blob data-plane role such as Storage Blob
Data Contributor on the storage account or container. Management-plane roles like Owner
do not grant the blob read permission needed by a user delegation SAS.

After deploying that API, set the frontend build variable:

```bash
VITE_LESSONS_METADATA_URL=https://your-sas-api.azurewebsites.net/api/lessons
```
