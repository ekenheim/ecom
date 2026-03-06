FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable
COPY . .
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable
COPY --from=builder /app/.medusa/server/package.json ./
RUN yarn install --production
COPY --from=builder /app/.medusa/server .
RUN chown -R node:node /app
USER node
EXPOSE 9000
CMD ["node", "index.js"]
