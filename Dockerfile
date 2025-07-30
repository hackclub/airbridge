# Use Bun as base image
FROM oven/bun:1-slim

# Install curl for coolify healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose the port (you'll need to set this in your environment)
EXPOSE 5000

# Start the application
CMD ["bun", "start"] 