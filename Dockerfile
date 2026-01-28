# Use Node 24 with pnpm
FROM node:24-slim AS base
WORKDIR /app

# Install Bun for runtime and enable corepack for pnpm
RUN apt-get update && apt-get install -y curl unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun && \
    corepack enable && corepack prepare pnpm@10.28.1 --activate && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml ./

# Copy all package.json files for dependency resolution
COPY packages/core/package.json ./packages/core/
COPY packages/client/package.json ./packages/client/
COPY packages/data/package.json ./packages/data/
COPY apps/api/package.json ./apps/api/

# Install dependencies (skip prepare script - source not copied yet)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Build packages (core must be built before others can use it)
RUN pnpm build:packages

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run the API with Bun
CMD ["bun", "apps/api/src/index.ts"]
