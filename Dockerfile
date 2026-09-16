# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM base AS build
# NEXT_PUBLIC_* values are inlined at build time; pass them with --build-arg.
# Runtime-only equivalents (SITE_URL, ICP_LICENSE, PSB_LICENSE) can instead be
# supplied with `docker run -e ...` and take precedence on the server.
ARG NEXT_PUBLIC_SITE_URL=https://mitesla-atelier.com
ARG NEXT_PUBLIC_ICP=
ARG NEXT_PUBLIC_PSB=
ARG NEXT_PUBLIC_APP_VERSION=1.0.0
ARG ALLOW_INSECURE_HTTP=false
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DOCKER_BUILD=1 NODE_ENV=production \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ICP=$NEXT_PUBLIC_ICP \
    NEXT_PUBLIC_PSB=$NEXT_PUBLIC_PSB \
    NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION \
    ALLOW_INSECURE_HTTP=$ALLOW_INSECURE_HTTP
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
