# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app

ARG VITE_AZURE_VIDEO_BASE_URL=https://volleyballtutordevsa.blob.core.windows.net/volleyballtutordevcontainer
ARG VITE_LESSONS_METADATA_URL=/lessons.json
ENV VITE_AZURE_VIDEO_BASE_URL=$VITE_AZURE_VIDEO_BASE_URL
ENV VITE_LESSONS_METADATA_URL=$VITE_LESSONS_METADATA_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
