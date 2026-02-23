# SOLOME Bot - Bot Multifuncional para Discord

🤖 Bot completo con música, radio, juegos, IA y más para BabaRadio y EstacionKusTV

## 🚀 Características

### 🎵 Música & Radio
- `/play` - Reproduce música de YouTube, Spotify, SoundCloud
- `/radio` - Reproduce estaciones de radio (iHeartRadio, TuneIn, MyTuner)
- `/queue` - Ver cola de reproducción
- `/skip` - Saltar canción
- `/stop` - Detener reproducción

### 🤖 Inteligencia Artificial
- `/ai chat` - Chatea con ChatGPT/Claude
- `/ai imagen` - Genera imágenes con DALL-E
- `/voice generar` - Text-to-Speech con IA
- `/moderar` - Moderación automática con IA

### 📰 Noticias RSS
- `/noticias` - Noticias de múltiples medios mexicanos
- 7 categorías: General, Deportes, Espectáculos, Tecnología, Seguridad, Economía, Internacional
- Fuentes: El Universal, Milenio, ESPN, Xataka, y más

### 🎮 Gaming & Entretenimiento
- `/perfil-gamer` - Sistema de perfiles gaming
- `/alter-ego` - Perfiles para therians/furries
- `/duelo` - Piedra, papel o tijeras
- `/loteria` - Sistema de lotería
- `/ruleta` - Casino
- `/slots` - Máquina tragamonedas

### ⬇️ Utilidades
- `/download` - Descarga videos/audio de YouTube
- `/traducir` - Traductor multiidioma
- `/clima` - Información del clima
- `/recordatorio` - Recordatorios

### 🛡️ Moderación
- Sistema de auto-moderación con IA
- Detección de contenido inapropiado
- Configuración por servidor

## 💻 Instalación

### Requisitos
- Node.js 18+
- npm o yarn
- FFmpeg (para música)
- Token de Discord Bot

### Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/luisitoys12/solome-bot.git
cd solome-bot

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env

# Iniciar bot
npm start
```

### Variables de Entorno (.env)

```env
TOKEN=tu_token_de_discord
CLIENT_ID=tu_client_id
```

## 🌐 Configurar Panel Web (Opcional)

Para acceder al bot desde un dominio público:

```bash
# Ejecutar script de configuración (solo primera vez)
sudo bash setup-panel.sh
```

Esto configurará:
- ✅ DuckDNS (dominio gratis)
- ✅ Nginx (reverse proxy)
- ✅ SSL/HTTPS (certificado gratis)
- ✅ Auto-actualización de IP

**Tu panel estará en:** `https://solome-panel.duckdns.org`

## 🛠️ Uso con PM2 (Producción)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar bot
pm2 start src/index.js --name solome-bot

# Ver logs
pm2 logs solome-bot

# Reiniciar
pm2 restart solome-bot

# Auto-inicio en boot
pm2 startup
pm2 save
```

## 🔄 Actualizaciones

El bot tiene **auto-registro de comandos**. Solo necesitas:

```bash
git pull origin master
pm2 restart solome-bot
```

¡Los comandos se registran automáticamente! 🎉

## 📚 Comandos Disponibles

**Total: 70+ comandos**

Ver lista completa en Discord: `/help`

## 👥 Contribuir

Pull requests son bienvenidos. Para cambios grandes, abre un issue primero.

## 📝 Licencia

MIT

## 📧 Contacto

- **Desarrollador:** EstacionKusTV
- **GitHub:** https://github.com/luisitoys12
- **Discord:** SOLOME#9176

---

🌟 **Hecho con ❤️ para BabaRadio y EstacionKusTV**
