# 🎧 Solome Bot 4.0 – Baba Radio + Solome AI

Solome Bot 4.0 (Baba Radio) es un bot multifuncional para Discord que combina:

- Radio online (iHeart, TuneIn, MyTuner).
- Música vía Lavalink v4 (local en Docker, con varios nodos públicos de backup).
- Juegos y minijuegos para gamers.
- Sistema de lotería del servidor.
- **Solome AI**: generación de imágenes/texto con créditos diarios.
- **Solome Assistant**: chat privado por hilos (beta, acceso con código).
- **Sistema de anuncios para streamers**: Twitch, Kick, YouTube.
- **Juegos interactivos**: Duelos, Connect4, TicTacToe y más.

---

## ✨ Novedades 4.0

- **Script unificado `start.sh`** que instala TODO automáticamente:
  - Instala Docker si no lo tienes
  - Configura Lavalink con plugins (YouTube, LavaSrc, SponsorBlock)
  - Inicia bot + dashboard + Lavalink
  - Todo en un solo comando
- **Nueva configuración Lavalink v4** con múltiples nodos públicos y un nodo local en Docker.
- **Comando `/radio` mejorado** usando streams de varias fuentes.
- **Nuevo módulo de Lotería** (`/loteria jugar | info | sortear`).
- **Solome AI (`/ia`)**:
  - Genera imágenes (`/ia imagen`) y texto (`/ia texto`) usando un backend HTTP (por defecto `localhost`).
  - Sistema de créditos diarios (15 creaciones al día por usuario).
  - Comando `/ia info` y `/ia recargar` (para admins).
- **Solome Assistant (`/charlar`)**:
  - Crea un hilo para hablar con la IA del bot.
  - Acceso protegido con código beta.
- **Sistema para creadores de contenido (`/stream`)**:
  - Configura canales de anuncios para Twitch, Kick y YouTube.
  - Anuncia cuando estés en vivo con embeds personalizados.
  - Menciones automáticas de roles.
- **Juego interactivo (`/duelo`)**:
  - Piedra, papel o tijeras con botones.
  - Juega contra otros usuarios o contra el bot.
  - Resultados en tiempo real con embeds coloridos.
- Infraestructura lista para:
  - Perfiles gamer.
  - Alter-ego/therian/fursona (tendencias Gen Z).
  - Más funciones premium.

---

## 🧩 Requisitos

