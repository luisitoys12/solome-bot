# 🤖 SOLOME Bot - Sistema Completo para Discord

<div align="center">

**Bot multifuncional para BabaRadio y EstacionKusTV**

[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/node-%3E=20.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Características](#-características) • [Instalación](#-instalación-rápida) • [Comandos](#-comandos) • [Dashboard](#-dashboard) • [Soporte](#-soporte)

</div>

---

## 🌟 Características

### 🎵 Música & Radio
- **Sistema de música** con Lavalink (YouTube, Spotify, SoundCloud)
- **Radio en vivo** con 11+ estaciones pre-configuradas
- **Controles completos**: play, pause, skip, queue, loop, shuffle
- **Calidad de audio** premium con Lavalink v4
- **Streams personalizados** - Reproduce cualquier URL de radio

### 🤖 Inteligencia Artificial
- **Chat con IA** usando Hugging Face (gratis) o OpenAI
- **Respuestas inteligentes** a preguntas de usuarios
- **Configurable por servidor** con API keys propias

### 📰 Noticias & Información
- **Noticias en tiempo real** de fuentes confiables (CNN, BBC, etc.)
- **4 categorías**: General, Tecnología, Deportes, Entretenimiento
- **Soporte para NewsAPI** (opcional)

### 🎮 Diversión & Comunidad
- **Comandos personalizados** - Crea tus propios comandos por servidor
- **Sistema de economía** con monedas virtuales
- **Alter-egos** para therians, furries y otherkin
- **Juegos y trivias** interactivos

### 🛡️ Moderación
- **Sistema de warnings** y sanciones
- **Logs de moderación** completos
- **Anti-spam** y protección de servidor
- **Comandos de admin** potentes

### 📊 Dashboard Web (Próximamente)
- **Panel de control** web completo
- **Configuración visual** de todos los sistemas
- **Estadísticas en tiempo real**
- **Gestión de comandos personalizados**

---

## 🚀 Instalación Rápida

### Requisitos Previos
- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **FFmpeg** (para audio)
- **yt-dlp** (para descargas)
- **Lavalink** (opcional, para música)
- **MongoDB** (opcional, para dashboard)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/luisitoys12/solome-bot.git
cd solome-bot
```

### 2. Instalar Dependencias del Sistema
```bash
# Instalar FFmpeg
sudo apt update
sudo apt install -y ffmpeg

# Instalar yt-dlp
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Verificar instalaciones
ffmpeg -version
yt-dlp --version
```

### 3. Instalar Dependencias de Node.js
```bash
npm install
```

### 4. Configurar Variables de Entorno
```bash
cp .env.example .env
nano .env
```

**Contenido del `.env`:**
```env
# Bot Token
DISCORD_TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id_aqui

# Lavalink (Opcional - para música)
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass

# APIs Opcionales
NEWS_API_KEY=tu_api_key_de_newsapi
OPENAI_API_KEY=tu_api_key_de_openai

# MongoDB (Opcional - para dashboard)
MONGODB_URI=mongodb://localhost:27017/solome-bot

# Dashboard (Opcional)
DASHBOARD_PORT=3000
DASHBOARD_SECRET=tu_session_secret_aqui
```

### 5. Configurar Lavalink (Opcional - para música)
```bash
# Descargar Lavalink
wget https://github.com/lavalink-devs/Lavalink/releases/latest/download/Lavalink.jar

# Crear archivo application.yml
cat > application.yml << 'EOF'
server:
  port: 2333
  address: 0.0.0.0
lavalink:
  server:
    password: "youshallnotpass"
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
      local: false
EOF

# Ejecutar Lavalink
java -jar Lavalink.jar
```

### 6. Iniciar el Bot
```bash
# Modo desarrollo
npm run dev

# Modo producción con PM2
npm install -g pm2
pm2 start src/index.js --name solome-bot
pm2 save
pm2 startup
```

---

## 📝 Comandos Principales

### 🎵 Música
| Comando | Descripción |
|---------|-------------|
| `/music play <canción>` | Reproducir música de YouTube/Spotify |
| `/music pause` | Pausar la reproducción |
| `/music resume` | Reanudar la reproducción |
| `/music skip` | Saltar canción actual |
| `/music queue` | Ver cola de reproducción |
| `/music nowplaying` | Canción actual |
| `/music volume <0-200>` | Ajustar volumen |
| `/music loop <modo>` | Activar loop (off/track/queue) |
| `/music shuffle` | Mezclar cola |

### 📻 Radio
| Comando | Descripción |
|---------|-------------|
| `/radio play <estación>` | Reproducir estación de radio |
| `/radio stop` | Detener radio |
| `/radio lista` | Ver estaciones disponibles |
| `/radio custom <url>` | Reproducir stream personalizado |

**Estaciones disponibles:**
- 📻 BabaRadio, 📺 EstacionKusTV
- 🎵 Los 40 México, 🎸 Radio Beat MX
- 🇬🇧 BBC Radio 1, 💋 Kiss FM
- 🎧 Capital FM, 🔊 Power 106
- 🇨🇱 Mega Chile, 🤘 Rock & Pop
- ✨ Disney Radio

### 🤖 Inteligencia Artificial
| Comando | Descripción |
|---------|-------------|
| `/ai chat <pregunta>` | Chatea con la IA |
| `/ai config` | Configurar API keys (admin) |
| `/ai info` | Ver configuración actual |

### 📰 Noticias
| Comando | Descripción |
|---------|-------------|
| `/noticias [categoria]` | Obtener noticias recientes |
| `/noticias categoria:tecnologia` | Noticias de tecnología |
| `/noticias categoria:deportes cantidad:10` | 10 noticias de deportes |

### ⚙️ Comandos Personalizados
| Comando | Descripción |
|---------|-------------|
| `/customcommand add <nombre> <respuesta>` | Crear comando |
| `/customcommand remove <nombre>` | Eliminar comando |
| `/customcommand list` | Ver todos los comandos |
| `/customcommand edit <nombre> <nueva_respuesta>` | Editar comando |

### 📥 Descargas
| Comando | Descripción |
|---------|-------------|
| `/download url:<url> formato:audio` | Descargar audio de YouTube |
| `/download url:<url> formato:video` | Descargar video de YouTube |

**Soporta:** YouTube, Spotify, SoundCloud, TikTok, Twitter, Instagram

### 💰 Economía
| Comando | Descripción |
|---------|-------------|
| `/balance` | Ver tu balance |
| `/daily` | Reclamar monedas diarias |
| `/work` | Trabajar por monedas |
| `/transfer <usuario> <cantidad>` | Transferir monedas |

### 🐾 Alter-Ego
| Comando | Descripción |
|---------|-------------|
| `/alter-ego crear` | Crear tu alter-ego/fursona |
| `/alter-ego ver [usuario]` | Ver alter-ego |
| `/alter-ego galeria` | Galería de alter-egos |
| `/alter-ego editar` | Editar tu alter-ego |

---

## 📊 Dashboard Web

El dashboard web está basado en [Pogy Bot](https://github.com/peterhanania/Pogy) y ofrece:

- ⚙️ **Configuración completa** del servidor
- 📊 **Estadísticas** en tiempo real
- 📋 **Logs de moderación**
- 🎫 **Sistema de tickets**
- 🏆 **Niveles y rankings**
- 🎭 **Comandos personalizados** (GUI)

### Iniciar Dashboard
```bash
cd dashboard
npm install
npm start
```

Accede en: `http://localhost:3000`

---

## 🔧 Mantenimiento

### Actualizar el Bot
```bash
cd ~/solome-bot
git pull origin master
npm install
pm2 restart solome-bot
```

### Actualizar yt-dlp
```bash
sudo yt-dlp -U
```

### Ver Logs
```bash
pm2 logs solome-bot
pm2 logs solome-bot --lines 100
```

### Monitoreo
```bash
pm2 monit
pm2 status
```

---

## 🐛 Troubleshooting

### "yt-dlp: command not found"
```bash
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### "ffmpeg: command not found"
```bash
sudo apt install -y ffmpeg
```

### "Lavalink no conecta"
1. Verifica que Lavalink esté corriendo: `ps aux | grep Lavalink`
2. Verifica el puerto: `netstat -tulpn | grep 2333`
3. Revisa los logs: `tail -f logs/lavalink.log`

### "Unknown interaction error"
Esto sucede cuando el bot tarda >3 segundos en responder. Ya está arreglado con `deferReply()`.

---

## 💻 Stack Tecnológico

- **Discord.js v14** - Framework de Discord
- **Lavalink v4** - Sistema de música
- **@discordjs/voice** - Audio nativo de Discord
- **yt-dlp** - Descargas de medios
- **FFmpeg** - Procesamiento de audio
- **Express** - Dashboard web
- **MongoDB** - Base de datos
- **Hugging Face API** - IA gratuita
- **NewsAPI** - Noticias en tiempo real

---

## 👥 Contribuir

Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📜 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 💬 Soporte

- **Discord:** [Servidor de Soporte](https://discord.gg/tu_servidor)
- **GitHub Issues:** [Reportar Bug](https://github.com/luisitoys12/solome-bot/issues)
- **Documentación:** [Wiki](https://github.com/luisitoys12/solome-bot/wiki)

---

## 🎉 Créditos

- **Desarrollado por:** EstacionKusTV Team
- **Inspirado en:** [Pogy Bot](https://github.com/peterhanania/Pogy)
- **Música:** Lavalink by Frédérik Aalund
- **IA:** Hugging Face & OpenAI

---

<div align="center">

**Hecho con ❤️ para BabaRadio y EstacionKusTV**

[GitHub](https://github.com/luisitoys12/solome-bot) • [Reporte de Bugs](https://github.com/luisitoys12/solome-bot/issues) • [Wiki](https://github.com/luisitoys12/solome-bot/wiki)

</div>
