# Build SSR (lineup) — Nx monorepo
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && node scripts/patch-primeicons-font-display.mjs

COPY . .

RUN npx nx run lineup:build:production --skip-nx-cache

# Runtime: solo artefactos y dependencias de producción
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

COPY package.json package-lock.json ./
COPY scripts/patch-primeicons-font-display.mjs ./scripts/patch-primeicons-font-display.mjs
RUN npm ci --omit=dev --ignore-scripts && node scripts/patch-primeicons-font-display.mjs && npm cache clean --force

COPY --from=builder /app/dist/apps/lineup ./dist/apps/lineup

EXPOSE 4000

USER node

CMD ["node", "dist/apps/lineup/server/server.mjs"]
