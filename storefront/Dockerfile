# Use an official Node.js runtime as a parent image
# Pinning to Node 20 based on prerequisites
FROM node:20-slim AS base

# Set the working directory
WORKDIR /app

# Install dependencies required for yarn
# RUN apt-get update && apt-get install -y --no-install-recommends ... && rm -rf /var/lib/apt/lists/*

# Install yarn globally (using v1 as hinted in README)
# Note: The node:20-slim image comes with corepack which can manage yarn versions.
# Enabling corepack and setting yarn version might be cleaner.
# Let's enable corepack to manage yarn version specified in package.json (assuming it specifies yarn v1)
RUN corepack enable

# --- Dependencies Stage ---
FROM base AS deps

# Copy package.json and yarn.lock
COPY package.json yarn.lock* ./
# Ensure package.json specifies the correct yarn version if using corepack
# e.g., "packageManager": "yarn@1.22.19"

# Enable Corepack within this stage
RUN corepack enable

# Install dependencies
# Use --frozen-lockfile for CI/CD environments
RUN yarn install --frozen-lockfile

# --- Builder Stage ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Define build arguments for public environment variables
# These need to be available at build time for Next.js
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SEARCH_API_KEY

# Set build-time environment variables
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SEARCH_API_KEY=$NEXT_PUBLIC_SEARCH_API_KEY

# Build the Next.js application
# Ensure the build script exists in package.json
RUN yarn build

# --- Production Stage ---
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./ 
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Set the user to node (non-root user provided by the base image)
USER node

# Expose port 3000 (standard Next.js port)
EXPOSE 3000

# Define the command to run the application
# Uses the Next.js standalone output
CMD ["node", "server.js"] 