#!/bin/bash

# ====================================
# 🎵 Solome Bot 4.0 - Start Script
# ====================================
# Este script inicia:
# - Docker (lo instala si no existe)
# - Lavalink con plugins
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
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Verificar requisitos básicos
echo "🔍 Verificando requisitos..."

if [ ! -f .env ]; then
    print_error ".env no encontrado!"
    echo "   Por favor copia .env.example a .env y configúralo."
    echo "   Comando: cp .env.example .env"
    exit 1
fi
print_status ".env encontrado"

if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo "   Instálalo desde: https://nodejs.org/"
    exit 1
fi
print_status "Node.js $(node -v)"

echo ""

# 2. Instalar dependencias del bot
if [ ! -d node_modules ]; then
    echo "📦 Instalando dependencias del bot..."
    npm install
    print_status "Dependencias instaladas"
else
    print_status "Dependencias ya instaladas"
fi

echo ""

# 3. Verificar e instalar Docker si no existe
echo "🐳 Verificando Docker..."

if ! command -v docker &> /dev/null; then
    print_warning "Docker no encontrado. Instalando..."
    echo ""
    print_info "Esta instalación puede tardar 2-3 minutos..."
    
    # Detectar sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        print_info "Sistema: Linux detectado"
        
        # Descargar e instalar Docker
        curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
        sudo sh /tmp/get-docker.sh > /dev/null 2>&1
        
        # Añadir usuario al grupo docker
        sudo usermod -aG docker $USER
        
        # Iniciar servicio Docker
        sudo systemctl start docker
        sudo systemctl enable docker
        
        print_status "Docker instalado correctamente"
        print_warning "IMPORTANTE: Cierra esta terminal y vuelve a conectarte para que Docker funcione sin sudo"
        print_info "Después ejecuta: cd ~/solome-bot && ./start.sh"
        
        # Continuar con sudo para esta ejecución
        DOCKER_CMD="sudo docker"
        COMPOSE_CMD="sudo docker compose"
    else
        print_error "Sistema operativo no soportado para instalación automática de Docker"
        print_info "Instala Docker manualmente desde: https://docs.docker.com/get-docker/"
        exit 1
    fi
else
    print_status "Docker ya instalado"
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker compose"
    
    # Verificar si necesita sudo
    if ! docker ps > /dev/null 2>&1; then
        print_warning "Docker requiere sudo. Usando sudo para comandos Docker..."
        DOCKER_CMD="sudo docker"
        COMPOSE_CMD="sudo docker compose"
    fi
fi

echo ""

# 4. Verificar docker-compose.yml
if [ ! -f docker-compose.yml ]; then
    print_warning "docker-compose.yml no encontrado. Creando configuración básica..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  lavalink:
    image: ghcr.io/lavalink-devs/lavalink:4
    container_name: lavalink-babaradio
    restart: unless-stopped
    ports:
      - "2333:2333"
    volumes:
      - ./lavalink-server/application.yml:/opt/Lavalink/application.yml
      - ./lavalink-server/plugins:/opt/Lavalink/plugins
    networks:
      - lavalink

networks:
  lavalink:
    name: lavalink
EOF
    print_status "docker-compose.yml creado"
fi

# 5. Verificar y crear configuración de Lavalink
if [ ! -d lavalink-server ]; then
    mkdir -p lavalink-server/plugins
    print_status "Directorio lavalink-server creado"
fi

if [ ! -f lavalink-server/application.yml ]; then
    print_info "Creando configuración de Lavalink con plugins..."
    
    cat > lavalink-server/application.yml << 'EOF'
server:
  port: 2333
  address: 0.0.0.0

lavalink:
  plugins:
    - dependency: "dev.lavalink.youtube:youtube-plugin:1.5.2"
      snapshot: false
    - dependency: "com.github.topisenpai.lavasrc:lavasrc-plugin:4.1.1"
      snapshot: false
    - dependency: "com.github.topisenpai.sponsorblock:sponsorblock-plugin:3.0.1"
      snapshot: false
  server:
    password: "babaradio2025"
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
      local: false
    filters:
      volume: true
      equalizer: true
      karaoke: true
      timescale: true
      tremolo: true
      vibrato: true
      distortion: true
      rotation: true
      channelMix: true
      lowPass: true
    bufferDurationMs: 400
    frameBufferDurationMs: 5000
    youtubePlaylistLoadLimit: 6
    playerUpdateInterval: 5
    youtubeSearchEnabled: true
    soundcloudSearchEnabled: true
    gc-warnings: true

metrics:
  prometheus:
    enabled: false
    endpoint: /metrics

sentry:
  dsn: ""
  environment: ""

logging:
  file:
    path: ./logs/
  level:
    root: INFO
    lavalink: INFO

plugins:
  youtube:
    enabled: true
    allowSearch: true
    allowDirectVideoIds: true
    allowDirectPlaylistIds: true
  lavasrc:
    providers:
      - "ytsearch:\"%ISRC%\""
      - "ytsearch:%QUERY%"
    sources:
      spotify: true
      applemusic: true
      deezer: true
      yandexmusic: false
    spotify:
      clientId: "your_client_id"
      clientSecret: "your_client_secret"
      countryCode: "MX"
  sponsorblock:
    enabled: true
    categories:
      - sponsor
      - selfpromo
EOF
    print_status "application.yml creado con plugins"
fi

echo ""

# 6. Iniciar Lavalink
echo "🎵 Iniciando Lavalink con plugins..."

# Detener contenedor existente si está corriendo
$DOCKER_CMD stop lavalink-babaradio 2>/dev/null || true
$DOCKER_CMD rm lavalink-babaradio 2>/dev/null || true

# Iniciar Lavalink
print_info "Descargando imagen y plugins (primera vez puede tardar 1-2 minutos)..."
$COMPOSE_CMD up -d lavalink

sleep 5

# Verificar que Lavalink esté corriendo
if $DOCKER_CMD ps | grep -q lavalink; then
    print_status "Lavalink corriendo en localhost:2333"
    print_info "Plugins: YouTube, LavaSrc, SponsorBlock"
else
    print_warning "Lavalink no inició correctamente"
    print_info "Revisa logs con: $DOCKER_CMD logs lavalink-babaradio"
    print_info "El bot usará nodos públicos como backup"
fi

echo ""

# 7. Detener procesos anteriores del bot
echo "🔄 Deteniendo procesos anteriores..."
pkill -f "node.*index.js" 2>/dev/null && sleep 2 || true
print_status "Procesos anteriores detenidos"

echo ""

# 8. Determinar modo de inicio
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
            echo "   Lavalink: localhost:2333 (local) + nodos públicos"
            echo ""
            echo "   Logs: tail -f app.log"
            echo "   Logs Lavalink: $DOCKER_CMD logs -f lavalink-babaradio"
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