- **Node.js 18 o superior** (requerido)
- **Docker** (se instala automáticamente con el script)
- **Token de bot de Discord** (obténlo en [Discord Developer Portal](https://discord.com/developers/applications))
- (Opcional) API propia o pública para IA (texto e imagen) accesible vía HTTP.

---

## 🚀 Instalación ULTRA rápida (Recomendado)

### ⚡ Solo 4 comandos y listo

El script `start.sh` hace TODO por ti:

```bash
# 1. Clona el repo
git clone https://github.com/luisitoys12/solome-bot.git
cd solome-bot

# 2. Configura tu .env
cp .env.example .env
nano .env  # Añade tu DISCORD_TOKEN y CLIENT_ID

# 3. Da permisos y ejecuta
chmod +x start.sh
./start.sh
```

### ✨ Lo que hace el script automáticamente:

1. ✅ Verifica requisitos (Node.js, .env)
2. ✅ **Instala Docker si no lo tienes** (en Linux)
3. ✅ Instala dependencias del bot (`npm install`)
4. ✅ Crea `docker-compose.yml` si no existe
5. ✅ Crea `lavalink-server/application.yml` con plugins:
   - YouTube Plugin v1.5.2
   - LavaSrc Plugin v4.1.1 (Spotify, Apple Music, Deezer)
   - SponsorBlock Plugin v3.0.1
6. ✅ Inicia Lavalink en Docker
7. ✅ Inicia el bot + dashboard
8. ✅ Muestra logs e información útil

### 🎯 Resultado esperado

```
✅ ¡Solome Bot 4.0 está listo!

📊 Información:
   Bot: Conectado a Discord
   Dashboard: http://localhost:3000
   Lavalink: localhost:2333 (local) + nodos públicos
   
   Logs: tail -f app.log
   Detener: pkill -f 'node.*index.js'
```

---

## 🔧 Modos de inicio

El script `start.sh` soporta diferentes modos:

```bash
# Modo completo (bot + dashboard + Lavalink)
./start.sh

# Solo el bot de Discord
./start.sh bot

# Solo el dashboard web
./start.sh dashboard
```

---

## 🔥 Mantener el bot 24/7 con PM2

DESPUÉS de ejecutar `./start.sh` exitosamente:

```bash
# 1. Detener el proceso actual
pkill -f 'node.*index.js'

# 2. Instalar PM2 (si no lo tienes)
npm install -g pm2

# 3. Iniciar con PM2
pm2 start "npm start" --name solome-bot

# 4. Guardar configuración
pm2 save

# 5. Configurar inicio automático
pm2 startup
# Copia y ejecuta el comando que te muestra PM2

# 6. Verificar estado
pm2 status
pm2 logs solome-bot
```

### Comandos útiles de PM2

```bash
pm2 logs solome-bot          # Ver logs en tiempo real
pm2 restart solome-bot       # Reiniciar el bot
pm2 stop solome-bot          # Detener el bot
pm2 monit                    # Monitor de recursos
pm2 delete solome-bot        # Eliminar del PM2
```

---

## 🛠️ Instalación manual (Solo si el script falla)

### 1. Clonar el repositorio

```bash
git clone https://github.com/luisitoys12/solome-bot.git
cd solome-bot
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Edita y rellena:

```env
DISCORD_TOKEN=TU_TOKEN_AQUI
CLIENT_ID=ID_DE_TU_BOT
GUILD_ID=ALGUN_GUILD_PARA_REGISTRAR_COMANDOS
NODE_ENV=production
```

### 3. Instalar Docker manualmente

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Iniciar Lavalink

```bash
docker compose up -d lavalink
```

### 6. Registrar comandos e iniciar

```bash
npm run register
npm start
```

---

## 🎵 Lavalink: Plugins incluidos

El script `start.sh` configura automáticamente estos plugins:

### YouTube Plugin v1.5.2
- Búsqueda y reproducción de YouTube
- Soporte para playlists
- IDs directos de video

### LavaSrc Plugin v4.1.1
- 🎵 Spotify (requiere credenciales)
- 🍎 Apple Music
- 🎶 Deezer
- Búsqueda por ISRC

### SponsorBlock Plugin v3.0.1
- Salta automáticamente:
  - Sponsors
  - Auto-promociones
  - Intro/Outro

### Configuración de Spotify (opcional)

Edita `lavalink-server/application.yml`:

```yaml
plugins:
  lavasrc:
    spotify:
      clientId: "tu_client_id"
      clientSecret: "tu_client_secret"
      countryCode: "MX"
```

Obtén credenciales en: https://developer.spotify.com/dashboard

---

## 🧠 Solome AI

Solome AI funciona mediante un backend HTTP configurable (por defecto `http://localhost:3000`).

### Endpoints esperados

El bot hace peticiones a:

- `POST /ai/image` → `{ url: "https://..." }`
- `POST /ai/text` → `{ text: "respuesta..." }`
- `POST /ai/chat` → `{ reply: "mensaje de la IA..." }`

Durante la fase beta puedes:

- Levantar un servidor propio en Node/Express que conecte con la API de IA que prefieras.
- O apuntar el `BASE_URL` de los comandos a cualquier API pública que tengas configurada.

### Créditos IA

- Cada usuario tiene **15 créditos diarios**.
- Cada llamada a `/ia imagen` o `/ia texto` consume 1 crédito.
- `/ia info` muestra los créditos restantes.
- Admins pueden usar `/ia recargar` para añadir créditos extra a un usuario.

---

## 💬 Solome Assistant (`/charlar`)

- Comando `/charlar codigo:<string>`:
  - Verifica un **código beta** en la base interna.
  - Crea un hilo en el canal actual.
  - Registra la sesión y redirige los mensajes de ese hilo al endpoint `POST /ai/chat`.

- El archivo `aiChat` y el evento `messageCreate` se encargan de:
  - Limitar la sesión a N mensajes.
  - Cerrar sesión cuando se llega al límite.

---

## 🏟️ Lotería del servidor

Nuevo comando `/loteria` con subcomandos:

- `/loteria jugar [boletos]`:
  - Compra boletos para la ronda actual.
  - Suma al bote virtual (BabaCoins).
- `/loteria info`:
  - Muestra bote, boletos y tiempo estimado.
- `/loteria sortear`:
  - (Solo admins) Elige ganador aleatorio entre los boletos vendidos.
  - Reinicia la ronda.

Los datos se guardan en archivos JSON dentro de la carpeta `/data`.

---

## 📺 Sistema para Streamers (`/stream`)

Nuevo comando diseñado para creadores de contenido:

### Características

- **Configuración por servidor** (`/stream configurar`):
  - Define el canal donde se anunciarán los streams.
  - Configura un rol para mencionar automáticamente.
  - Guarda tus enlaces de Twitch, Kick y YouTube.

- **Anuncio de directo** (`/stream live`):
  - Selecciona la plataforma (Twitch, Kick o YouTube).
  - Añade título del stream.
  - El bot envía un embed con colores y iconos de la plataforma.
  - Menciona automáticamente al rol configurado.

- **Ver configuración** (`/stream info`):
  - Muestra todos los ajustes actuales del servidor.

### Ejemplo de uso

```
/stream configurar canal:#anuncios rol:@notify twitch:https://twitch.tv/tucanal
/stream live plataforma:twitch titulo:Jugando Valorant - Ranked
```

---

## 🎮 Juego: Duelo (`/duelo`)

Juego rápido de piedra, papel o tijeras con botones interactivos:

### Modos de juego

- **vs Usuario**: `/duelo oponente:@amigo`
  - Ambos jugadores eligen en secreto.
  - El bot revela las elecciones y determina el ganador.
  
- **vs Bot**: `/duelo` (sin oponente)
  - Juegas directamente contra el bot.
  - Respuesta instantánea.

### Características

- Botones interactivos con emojis (🪨 📄 ✂️).
- Temporizador de 30 segundos.
- Embeds coloridos según el resultado.
- Elección en privado para modo PvP.

---

## 🎮 Funciones gamer y tendencias

(TODO en próximas versiones, ya está la estructura lista):

- Perfiles gamer (plataformas, juegos favoritos).
- Matchmaking para armar squads.
- Alter-ego / therian / fursona:
  - Comando para guardar "animal interior" o avatar.
  - Integración con mensajes de juegos y lotería.

---

## 🧪 Comandos principales

### Música y Radio
- `/radio` – Buscar y reproducir estaciones de radio.
- `/play` / `/stop` / `/skip` / `/queue` – Comandos de música.

### IA y Asistente
- `/ia` – Solome AI (imagen, texto, info, recargar).
- `/charlar` – Abrir chat con Solome Assistant.

### Diversión y Juegos
- `/loteria` – Sistema de lotería.
- `/duelo` – Piedra, papel o tijeras con botones.
- `/connect4`, `/tictactoe`, `/coinflip`, `/dice` – Otros juegos.

### Creadores de Contenido
- `/stream` – Sistema de anuncios para Twitch/Kick/YouTube.

### Utilidades
- Comandos de moderación, info, tickets y más (ver `COMMANDS.md`).

---

## 📝 Permisos especiales

### Dueño del bot

Algunos comandos estarán restringidos al dueño del bot (definido en `src/utils/ownerOnly.js`).

Para añadir tu ID como dueño:

1. Abre `src/utils/ownerOnly.js`.
2. Añade tu Discord User ID al array `OWNER_IDS`:

```js
const OWNER_IDS = [
  '123456789012345678', // Tu ID aquí
]
```

3. Reinicia el bot:

```bash
pm2 restart solome-bot
# O si usas el script:
pkill -f 'node.*index.js' && ./start.sh
```

### Administradores de servidor

Comandos como `/stream configurar`, `/loteria sortear` y `/ia recargar` requieren permisos de administrador del servidor.

---

## 🐛 Solución de problemas

### El bot no inicia

```bash
# Ver logs
tail -f app.log

# O con PM2
pm2 logs solome-bot --err
```

### Lavalink no conecta

```bash
# Ver logs de Lavalink
docker logs lavalink-babaradio

# Reiniciar Lavalink
docker restart lavalink-babaradio

# Verificar que esté corriendo
docker ps | grep lavalink
```

### Docker requiere sudo

DESPUÉS de la instalación de Docker:

```bash
# Cerrar sesión y volver a conectar
exit
# Reconecta por SSH

# Verificar que funcione sin sudo
docker ps
```

### Comandos no aparecen en Discord

```bash
# Registrar comandos manualmente
npm run register

# Reiniciar el bot
pm2 restart solome-bot
```

---

## 📄 Licencia

Este proyecto mantiene la licencia original definida en `LICENSE`.

---

## 🤝 Contribuir

Si quieres aportar funciones o reportar bugs:

1. Haz fork del repositorio.
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcion`).
3. Commit tus cambios (`git commit -m 'Añadir nueva función'`).
4. Push a la rama (`git push origin feature/nueva-funcion`).
5. Abre un Pull Request.

---

## 📞 Soporte

Para preguntas o problemas, abre un issue en GitHub o contacta al equipo de Solome/EstacionKusTV.

---

**Desarrollado con ❤️ por el equipo de Baba Radio / EstacionKusTV**
