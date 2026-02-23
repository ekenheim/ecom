FROM node:20-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN corepack enable && yarn install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY . .

# Build-time env vars required by Next.js — values are injected at runtime via
# the entrypoint script; these placeholders allow the build to succeed.
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_placeholder
ARG NEXT_PUBLIC_BASE_URL=http://localhost:8000
ARG NEXT_PUBLIC_DEFAULT_REGION=us
ARG NEXT_PUBLIC_STRIPE_KEY=
ARG NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY=
ARG NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID=

ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION
ENV NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY
ENV NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID=$NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID

RUN corepack enable && yarn build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8000
ENV PORT=8000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
