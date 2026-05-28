# Volleyball Tutor SAS API

Backend API for private Azure Blob Storage video access.

The frontend should call:

```text
GET /api/lessons
```

The API reads `public/lessons.json`, signs each `videoPath` with a short-lived read
SAS URL, and returns lessons with `videoUrl` populated.

## Azure Web App Settings

Required:

```bash
AZURE_STORAGE_ACCOUNT_NAME=volleyballtutordevsa
AZURE_STORAGE_CONTAINER_NAME=volleyballtutordevcontainer
WEBSITES_PORT=8080
```

Recommended:

```bash
SAS_TTL_MINUTES=15
CORS_ORIGINS=https://your-frontend-web-app.azurewebsites.net
```

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
