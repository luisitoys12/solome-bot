#!/bin/bash

# ====================================
# 🎵 Solome Bot 4.0 - Start Script
# ====================================
# Este script inicia:
# - Lavalink (Docker)
# - Bot de Discord
# - Dashboard web (opcional)
# ====================================

set -e

echo ""
echo "  _____ ____  _     ____  __  __ _____   ____   ____ _____"
echo " / ____/ __ \\| |   / __ \\|  \\/  |  __| |  _ \\ / __ \\_   _|"
echo "| (___| |  | | |  | |  | | \\  / | |__  | |_) | |  | || |"
echo " \\___ \\| |  | | |  | |  | | |\\/| |  __| |  _ <| |  | || |"
echo " ____) | |__| | |__| |__| | |  | | |____| |_) | |__| || |_"
echo "|_____/ \\____/|______\\____/|_|  |_|______|____/ \\____/_____|  v4.0"
echo ""
echo "🎵 Baba Radio + Solome AI - Iniciando sistema completo..."
echo "========================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Verificar requisitos
echo "🔍 Verificando requisitos..."

if [ ! -f .env ]; then
    print_error ".env no encontrado!"
    echo "   Por favor copia .env.example a .env y confíguralo."
    echo "   Comando: cp .env.example .env"
    exit 1
fi
print_status ".env encontrado"

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    exit 1
fi
print_status "Node.js $(node -v)"

if ! command -v docker &> /dev/null; then
    print_warning "Docker no encontrado - Lavalink local no estará disponible"
    DOCKER_AVAILABLE=false
else
    print_status "Docker instalado"
    DOCKER_AVAILABLE=true
fi

echo ""

# 2. Instalar dependencias si es necesario
if [ ! -d node_modules ]; then
    echo "📦 Instalando dependencias..."
    npm install
    print_status "Dependencias instaladas"
else
    print_status "Dependencias ya instaladas"
fi

echo ""

# 3. Iniciar Lavalink (opcional)
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 Iniciando Lavalink en Docker..."
    
    if [ -f docker-compose.yml ]; then
        docker compose up -d lavalink 2>/dev/null || docker-compose up -d lavalink 2>/dev/null || {
            print_warning "No se pudo iniciar Lavalink. El bot usará nodos públicos."
        }
        
        if docker ps | grep -q lavalink; then
            print_status "Lavalink corriendo en localhost:2333"
        else
            print_warning "Lavalink no inició, usando solo nodos públicos"
        fi
    else
        print_warning "docker-compose.yml no encontrado - saltando Lavalink local"
    fi
else
    print_warning "Saltando Lavalink local (Docker no disponible)"
fi

echo ""

# 4. Detener procesos existentes
echo "🔄 Deteniendo procesos anteriores..."
pkill -f "node.*index.js" 2>/dev/null && sleep 2
print_status "Procesos anteriores detenidos"

echo ""

# 5. Determinar modo de inicio
MODE="${1:-full}"
PORT=${PORT:-3000}

case $MODE in
    bot)
        echo "🤖 Iniciando solo el BOT..."
        nohup npm start > bot.log 2>&1 &
        BOT_PID=$!
        sleep 3
        
        if ps -p $BOT_PID > /dev/null; then
            print_status "Bot iniciado (PID: $BOT_PID)"
            echo ""
            echo "📊 Información:"
            echo "   Logs: tail -f bot.log"
            echo "   Detener: pkill -f 'node.*index.js'"
            echo "   O usa: pm2 stop solome-bot (si usas PM2)"
        else
            print_error "Error al iniciar el bot. Revisa bot.log"
            exit 1
        fi
        ;;
        
    dashboard)
        echo "🌐 Iniciando solo el DASHBOARD..."
        nohup env PORT=${PORT} DASHBOARD_ONLY=true npm start > dashboard.log 2>&1 &
        DASH_PID=$!
        sleep 3
        
        if ps -p $DASH_PID > /dev/null; then
            print_status "Dashboard iniciado en http://localhost:${PORT} (PID: $DASH_PID)"
            echo ""
            echo "📊 Información:"
            echo "   URL: http://localhost:${PORT}"
            echo "   Logs: tail -f dashboard.log"
            echo "   Detener: pkill -f 'node.*index.js'"
        else
            print_error "Error al iniciar dashboard. Revisa dashboard.log"
            exit 1
        fi
        ;;
        
    full|*)
        echo "🚀 Iniciando BOT + DASHBOARD..."
        nohup env PORT=${PORT} npm start > app.log 2>&1 &
        APP_PID=$!
        sleep 3
        
        if ps -p $APP_PID > /dev/null; then
            print_status "Solome Bot 4.0 iniciado completamente (PID: $APP_PID)"
            echo ""
            echo "📊 Información:"
            echo "   Bot: Conectado a Discord"
            echo "   Dashboard: http://localhost:${PORT}"
            echo "   Lavalink: localhost:2333 + nodos públicos"
            echo ""
            echo "   Logs: tail -f app.log"
            echo "   Detener: pkill -f 'node.*index.js'"
            echo ""
            echo "👉 Para mantener el bot 24/7, usa PM2:"
            echo "   pm2 start \"npm start\" --name solome-bot"
            echo "   pm2 save && pm2 startup"
        else
            print_error "Error al iniciar. Revisa app.log"
            exit 1
        fi
        ;;
esac

echo ""
echo "========================================================="
echo "✅ ¡Solome Bot 4.0 está listo!"
echo "========================================================="
echo ""
