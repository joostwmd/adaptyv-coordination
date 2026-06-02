FROM node:22-alpine

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter server build

WORKDIR /app/apps/server
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.mjs"]
