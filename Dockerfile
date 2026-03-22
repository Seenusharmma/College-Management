FROM node:20-alpine AS base

FROM node:20-alpine AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

FROM node:20-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend ./
RUN npm ci
RUN npm run build

FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend ./
RUN npm ci
RUN npm run build

FROM node:20-alpine AS frontend-runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=frontend-build /app/frontend/.next/ ./.next/
COPY --from=frontend-build /app/frontend/public/ ./public/
COPY --from=frontend-build /app/frontend/node_modules/ ./node_modules/
COPY --from=frontend-build /app/frontend/package.json ./
EXPOSE 3000
CMD ["npm", "start"]

FROM node:20-alpine AS backend-runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-build /app/backend/dist/ ./dist/
COPY --from=backend-build /app/backend/node_modules/ ./node_modules/
COPY --from=backend-build /app/backend/package.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
