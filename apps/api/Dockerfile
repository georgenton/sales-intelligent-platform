FROM node:24.19.0-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /workspace

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm --filter @sip/api db:generate && pnpm --filter @sip/api build
RUN pnpm --filter @sip/api deploy --prod --legacy /app
RUN cp -R apps/api/dist /app/dist && cp -R apps/api/prisma /app/prisma
RUN cd /app && node node_modules/prisma/build/index.js generate --schema prisma/schema.prisma

FROM node:24.19.0-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
COPY --from=builder --chown=nestjs:nodejs /app ./
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
