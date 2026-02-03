#!/bin/bash

echo "🧪 Starting Baba Radio dashboard preview..."
echo "=========================================="
echo ""

PORT=${PORT:-3000}
echo "🌐 Dashboard running on port ${PORT}"

nohup env PORT=${PORT} DASHBOARD_ONLY=true npm start > dashboard.log 2>&1 &
DASH_PID=$!

sleep 2

if ps -p $DASH_PID > /dev/null; then
    echo "✅ Dashboard started successfully! (PID: $DASH_PID)"
    echo "📋 View logs: tail -f dashboard.log"
    echo "🛑 Stop dashboard: pkill -f 'node.*index.js'"
else
    echo "❌ Failed to start dashboard. Check dashboard.log for errors."
    exit 1
fi
