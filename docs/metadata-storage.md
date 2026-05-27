# Lesson Metadata Storage

## Recommendation

Keep lesson metadata in `public/lessons.json` while the app is in MVP mode. It costs
nothing, is easy to review in pull requests, and avoids adding backend credentials
before there is an admin workflow.

When metadata needs runtime editing, add a small backend API and store the same lesson
objects in a document database. The frontend should keep calling one metadata URL; it
should not connect directly to a database.

## Provider Choice

Prefer Azure Cosmos DB if the app, videos, and deployment are already on Azure. Its
lifetime free tier can cover small production workloads when enabled on a provisioned
throughput account, and the operational model fits Azure-hosted video metadata.

MongoDB Atlas is a reasonable alternative when portability matters or the team already
knows MongoDB. Its free/flex tiers are friendly for prototypes, but the app does not
currently need MongoDB-specific features.

## Collection Shape

Store each clip as one document:

```json
{
  "id": "serve-receive-outside-1",
  "title": "Serve Receive: Left Pin Tempo",
  "skillFocus": "Read setter body angle and outside hitter approach.",
  "videoPath": "clips/serve-receive-outside-1.mp4",
  "pauseAtSeconds": 4.2,
  "correctAnswer": "outside",
  "explanation": "Why this is the correct read.",
  "isPublished": true,
  "sortOrder": 10
}
```

The public API should return only published clips, sorted by `sortOrder`, as the same
array shape currently used by `public/lessons.json`.
