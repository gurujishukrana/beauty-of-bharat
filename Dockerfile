# Production image for a VPS / any Docker host. See DEPLOY.md ("Docker / VPS").
# The build pre-renders pages and runs migrations, so it needs the database: build with
#   docker compose --profile app build
# which passes .env as a BuildKit secret and uses host networking to reach Postgres.

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_OUTPUT_STANDALONE=1
RUN --mount=type=secret,id=env,target=/app/.env corepack enable pnpm && pnpm build

FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 MEDIA_DIR=/app/media
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/assets ./src/assets
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
