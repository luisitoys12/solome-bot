# 🎧 Solome Bot 4.0 – Baba Radio + Solome AI

Solome Bot 4.0 (Baba Radio) es un bot multifuncional para Discord que combina:

- Radio online (iHeart, TuneIn, MyTuner).
- Música vía Lavalink v4 (local en Docker, con varios nodos públicos de backup).
- Juegos y minijuegos para gamers.
- Sistema de lotería del servidor.
- **Solome AI**: generación de imágenes/texto con créditos diarios.
- **Solome Assistant**: chat privado por hilos (beta, acceso con código).

---

## ✨ Novedades 4.0

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
- Infraestructura lista para:
  - Perfiles gamer.
  - Alter-ego/therian/fursona (tendencias Gen Z).
  - Más funciones premium.

---

## 🧩 Requisitos

- Node.js 18 o superior.
- Docker y Docker Compose (para Lavalink local).
- Token de bot de Discord.
- (Opcional) API propia o pública para IA (texto e imagen) accesible vía HTTP.

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/luisitoys12/solome-bot.git
cd solome-bot
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` y rellena:

```env
DISCORD_TOKEN=TU_TOKEN_AQUI
CLIENT_ID=ID_DE_TU_BOT
GUILD_ID=ALGUN_GUILD_PARA_REGISTRAR_COMANDOS
NODE_ENV=production
```

### 3. Instalar dependencias del bot

```bash
npm install
```

> El proyecto usa **discord.js v14**, `@discordjs/voice`, `axios` y otros módulos ya definidos en `package.json`.

---

## 📦 Lavalink v4 en Docker

Solome Bot está preparado para trabajar con:

- Un **Lavalink local** en Docker.
- Varios **nodos públicos** definidos en `lavalink.config.js`.

### 3.1. Levantar Lavalink local

El archivo `docker-compose.yml` ya está incluido en el proyecto.

```bash
docker compose up -d lavalink
```

El bot usará este nodo local más los nodos públicos definidos en `lavalink.config.js` (ajieblogs, DivaHost, RudraCloud, etc.).

Asegúrate de que `lavalink-server/application.yml` contiene la contraseña `babaradio2025` y los plugins que quieras cargar.

---

## 🔧 Configuración de Lavalink en el bot

El archivo `lavalink.config.js` ya viene con varios nodos:

- `baba-local` (localhost:2333).
- `ajie-v4-ssl` (nodo público principal, SSL).
- Otros nodos de backup (DivaHost, RudraCloud, Inzeworld, Nextgen, LavalinkHub).

Si necesitas cambiar contraseñas o hosts, edita `lavalink.config.js`.

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

## 🎟️ Lotería del servidor

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

## 🎮 Funciones gamer y tendencias

(TODO en próximas versiones, ya está la estructura lista):

- Perfiles gamer (plataformas, juegos favoritos).
- Matchmaking para armar squads.
- Alter-ego / therian / fursona:
  - Comando para guardar "animal interior" o avatar.
  - Integración con mensajes de juegos y lotería.

---

## 🧪 Comandos principales

- `/radio` – Buscar y reproducir estaciones de radio.
- `/play` / `/stop` / `/skip` / `/queue` – Comandos de música.
- `/loteria` – Sistema de lotería.
- `/ia` – Solome AI (imagen, texto, info, recargar).
- `/charlar` – Abrir chat con Solome Assistant.
- Varios comandos extra: moderación, juegos, info, tickets, etc. (ver `COMMANDS.md`).

---

## ▶️ Puesta en marcha rápida

1. Clona el repo y configura `.env`.
2. Instala dependencias:

   ```bash
   npm install
   ```

3. Levanta Lavalink local en Docker:

   ```bash
   docker compose up -d lavalink
   ```

4. Registra los comandos de aplicación:

   ```bash
   npm run register
   ```

5. Inicia el bot:

   ```bash
   npm start
   ```

---

## 🌟 Funciones destacadas

### Radio multicanalera
- Búsqueda en iHeartRadio, TuneIn y MyTuner.
- Selección interactiva con menú desplegable.
- Compatible con Lavalink v4.

### Lotería del servidor
- Sistema de boletos con bote acumulable.
- Sorteo automático o manual por admins.
- Integración futura con economía del bot.

### IA Generativa
- Créditos diarios para uso justo.
- Imágenes y texto generados por IA.
- Sistema extensible para video y más medios.

### Asistente conversacional
- Chat privado en threads.
- Control de acceso con códigos beta.
- Límite de mensajes por sesión.

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
