# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /app

COPY apps/sas-api/package*.json ./
RUN npm ci

COPY apps/sas-api ./
COPY public ./public
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY apps/sas-api/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

EXPOSE 8080

CMD ["node", "dist/server.js"]
