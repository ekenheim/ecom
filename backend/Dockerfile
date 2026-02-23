FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN ./node_modules/.bin/tsc --outDir .medusa/server --module CommonJS --moduleResolution node16 --target ES2021 --esModuleInterop --skipLibCheck medusa-config.ts

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.medusa/server/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/.medusa/server .
EXPOSE 9000
CMD ["node", "index.js"]
