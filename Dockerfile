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
CMD ["bun", "run", "src/index.ts"]
