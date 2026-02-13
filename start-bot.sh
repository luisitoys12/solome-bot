#!/bin/bash

set -euo pipefail

echo "🎵 Starting Solome Bot..."
echo "================================"
echo ""

# Check if .env exists (optional if secrets are injected as env vars)
if [ ! -f .env ]; then
    echo "ℹ️ .env file not found, continuing with environment variables."
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Kill existing bot process
echo "🔄 Stopping existing bot..."
pkill -f "node.*index.js" 2>/dev/null || true
sleep 2

PORT=${PORT:-3000}
HOST=${HOST:-127.0.0.1}

echo "🚀 Starting bot + dashboard on ${HOST}:${PORT}..."
nohup env PORT="${PORT}" HOST="${HOST}" npm start > bot.log 2>&1 &
BOT_PID=$!

sleep 3

if ps -p "$BOT_PID" > /dev/null; then
    echo "✅ Bot started successfully! (PID: $BOT_PID)"
    echo "🌐 Dashboard: http://${HOST}:${PORT}"
    echo "📋 View logs: tail -f bot.log"
    echo "🛑 Stop bot: pkill -f 'node.*index.js'"
else
    echo "❌ Failed to start bot. Check bot.log for errors."
    exit 1
fi
