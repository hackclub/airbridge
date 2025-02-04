# Use Node.js LTS (Long Term Support) as base image
FROM node:18-slim

# Create app directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Expose the port (you'll need to set this in your environment)
EXPOSE 5000

# Start the application
CMD ["yarn", "start"] 