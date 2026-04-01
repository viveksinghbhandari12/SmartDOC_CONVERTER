# Build frontend, run API (serves client/dist when NODE_ENV=production)
FROM node:22-alpine AS frontend
WORKDIR /build
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm ci
COPY client ./client
RUN cd client && npm run build

FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm ci --omit=dev
COPY server ./server
COPY --from=frontend /build/client/dist ./client/dist
WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server.js"]
