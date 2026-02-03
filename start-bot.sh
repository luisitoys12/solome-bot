#!/bin/bash

echo "🎵 Starting Baba Radio Bot..."
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Kill existing bot process
echo "🔄 Stopping existing bot..."
pkill -f "node.*index.js" 2>/dev/null
sleep 2

# Start the bot in background
PORT=${PORT:-3000}
echo "🚀 Starting bot + dashboard on port ${PORT}..."
nohup env PORT=${PORT} npm start > bot.log 2>&1 &
BOT_PID=$!

sleep 3

# Check if bot started successfully
if ps -p $BOT_PID > /dev/null; then
    echo "✅ Bot started successfully! (PID: $BOT_PID)"
    echo "📋 View logs: tail -f bot.log"
    echo "🛑 Stop bot: pkill -f 'node.*index.js'"
else
    echo "❌ Failed to start bot. Check bot.log for errors."
    exit 1
fi
