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

## Video hosting

The app is ready for Azure-hosted videos. Put clip URLs in `src/data/lessons.ts`, or set `VITE_AZURE_VIDEO_BASE_URL` and use relative `videoPath` values in the lesson data.

For production, use Azure Blob Storage static URLs or Azure Media Services/Streaming Endpoint URLs with CORS enabled for the app domain.
