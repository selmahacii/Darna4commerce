# ═══════════════════════════════════════════════════════════════
# Darna E-Commerce — Multi-Stage Dockerfile
# Uses bun as the runtime and package manager
# ═══════════════════════════════════════════════════════════════

# ─── Stage 1: Install Dependencies ──────────────────────────
FROM oven/bun:1 AS deps

WORKDIR /app

# Copy frontend package files
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Copy backend package files
COPY mini-services/backend/package.json ./mini-services/backend/
COPY mini-services/backend/bun.lock ./mini-services/backend/
COPY mini-services/backend/prisma ./mini-services/backend/prisma/

# Install frontend dependencies
RUN bun install --frozen-lockfile

# Install backend dependencies
WORKDIR /app/mini-services/backend
RUN bun install --frozen-lockfile

# ─── Stage 2: Build Next.js Frontend ────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy frontend source
COPY package.json bun.lock next.config.ts tsconfig.json ./
COPY prisma ./prisma/
COPY public ./public/
COPY src ./src/

# Copy backend source (needed if frontend imports it)
COPY mini-services ./mini-services/

# Install all frontend dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client for frontend build
ENV DATABASE_URL="file:/app/db/custom.db"
RUN bunx prisma generate

# Build Next.js standalone output
RUN bun run build

# ─── Stage 3: Production Image ──────────────────────────────
FROM oven/bun:1 AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/db/custom.db"
ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 darna && \
    adduser --system --uid 1001 darna

# ─── Copy Frontend Build ────────────────────────────────────
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static/
COPY --from=builder /app/public ./public/

# ─── Copy Frontend Prisma ───────────────────────────────────
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/

# ─── Copy Backend ───────────────────────────────────────────
COPY --from=deps /app/mini-services/backend/node_modules ./mini-services/backend/node_modules/
COPY --from=builder /app/mini-services/backend ./mini-services/backend/

# Copy package.json for prisma CLI
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules/.package-lock.json ./node_modules/.package-lock.json 2>/dev/null || true

# ─── Entrypoint Script ──────────────────────────────────────
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# ─── Create Directories ─────────────────────────────────────
RUN mkdir -p /app/db && chown -R darna:darna /app

# Switch to non-root user
USER darna

# Create db volume directory owned by user
RUN mkdir -p /app/db

# Expose frontend port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -sf http://localhost:3000/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
