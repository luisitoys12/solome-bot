#!/bin/bash

set -euo pipefail

# Runs bot+dashboard in background for long-lived Codespaces sessions.
PORT=${PORT:-3000}
HOST=${HOST:-127.0.0.1}

if [ -z "${DASHBOARD_ACCESS_TOKEN:-}" ]; then
  DASHBOARD_ACCESS_TOKEN="$(openssl rand -hex 16)"
fi

export PORT HOST DASHBOARD_ACCESS_TOKEN

bash ./start-bot.sh

echo ""
echo "✅ Codespace runtime configured"
echo "➡️  Keep forwarded port ${PORT} in Private visibility"
echo "🔐 If you expose it, send header: x-dashboard-token: ${DASHBOARD_ACCESS_TOKEN}"
