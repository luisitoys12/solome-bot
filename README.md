# 🤖 Solome Bot — Discord Bot Multifuncional

[![Deploy on Fly.io](https://img.shields.io/badge/Deploy-Fly.io-purple?logo=fly.io)](https://fly.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-blue?logo=discord)](https://discord.js.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Bot de Discord multifuncional con **250+ comandos** en categorías de música, moderación, radio, economía, juegos, utilidades y más. Desplegado en Fly.io.

---

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Deploy en Fly.io](#deploy-en-flyio)
- [Variables de Entorno](#variables-de-entorno)
- [Todos los Comandos (250)](#todos-los-comandos-250)
- [Wiki](#wiki)
- [Contribuir](#contribuir)

---

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/luisitoys12/solome-bot.git
cd solome-bot

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Registrar comandos en Discord
node register-commands.js

# Iniciar el bot
node index.js
```

---

## ☁️ Deploy en Fly.io

```bash
# 1. Instalar flyctl
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Lanzar la app (primera vez)
fly launch --name solome-bot --region ams

# 4. Configurar secretos
fly secrets set DISCORD_TOKEN=tu_token_aqui
fly secrets set CLIENT_ID=tu_client_id
fly secrets set GUILD_ID=tu_guild_id

# 5. Deploy
fly deploy

# 6. Ver logs
fly logs

# 7. Abrir consola
fly ssh console
```

---

## 🔐 Variables de Entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `DISCORD_TOKEN` | Token del bot de Discord | ✅ |
| `CLIENT_ID` | ID de la aplicación Discord | ✅ |
| `GUILD_ID` | ID del servidor Discord | ✅ |
| `LAVALINK_HOST` | Host del servidor Lavalink | 🎵 |
| `LAVALINK_PORT` | Puerto Lavalink (default: 2333) | 🎵 |
| `LAVALINK_PASSWORD` | Contraseña Lavalink | 🎵 |
| `DATABASE_URL` | URL de base de datos | 📊 |
| `RADIO_API_KEY` | API Key para radio | 📻 |
| `OPENAI_API_KEY` | API Key OpenAI (para IA) | 🤖 |
| `WEATHER_API_KEY` | API Key clima | 🌦️ |
| `PORT` | Puerto HTTP (default: 8080) | ✅ |

---

## 📚 Todos los Comandos (250)

### 🎵 Música (30 comandos)

| Comando | Descripción |
|---|---|
| `/play <canción>` | Reproducir una canción o playlist |
| `/pause` | Pausar la reproducción |
| `/resume` | Reanudar la reproducción |
| `/stop` | Detener y limpiar la cola |
| `/skip` | Saltar a la siguiente canción |
| `/previous` | Volver a la canción anterior |
| `/queue` | Ver la cola de reproducción |
| `/queue clear` | Limpiar la cola completa |
| `/queue remove <pos>` | Eliminar canción de la cola |
| `/queue shuffle` | Mezclar la cola aleatoriamente |
| `/nowplaying` | Ver la canción que suena ahora |
| `/volume <0-100>` | Ajustar el volumen |
| `/seek <segundos>` | Saltar a un punto de la canción |
| `/loop` | Alternar modo de bucle (canción/cola/off) |
| `/lyrics` | Ver letra de la canción actual |
| `/playlist create <nombre>` | Crear playlist personal |
| `/playlist add <nombre>` | Añadir canción a playlist |
| `/playlist play <nombre>` | Reproducir playlist personal |
| `/playlist list` | Listar tus playlists |
| `/playlist delete <nombre>` | Eliminar una playlist |
| `/autoplay` | Activar reproducción automática |
| `/filter bass` | Aplicar filtro de graves |
| `/filter nightcore` | Aplicar filtro Nightcore |
| `/filter vaporwave` | Aplicar filtro Vaporwave |
| `/filter 8d` | Aplicar audio 8D |
| `/filter reset` | Quitar todos los filtros |
| `/equalizer` | Mostrar ecualizador |
| `/move <pos1> <pos2>` | Mover canción en la cola |
| `/search <query>` | Buscar canciones |
| `/disconnect` | Desconectar el bot del canal de voz |

### 📻 Radio (20 comandos)

| Comando | Descripción |
|---|---|
| `/radio play <estación>` | Reproducir una estación de radio |
| `/radio stop` | Detener la radio |
| `/radio list` | Listar estaciones disponibles |
| `/radio search <nombre>` | Buscar estaciones de radio |
| `/radio info` | Info de la estación actual |
| `/radio add <url> <nombre>` | Añadir estación personalizada |
| `/radio remove <nombre>` | Eliminar estación personalizada |
| `/radio favorites` | Ver estaciones favoritas |
| `/radio favorite add` | Añadir a favoritos |
| `/radio favorite remove` | Quitar de favoritos |
| `/radio genre <género>` | Buscar radio por género |
| `/radio country <país>` | Buscar radio por país |
| `/radio popular` | Ver radios más populares |
| `/radio trending` | Ver radios en tendencia |
| `/radio mx` | Estaciones de México |
| `/radio top40` | Estaciones Top 40 |
| `/radio news` | Estaciones de noticias |
| `/radio sports` | Estaciones deportivas |
| `/radio jazz` | Estaciones de jazz |
| `/radio regional` | Música regional mexicana |

### 🛡️ Moderación (30 comandos)

| Comando | Descripción |
|---|---|
| `/ban <usuario> [razón]` | Banear a un usuario |
| `/unban <userID>` | Desbanear a un usuario |
| `/kick <usuario> [razón]` | Expulsar a un usuario |
| `/mute <usuario> <tiempo>` | Silenciar a un usuario |
| `/unmute <usuario>` | Desilenciar a un usuario |
| `/timeout <usuario> <tiempo>` | Poner en timeout a un usuario |
| `/warn <usuario> <razón>` | Advertir a un usuario |
| `/warnings <usuario>` | Ver advertencias de un usuario |
| `/clearwarnings <usuario>` | Limpiar advertencias |
| `/purge <cantidad>` | Eliminar mensajes masivamente |
| `/purge user <usuario>` | Eliminar mensajes de un usuario |
| `/purge bots` | Eliminar mensajes de bots |
| `/lock <canal>` | Bloquear un canal |
| `/unlock <canal>` | Desbloquear un canal |
| `/slowmode <segundos>` | Activar modo lento |
| `/nick <usuario> <nombre>` | Cambiar apodo de usuario |
| `/role add <usuario> <rol>` | Dar rol a usuario |
| `/role remove <usuario> <rol>` | Quitar rol a usuario |
| `/massrole add <rol>` | Dar rol a todos los miembros |
| `/massrole remove <rol>` | Quitar rol a todos |
| `/modlog` | Ver log de moderación |
| `/cases <usuario>` | Ver historial de casos |
| `/case <id>` | Ver detalles de un caso |
| `/case delete <id>` | Eliminar un caso |
| `/automod setup` | Configurar automoderación |
| `/automod words add <palabra>` | Añadir palabra bloqueada |
| `/automod words list` | Ver palabras bloqueadas |
| `/antispam` | Configurar anti-spam |
| `/antilink` | Configurar anti-links |
| `/jail <usuario>` | Aislar a un usuario |

### 💰 Economía (25 comandos)

| Comando | Descripción |
|---|---|
| `/balance` | Ver tu balance de monedas |
| `/balance <usuario>` | Ver balance de otro usuario |
| `/daily` | Reclamar recompensa diaria |
| `/weekly` | Reclamar recompensa semanal |
| `/monthly` | Reclamar recompensa mensual |
| `/work` | Trabajar para ganar monedas |
| `/crime` | Cometer un crimen (riesgo/recompensa) |
| `/rob <usuario>` | Robar a otro usuario |
| `/give <usuario> <cantidad>` | Dar monedas a otro usuario |
| `/deposit <cantidad>` | Depositar en el banco |
| `/withdraw <cantidad>` | Retirar del banco |
| `/shop` | Ver la tienda del servidor |
| `/shop buy <item>` | Comprar un item |
| `/inventory` | Ver tu inventario |
| `/use <item>` | Usar un item del inventario |
| `/leaderboard coins` | Top de monedas |
| `/leaderboard bank` | Top de banco |
| `/bet <cantidad>` | Apostar monedas |
| `/slots <cantidad>` | Jugar a las tragaperras |
| `/blackjack <cantidad>` | Jugar blackjack |
| `/coinflip <cantidad>` | Cara o cruz |
| `/roulette <cantidad>` | Ruleta |
| `/lottery` | Comprar boleto de lotería |
| `/lottery info` | Info de la lotería actual |
| `/tax` | Ver impuestos del servidor |

### 🎮 Juegos (20 comandos)

| Comando | Descripción |
|---|---|
| `/tictactoe <usuario>` | Jugar tres en raya |
| `/connect4 <usuario>` | Jugar Conecta 4 |
| `/hangman` | Jugar al ahorcado |
| `/trivia` | Pregunta de trivia aleatoria |
| `/trivia category <cat>` | Trivia por categoría |
| `/quiz` | Quiz de conocimientos |
| `/wordle` | Jugar Wordle |
| `/rps <usuario>` | Piedra papel tijeras |
| `/chess <usuario>` | Jugar ajedrez |
| `/2048` | Jugar al 2048 |
| `/snake` | Jugar al Snake |
| `/akinator` | Jugar al Akinator |
| `/truth` | Verdad o reto - verdad |
| `/dare` | Verdad o reto - reto |
| `/neverhaveiever` | Yo nunca nunca |
| `/wouldyourather` | ¿Qué preferirías? |
| `/riddle` | Adivinanza aleatoria |
| `/minesweeper` | Buscaminas |
| `/roll <dados>` | Tirar dados (ej: 2d6) |
| `/8ball <pregunta>` | La bola 8 mágica |

### 📊 Estadísticas & Info (20 comandos)

| Comando | Descripción |
|---|---|
| `/userinfo <usuario>` | Info detallada de un usuario |
| `/serverinfo` | Info del servidor |
| `/roleinfo <rol>` | Info de un rol |
| `/channelinfo <canal>` | Info de un canal |
| `/botinfo` | Info y estadísticas del bot |
| `/ping` | Latencia del bot |
| `/uptime` | Tiempo en línea del bot |
| `/stats` | Estadísticas generales |
| `/leaderboard xp` | Top de XP/niveles |
| `/leaderboard messages` | Top de mensajes |
| `/leaderboard voice` | Top de tiempo en voz |
| `/avatar <usuario>` | Ver avatar de un usuario |
| `/banner <usuario>` | Ver banner de un usuario |
| `/permissions <usuario>` | Ver permisos de usuario |
| `/invite` | Link de invitación del bot |
| `/support` | Link al servidor de soporte |
| `/vote` | Links para votar el bot |
| `/premium` | Info sobre premium |
| `/changelog` | Ver últimos cambios |
| `/credits` | Créditos del bot |

### ⭐ Niveles & XP (15 comandos)

| Comando | Descripción |
|---|---|
| `/rank <usuario>` | Ver rango y nivel |
| `/rank card` | Ver tarjeta de rango |
| `/xp add <usuario> <cantidad>` | Añadir XP (admin) |
| `/xp remove <usuario> <cantidad>` | Quitar XP (admin) |
| `/xp reset <usuario>` | Resetear XP (admin) |
| `/levelup roles` | Ver roles de nivel |
| `/levelup channel` | Configurar canal de subida |
| `/levelup message` | Personalizar mensaje de subida |
| `/levelup toggle` | Activar/desactivar sistema |
| `/multiplier set <x>` | Poner multiplicador de XP |
| `/multiplier role <rol>` | Multiplicador por rol |
| `/voicexp toggle` | XP por tiempo en voz |
| `/voicexp rate <cantidad>` | Tasa de XP en voz |
| `/boostxp toggle` | Doble XP en fines de semana |
| `/resetlevels` | Resetear todos los niveles |

### 🎁 Sorteos & Eventos (15 comandos)

| Comando | Descripción |
|---|---|
| `/giveaway create` | Crear un sorteo |
| `/giveaway end <id>` | Terminar sorteo antes de tiempo |
| `/giveaway reroll <id>` | Volver a sortear ganador |
| `/giveaway list` | Lista de sorteos activos |
| `/giveaway pause <id>` | Pausar sorteo |
| `/giveaway resume <id>` | Reanudar sorteo |
| `/giveaway delete <id>` | Eliminar sorteo |
| `/event create` | Crear evento del servidor |
| `/event list` | Ver eventos activos |
| `/event join <id>` | Unirse a un evento |
| `/event leave <id>` | Salir de un evento |
| `/poll create` | Crear encuesta |
| `/poll end <id>` | Terminar encuesta |
| `/suggestion <texto>` | Enviar sugerencia |
| `/bugreport <texto>` | Reportar un bug |

### ⚙️ Configuración (25 comandos)

| Comando | Descripción |
|---|---|
| `/setup` | Asistente de configuración inicial |
| `/config prefix <prefijo>` | Cambiar prefijo |
| `/config language <lang>` | Cambiar idioma del bot |
| `/config logs channel <canal>` | Canal de logs |
| `/config welcome channel` | Canal de bienvenida |
| `/config welcome message` | Mensaje de bienvenida |
| `/config welcome image` | Imagen de bienvenida |
| `/config goodbye channel` | Canal de despedida |
| `/config goodbye message` | Mensaje de despedida |
| `/config autorole <rol>` | Rol automático al entrar |
| `/config botrole <rol>` | Rol automático para bots |
| `/config djrole <rol>` | Rol de DJ para música |
| `/config modrole <rol>` | Rol de moderador |
| `/config adminrole <rol>` | Rol de administrador |
| `/config muterole <rol>` | Rol de silenciado |
| `/config ticketchannel <canal>` | Canal para tickets |
| `/config ticketcategory <cat>` | Categoría de tickets |
| `/config suggestions <canal>` | Canal de sugerencias |
| `/config reports <canal>` | Canal de reportes |
| `/config nsfw toggle` | Activar/desactivar NSFW |
| `/config economy toggle` | Activar sistema de economía |
| `/config levels toggle` | Activar sistema de niveles |
| `/config music toggle` | Activar módulo de música |
| `/config starboard <canal>` | Configurar starboard |
| `/config reset` | Resetear toda la configuración |

### 🎫 Tickets (10 comandos)

| Comando | Descripción |
|---|---|
| `/ticket create` | Abrir un nuevo ticket |
| `/ticket close` | Cerrar ticket actual |
| `/ticket add <usuario>` | Añadir usuario al ticket |
| `/ticket remove <usuario>` | Quitar usuario del ticket |
| `/ticket rename <nombre>` | Renombrar ticket |
| `/ticket claim` | Reclamar ticket (staff) |
| `/ticket unclaim` | Liberar ticket |
| `/ticket transcript` | Guardar transcripción |
| `/ticket list` | Ver tickets abiertos |
| `/ticket panel` | Crear panel de tickets |

### 🌦️ Utilidades (30 comandos)

| Comando | Descripción |
|---|---|
| `/weather <ciudad>` | Ver el clima |
| `/weather forecast <ciudad>` | Pronóstico del tiempo |
| `/translate <texto> <idioma>` | Traducir texto |
| `/urban <término>` | Buscar en Urban Dictionary |
| `/wikipedia <término>` | Buscar en Wikipedia |
| `/youtube <búsqueda>` | Buscar en YouTube |
| `/google <búsqueda>` | Buscar en Google |
| `/screenshot <url>` | Captura de pantalla de web |
| `/qr <texto>` | Generar código QR |
| `/shorten <url>` | Acortar URL |
| `/color <hex>` | Info de un color HEX |
| `/emoji info <emoji>` | Info de un emoji |
| `/emoji steal <emoji>` | Robar emoji de otro servidor |
| `/emoji add <url> <nombre>` | Añadir emoji al servidor |
| `/sticker add` | Añadir sticker |
| `/timer <tiempo>` | Crear un temporizador |
| `/reminder <tiempo> <texto>` | Crear recordatorio |
| `/reminder list` | Ver tus recordatorios |
| `/reminder delete <id>` | Eliminar recordatorio |
| `/afk <razón>` | Activar modo AFK |
| `/highlight add <palabra>` | Resaltar palabra |
| `/tag create <nombre>` | Crear etiqueta/respuesta rápida |
| `/tag <nombre>` | Usar una etiqueta |
| `/tag list` | Lista de etiquetas |
| `/note add <texto>` | Añadir nota personal |
| `/note list` | Ver tus notas |
| `/note delete <id>` | Eliminar nota |
| `/calc <expresión>` | Calculadora |
| `/timestamp <fecha>` | Generar timestamp Discord |
| `/base64 encode <texto>` | Codificar en Base64 |

### 🖼️ Imágenes & Fun (20 comandos)

| Comando | Descripción |
|---|---|
| `/meme` | Meme aleatorio |
| `/meme create <template>` | Crear meme personalizado |
| `/gif <búsqueda>` | Buscar GIF |
| `/cat` | Foto de gato aleatoria |
| `/dog` | Foto de perro aleatoria |
| `/fox` | Foto de zorro aleatoria |
| `/hug <usuario>` | Abrazar a alguien |
| `/kiss <usuario>` | Besar a alguien |
| `/slap <usuario>` | Golpear a alguien |
| `/pat <usuario>` | Acariciar a alguien |
| `/ship <user1> <user2>` | Compatibilidad de pareja |
| `/pp <usuario>` | Medidor de pp 😂 |
| `/iq <usuario>` | Medidor de IQ |
| `/rate <cosa>` | Calificar algo |
| `/mock <texto>` | Texto SaRcÁsTiCo |
| `/reverse <texto>` | Texto al revés |
| `/clap <texto>` | Texto 👏 con 👏 aplausos |
| `/ascii <texto>` | Convertir a arte ASCII |
| `/triggered <usuario>` | GIF triggered |
| `/roblox <usuario>` | Info de perfil Roblox |

### 🤖 IA & Chatbot (10 comandos)

| Comando | Descripción |
|---|---|
| `/ask <pregunta>` | Preguntarle a la IA |
| `/imagine <descripción>` | Generar imagen con IA |
| `/summarize <texto>` | Resumir texto con IA |
| `/chat enable` | Activar chatbot en canal |
| `/chat disable` | Desactivar chatbot |
| `/chat personality <tipo>` | Cambiar personalidad de IA |
| `/code <lenguaje> <descripción>` | Generar código con IA |
| `/explain <concepto>` | Explicar un concepto |
| `/joke` | Chiste aleatorio con IA |
| `/roast <usuario>` | Roast con IA |

---

## 📖 Wiki

La documentación completa está en la carpeta [`wiki/`](wiki/):

- [🏠 Wiki Principal](wiki/Home.md)
- [🎵 Módulo Música](wiki/Music.md)
- [📻 Módulo Radio](wiki/Radio.md)
- [🛡️ Módulo Moderación](wiki/Moderation.md)
- [💰 Módulo Economía](wiki/Economy.md)
- [⚙️ Configuración](wiki/Configuration.md)
- [☁️ Deploy Fly.io](wiki/Deploy-Flyio.md)

---

## 🤝 Contribuir

```bash
# Fork el repo, crea tu rama
git checkout -b feature/mi-feature

# Haz tus cambios y commit
git commit -m 'feat: añadir nuevo comando'

# Push y abre Pull Request
git push origin feature/mi-feature
```

---

<div align="center">

**Solome Bot** — Hecho con ❤️ por [luisitoys12](https://github.com/luisitoys12)

🌐 Irapuato, Guanajuato, México

</div>
