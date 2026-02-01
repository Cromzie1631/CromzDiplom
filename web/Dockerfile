FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
ARG API_UPSTREAM=http://api:3001
ENV API_UPSTREAM=$API_UPSTREAM
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Download noVNC for /novnc/ (same-origin, no mixed content)
RUN apk add --no-cache wget && \
    mkdir -p /app/public/novnc && cd /tmp && \
    wget -q https://github.com/novnc/noVNC/archive/refs/tags/v1.4.0.tar.gz -O novnc.tar.gz && \
    tar xzf novnc.tar.gz && \
    cp -r noVNC-1.4.0/* /app/public/novnc/ && \
    rm -rf novnc.tar.gz noVNC-1.4.0

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
