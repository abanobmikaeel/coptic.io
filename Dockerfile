# Use official Bun image (for runtime)
FROM oven/bun:1 AS base
WORKDIR /app

# Install pnpm for monorepo dependency management
RUN npm install -g pnpm

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml* ./

# Copy all package.json files for dependency resolution
COPY packages/core/package.json ./packages/core/
COPY packages/client/package.json ./packages/client/
COPY packages/data/package.json ./packages/data/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build packages (core must be built before others can use it)
RUN pnpm build:packages

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run the API with bun
CMD ["bun", "apps/api/src/index.ts"]
