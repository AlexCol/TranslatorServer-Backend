FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/modules/infra/database/knex/dbTypes ./src/modules/infra/database/knex/dbTypes
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN mkdir -p /data/sqlite /data/translations

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate:all && npm run prod"]
