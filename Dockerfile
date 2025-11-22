# Use official Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Run the app directly with bun
# Note: Use "bun" not "bun run" to avoid Bun's auto-serve conflicting with our explicit serve() call
CMD ["bun", "src/index.ts"]
