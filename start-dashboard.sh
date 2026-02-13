#!/bin/bash

set -euo pipefail

echo "🧪 Starting Solome Bot dashboard preview..."
echo "==========================================="
echo ""

PORT=${PORT:-3000}
HOST=${HOST:-127.0.0.1}

# Optional protection token for forwarded ports
if [ -z "${DASHBOARD_ACCESS_TOKEN:-}" ]; then
  DASHBOARD_ACCESS_TOKEN="$(openssl rand -hex 16)"
  export DASHBOARD_ACCESS_TOKEN
fi

echo "🌐 Dashboard running on http://${HOST}:${PORT}"
echo "🔐 Header required: x-dashboard-token: ${DASHBOARD_ACCESS_TOKEN}"

nohup env PORT="${PORT}" HOST="${HOST}" DASHBOARD_ONLY=true DASHBOARD_ACCESS_TOKEN="${DASHBOARD_ACCESS_TOKEN}" npm start > dashboard.log 2>&1 &
DASH_PID=$!

sleep 2

if ps -p "$DASH_PID" > /dev/null; then
    echo "✅ Dashboard started successfully! (PID: $DASH_PID)"
    echo "📋 View logs: tail -f dashboard.log"
    echo "🛑 Stop dashboard: pkill -f 'node.*index.js'"
else
    echo "❌ Failed to start dashboard. Check dashboard.log for errors."
    exit 1
fi
