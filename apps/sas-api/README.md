# Volleyball Tutor SAS API

Backend API for lesson metadata and private Azure Blob Storage video access.

The frontend should call:

```text
GET /api/lessons
```

The API reads lesson metadata, signs each `videoPath` with a short-lived read SAS URL,
and returns lessons with `videoUrl` populated. In Azure, set `LESSON_STORE=cosmos` to
read lesson metadata from Azure Cosmos DB. For local development, omit
`COSMOS_CONNECTION_STRING` or set `LESSON_STORE=file` to read `public/lessons.json`.

## Azure Web App Settings

Required:

```bash
AZURE_STORAGE_ACCOUNT_NAME=volleyballtutordevsa
AZURE_STORAGE_CONTAINER_NAME=volleyballtutordevcontainer
LESSON_STORE=cosmos
COSMOS_CONNECTION_STRING=AccountEndpoint=https://volleyball-tutor-dev-cosmos-db.documents.azure.com:443/;AccountKey=...
COSMOS_DATABASE_NAME=lessons
COSMOS_CONTAINER_NAME=lessonClips
WEBSITES_PORT=8080
```

Recommended:

```bash
SAS_TTL_MINUTES=15
CORS_ORIGINS=https://your-frontend-web-app.azurewebsites.net
```

If the frontend is hosted separately, set its metadata URL to this backend:

```bash
VITE_LESSONS_METADATA_URL=https://volleyball-tutor-dev-backend-cwakevadfqdpbxhv.eastus2-01.azurewebsites.net/api/lessons
```

## Cosmos DB

Create a container inside the existing `lessons` database. The default container name
expected by the API is `lessonClips`; override it with `COSMOS_CONTAINER_NAME` if you
choose another name. A simple `/id` partition key is fine for this small lesson
catalog.

Store each lesson as one document:

```json
{
  "id": "serve-receive-outside-1",
  "title": "Serve Receive: Left Pin Tempo",
  "skillFocus": "Read setter body angle and outside hitter approach.",
  "videoPath": "volleyball1_00030997_V1-0001.mov",
  "pauseAtSeconds": 3.16,
  "correctAnswer": "outside",
  "explanation": "The pass keeps the setter inside the court and the left-side attacker starts a clear outside approach before the middle can commit.",
  "isPublished": true,
  "sortOrder": 10
}
```

`isPublished` and `sortOrder` are optional. Documents are returned when
`isPublished` is missing or `true`, then sorted by `sortOrder` in the API. The public
response omits `isPublished` and `sortOrder`.

For local development, `DefaultAzureCredential` can use Azure CLI credentials after:

```bash
az login
```

## Managed Identity

Enable system-assigned managed identity on this API Web App and grant it Storage Blob
Data Contributor at the storage account or container scope. Management-plane roles
such as Owner are not enough: user delegation SAS permissions are limited by the blob
data-plane permissions granted to the identity.

## Docker

Build from the repository root:

```bash
docker build -f apps/sas-api/Dockerfile -t volleyball-tutor-sas-api .
docker run --rm -p 8081:8080 \
  -e AZURE_STORAGE_ACCOUNT_NAME=volleyballtutordevsa \
  -e AZURE_STORAGE_CONTAINER_NAME=volleyballtutordevcontainer \
  volleyball-tutor-sas-api
```
