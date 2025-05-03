# Use an official Node.js runtime as a parent image
# Pinning to Node 20 based on prerequisites
FROM node:20-slim AS base

# Set the working directory
WORKDIR /app

# Install dependencies required for yarn and potentially other native modules
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install yarn globally (assuming yarn classic v1 is needed as per readme hints, though quickstart uses default yarn)
# If v3+ is actually used, adjust this. For now, let's stick to the default yarn that comes with Node 20 image.
# RUN npm install -g yarn

# --- Builder Stage ---
FROM base AS builder

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
# Use --frozen-lockfile for CI/CD environments
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the project
# Ensure the build script exists in package.json
RUN yarn build

# --- Production Stage ---
FROM base AS production

# Copy built artifacts and necessary files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./package.json
# Add any other necessary files like static assets, config files if needed

# Expose port 9000
EXPOSE 9000

# Define the command to run the application
# Replace 'start' with the actual production start script from package.json if different
# Note: Migrations should ideally be run separately (e.g., Kubernetes Job or init container), not here.
CMD ["yarn", "start"] 