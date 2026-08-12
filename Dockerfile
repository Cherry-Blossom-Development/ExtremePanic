# Multi-stage build for production. Runs as a single container behind host
# nginx on the EC2 box; see docker-compose.ec2.yml and CLAUDE.md's "EC2
# Production Deployment" section.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Standalone tracing only bundles what's imported at runtime (@prisma/client,
# since src/lib/prisma.ts imports it) — it drops the `prisma` CLI itself,
# which is needed to run `prisma migrate deploy` in this same container. A
# clean `npm install` of just that package (not the whole project's
# node_modules/devDependencies) resolves its own dependency tree correctly
# without dragging in typescript/eslint/tailwind/etc.
RUN npm install --no-save prisma@6.19.3 && npm cache clean --force

EXPOSE 3000
CMD ["node", "server.js"]
