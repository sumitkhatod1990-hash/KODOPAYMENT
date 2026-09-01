# Multi-Stage Production Dockerfile for QIVROPAY Payments (India MoR)

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build production bundle
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install dumb-init for clean process signal handling
RUN apk add --no-cache dumb-init

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy server code and built frontend dist
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Create persistent storage directory for db.json
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 4000

# Health check to ensure 100% uptime
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/ || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server/index.js"]
