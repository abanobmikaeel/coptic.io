# Build stage with pnpm
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/core/package.json ./packages/core/
COPY packages/data/package.json ./packages/data/

# Copy source files before install (needed for prepare script)
COPY apps/api ./apps/api
COPY packages/core ./packages/core
COPY packages/data ./packages/data

# Install dependencies (prepare script will now find source files)
RUN pnpm install --frozen-lockfile

# Production stage with bun
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Copy everything from builder
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/tsconfig.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages/core ./packages/core
COPY --from=builder /app/packages/data ./packages/data

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1))"

# Run with bun
CMD ["bun", "run", "apps/api/src/index.ts"]
