#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║   🌍 Darna E-Commerce — Docker Entrypoint             ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# ─── Configuration ───────────────────────────────────────────
export DATABASE_URL="file:/app/db/custom.db"
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3003}"

# Ensure db directory exists
mkdir -p /app/db

# ─── Backend: Prisma Setup ──────────────────────────────────
echo "🔧 Setting up backend Prisma..."
cd /app/mini-services/backend

# Generate Prisma client
bunx prisma generate

# Push schema (creates tables if they don't exist)
bunx prisma db push --accept-data-loss 2>/dev/null || true

# ─── Seed Database if Empty ──────────────────────────────────
echo "🌱 Checking if database needs seeding..."
SEED_COUNT=$(bunx prisma db execute --stdin <<< "SELECT COUNT(*) FROM User;" 2>/dev/null | tail -1 | tr -d ' ' || echo "0")

if [ "$SEED_COUNT" = "0" ] || [ -z "$SEED_COUNT" ]; then
  echo "   Database is empty — seeding..."
  cd /app/mini-services/backend
  bun prisma/seed.ts
  echo "   ✅ Seeding complete"
else
  echo "   ✅ Database already has data (${SEED_COUNT} users) — skipping seed"
fi

# ─── Frontend: Prisma Setup ──────────────────────────────────
echo "🔧 Setting up frontend Prisma..."
cd /app
bunx prisma generate

echo ""

# ─── Start Backend in Background ────────────────────────────
echo "🚀 Starting backend API server..."
cd /app/mini-services/backend
PORT=$PORT NODE_ENV=$NODE_ENV DATABASE_URL="$DATABASE_URL" \
  bun src/index.ts &
BACKEND_PID=$!

# Wait briefly for backend to be ready
echo "   Waiting for backend to be ready..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:$PORT/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend is healthy (PID: $BACKEND_PID)"
    break
  fi
  sleep 0.5
done

if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo "   ❌ Backend failed to start!"
  exit 1
fi

echo ""

# ─── Start Frontend in Foreground ────────────────────────────
echo "🚀 Starting Next.js frontend on port 3000..."
echo ""
cd /app
NODE_ENV=$NODE_ENV DATABASE_URL="$DATABASE_URL" \
  exec bun .next/standalone/server.js
