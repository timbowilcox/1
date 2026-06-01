# Server (API) image. The Next.js client deploys separately (Vercel).
# Build context is the repo root so the pnpm workspace + shared package resolve.

# ---------- build ----------
FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable

# Full workspace (node_modules excluded via .dockerignore so we install fresh
# and get the correct linux-native binaries for sharp/bcrypt/prisma).
COPY . .

RUN pnpm install --frozen-lockfile \
  && pnpm --filter shared build \
  && pnpm --filter server exec prisma generate \
  && pnpm --filter server build

# ---------- runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy the built workspace as-is (incl. node_modules with the generated Prisma
# client + native binaries) — reliable for a pnpm workspace.
COPY --from=build /app /app

EXPOSE 4000
# Run the compiled server directly (no rebuild).
CMD ["node", "apps/server/dist/app.js"]
