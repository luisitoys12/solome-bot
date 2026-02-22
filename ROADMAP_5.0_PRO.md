# 🚀 Solome Bot 5.0 Pro – Roadmap

> **Visión**: Transformar Solome de un bot de música/radio en una plataforma completa con dashboard público, economía integrada, sistema de publicidad tipo Spotify, y herramientas avanzadas para comunidades Discord.

---

## 📋 Índice

1. [Núcleo 5.0 (Core)](#1-núcleo-50-core)
2. [Dashboard Público](#2-dashboard-público-tipo-probotsuno)
3. [IA Configurable](#3-ia-configurable-por-dueño-de-bot)
4. [Economía y Créditos](#4-economía-y-créditos-del-servidor)
5. [Publicidad + SOLOME Sponsor](#5-publicidad-integrada--solome-sponsor)
6. [Radio 24/7 y Streaming](#6-radio-247-y-streaming-externo)
7. [Módulo de Deportes](#7-módulo-de-deportes)
8. [Planes Free vs Pro](#8-planes-free-vs-pro)
9. [Sistema Beta + Owner Benefits](#9-sistema-beta--owner-benefits)
10. [Timeline y Milestones](#timeline-estimado)

---

## 1. Núcleo 5.0 (Core)

### 🔧 Modernización técnica

- **Actualización de dependencias**:
  - Revisar y actualizar paquetes npm con warnings de deprecated.
  - Mantener compatibilidad con Node.js 18+.
  - Documentar breaking changes.

- **Sistema de comandos híbrido**:
  - ✅ Mantener comandos slash existentes.
  - ✨ **NUEVO**: Añadir soporte para prefix `!` (ej. `!play`, `!radio`, `!duelo`).
  - Handler en `messageCreate` para comandos de texto.
  - Mapeo automático: comandos slash → comandos prefix.

- **Unificación del motor de audio**:
  - Motor único para música + radio + anuncios.
  - Reconexión automática para radio 24/7.
  - Sistema de colas mejorado con prioridad para anuncios.

### 📁 Archivos afectados
```
src/utils/prefixHandler.js        # NUEVO: Handler de comandos !
src/core/audioEngine.js           # NUEVO: Motor unificado
package.json                      # Actualización de deps
```

---

## 2. Dashboard Público (tipo ProBot/Suno)

### 🎯 Objetivo
Dashboard web accesible para **todos los servidores**, no solo admins del bot.

### ✨ Características principales

#### Autenticación
- Login con **Discord OAuth2**.
- Listado de servidores donde el usuario tiene permisos de administrador.
- JWT para sesiones seguras.

#### Vista por servidor
Cada servidor accede a su panel con estas secciones:

**🎵 Música/Radio**
- Canal por defecto para música/radio.
- Volumen global.
- Permisos: quién puede usar `/play`, `/radio`, etc.
- Toggle de radio 24/7.

**🤖 IA**
- Activar/desactivar comandos de IA.
- Ver límites de créditos.
- Modo Free vs Pro.

**🎮 Juegos y Lotería**
- Toggles para activar/desactivar juegos.
- Config de lotería: precio de boletos, horarios de sorteo.

**💰 Economía**
- Configuración de monedas internas (SolomeCoins/BabaCoins).
- Recompensas por acción (música, juegos, radio).
- Gastos: roles, perks, comandos especiales.

**📺 Publicidad**
- Estado de anuncios (activos en Free, desactivados en Pro).
- Opción de actualizar a Pro.
- Métricas: cuántos anuncios se han mostrado.

#### Comando de acceso rápido
```
/panel  →  Devuelve link directo al dashboard del servidor
```

### 🛠️ Stack técnico sugerido
```
Frontend: React/Next.js + TailwindCSS
Backend: Node.js/Express (API REST)
Base de datos: PostgreSQL o MongoDB
Auth: Discord OAuth2 + JWT
Hosting: Vercel (frontend) + VPS/Railway (backend)
```

### 📁 Estructura de archivos
```
dashboard/
├── frontend/              # React/Next.js
│   ├── pages/
│   │   ├── index.js       # Landing page
│   │   ├── login.js       # OAuth login
│   │   ├── servers.js     # Lista de servidores
│   │   └── [guildId]/     # Panel por servidor
│   └── components/
├── backend/               # Express API
│   ├── routes/
│   │   ├── auth.js
│   │   ├── guilds.js
│   │   └── config.js
│   └── middleware/
└── shared/                # Types/schemas compartidos
```

---

## 3. IA Configurable por Dueño de Bot

### 🎯 Objetivo
Permitir que **owners del bot** elijan proveedores de IA desde el dashboard admin.

### ✨ Proveedores soportados
- OpenAI (GPT-4, DALL-E)
- Google Gemini (texto, imagen, Veo video)
- Anthropic (Claude)
- Local (Ollama)
- HTTP genérico (custom endpoints)

### 🔑 Config por owner
Panel especial "**AI Providers**" (solo para OWNER_IDS):

1. Elegir proveedor principal.
2. Pegar API keys y endpoints.
3. Seleccionar modelos por tipo:
   - **Chat**: `/ia texto`, `/charlar`
   - **Imagen**: `/ia imagen`
   - **TTS**: Para anuncios SOLOME Sponsor, radio, etc.

### 📦 Config opcional por servidor (Pro)
Servidores Pro pueden usar su propia API:
- Sobrescribe la config global.
- Útil para empresas que quieren usar sus propias cuentas.

### 🛠️ Implementación técnica

**Servicio centralizado**:
```javascript
// src/services/aiService.js
class AIService {
  async chat({ provider, model, messages, guildId }) {
    const config = await this.getConfig(guildId)
    switch (config.provider) {
      case 'openai': return this.openaiChat(...)
      case 'gemini': return this.geminiChat(...)
      case 'anthropic': return this.claudeChat(...)
      default: throw new Error('Provider not supported')
    }
  }
  
  async image({ provider, prompt, guildId }) { ... }
  async tts({ provider, text, guildId }) { ... }
}
```

**Todos los comandos de IA llaman a este servicio**:
```javascript
// src/commands/ia.js
const aiService = require('../services/aiService')

async execute(interaction) {
  const response = await aiService.chat({
    provider: null, // null = usar config del servidor
    messages: [...],
    guildId: interaction.guildId
  })
}
```

### 📁 Archivos
```
src/services/aiService.js         # NUEVO: Servicio central IA
src/config/aiProviders.json       # NUEVO: Config de ejemplo
docs/AI_PROVIDERS_DESIGN.md       # NUEVO: Documentación técnica
```

---

## 4. Economía y Créditos del Servidor

### 💰 Sistema de monedas

#### Moneda interna: SolomeCoins / BabaCoins
- **Ganas por**:
  - Escuchar música (X coins/minuto).
  - Participar en juegos.
  - Estar en radio 24/7.
  - Eventos especiales.
- **Gastas en**:
  - Lotería (`/loteria jugar`).
  - Roles especiales.
  - Boosts temporales (más XP, skip sin límite, etc.).
  - Comandos premium.

#### Créditos del servidor
- **Uso**: IA, boosts de radio, funciones Pro temporales.
- **Obtención**:
  - Plan Free: créditos limitados + regeneración lenta.
  - Plan Pro: créditos ilimitados o muy altos.
  - Publicidad: cada X anuncios mostrados = +Y créditos.

### 📊 Dashboard de economía

**Por servidor**:
- Saldo de créditos global.
- Top 10 usuarios con más coins.
- Config de recompensas:
  - Cantidad de coins por minuto de música.
  - Multiplicadores por eventos.
- Config de gastos:
  - Precio de boletos de lotería.
  - Costo de roles/perks.

### 🛠️ Base de datos
```sql
-- Tabla de economía por usuario
CREATE TABLE user_economy (
  user_id VARCHAR(20),
  guild_id VARCHAR(20),
  coins BIGINT DEFAULT 0,
  xp BIGINT DEFAULT 0,
  level INT DEFAULT 1,
  last_daily TIMESTAMP,
  PRIMARY KEY (user_id, guild_id)
);

-- Tabla de créditos por servidor
CREATE TABLE guild_credits (
  guild_id VARCHAR(20) PRIMARY KEY,
  credits INT DEFAULT 100,
  plan VARCHAR(10) DEFAULT 'free',
  last_reset TIMESTAMP
);
```

---

## 5. Publicidad Integrada + SOLOME Sponsor

### 📢 Publicidad por defecto (tipo Spotify)

#### En servidores Free
**3 campañas globales precargadas**:
1. "Mejora a Solome Pro y quita anuncios."
2. "Activa Solome Radio 24/7 en tu servidor."
3. "Descubre SOLOME Sponsor para anunciar tu marca."

**Reproducción automática**:
- **Audio**: spots cortos (15-30s) cada X canciones o Y minutos.
- **Texto**: embeds en canal de comandos con CTA.

#### En servidores Pro
- ❌ Sin anuncios globales.
- ✅ Pueden crear anuncios locales (ej. su Twitch, YouTube).

### 💼 SOLOME Sponsor Dashboard

**Panel para sponsors** (separado del dashboard principal):

1. **Crear campaña**:
   - Tipo: Mensaje (texto → TTS automático) o Audio (subir MP3).
   - Target:
     - Países/idiomas.
     - Tipo de servidor (gaming, música, tech, etc.).
   - Frecuencia: cada X canciones/minutos.
   - Presupuesto: paquete de impresiones o mensual.

2. **Pago con Stripe**:
   - Planes: 1000 impresiones, 5000 impresiones, plan mensual.
   - Webhook para activar campaña.

3. **Métricas**:
   - Impresiones totales.
   - Clics (si es mensaje con link).
   - Plays de audio.
   - Servidores alcanzados.

### 🤖 Integración bot ↔ dashboard

**El bot**:
1. Pregunta al backend: "¿Tengo sponsor pendiente para este servidor?"
2. Si hay campaña activa:
   - **Mensaje**: envía embed en canal.
   - **Audio**: lo añade a la cola de Lavalink.
3. Reporta métricas al backend.

### 🎙️ TTS para mensajes de sponsor
- Sponsors escriben solo texto.
- Backend usa IA TTS (Google, OpenAI, ElevenLabs) para generar audio.
- Cachea el audio generado.

### 📁 Estructura
```
sponsor-dashboard/
├── frontend/              # Panel de sponsors
├── backend/
│   ├── routes/
│   │   ├── campaigns.js   # CRUD de campañas
│   │   ├── payments.js    # Stripe webhooks
│   │   └── metrics.js     # Reportes
│   └── services/
│       └── ttsService.js  # NUEVO: TTS para anuncios
```

---

## 6. Radio 24/7 y Streaming Externo

### 📻 Comando dedicado

```
/radio24 <url>  →  Fijar emisora 24/7
/radio24 stop   →  Detener radio 24/7
/autoplay       →  Modo emisora automática
```

**Características**:
- Acepta URLs de streaming: MP3, AAC, OGG, HLS.
- Reconexión automática al canal de voz.
- Prioridad sobre música normal.
- Inserción de anuncios (solo Free).

### 🎛️ Config en dashboard
- Canal de voz fijo para radio 24/7.
- Toggle: encender/apagar.
- Historial de emisoras guardadas.

### 🛠️ Implementación
```javascript
// src/commands/radio24.js
class Radio24Command {
  async execute(interaction) {
    const url = interaction.options.getString('url')
    await this.audioEngine.startRadio24({
      guildId: interaction.guildId,
      channelId: ...,
      streamUrl: url,
      autoReconnect: true
    })
  }
}
```

---

## 7. Módulo de Deportes

### ⚽ Comandos

```
/deportes futbol        →  Marcadores y próximos partidos
/deportes tabla         →  Tabla de posiciones
/deportes equipo <name> →  Info de equipo específico
/deportes hoy           →  Partidos de hoy + cuotas (Pro)
```

### 🏆 Integraciones API
- **APIs de odds**: Caliente, Bet365, otros proveedores.
- **Uso**: Solo como fuente de **datos** (NO para apuestas reales).
- **Mostrar**: horarios, resultados, cuotas, estadísticas.

### 💸 Apuestas virtuales (solo moneda interna)

**Función Premium**:
- Los usuarios "apuestan" con SolomeCoins (moneda virtual).
- No hay intercambio de dinero real.
- Los ganadores reciben coins según cuotas.

```
/deportes apostar <partido> <opcion> <cantidad>
→  "Apuestas 100 SolomeCoins a que gana el América"
```

### 🎛️ Config en dashboard
- Ligas favoritas del servidor (Liga MX, Champions, etc.).
- Activar/desactivar apuestas virtuales.
- Canal para anuncios de resultados.

### 📁 Estructura
```
src/commands/deportes/
├── futbol.js
├── tabla.js
├── equipo.js
└── apostar.js             # NUEVO: Apuestas virtuales (Pro)
src/services/oddsService.js  # NUEVO: Integración APIs
```

---

## 8. Planes Free vs Pro

### 🆓 Plan Free

**Incluye**:
- ✅ Música y radio básica.
- ✅ IA con límites (X créditos/día).
- ✅ Juegos y lotería.
- ✅ Economía interna.

**Limitaciones**:
- 📢 Anuncios activos (audio + texto).
- ⏱️ Límite de duración de canciones.
- 📊 Límite de tamaño de cola.
- 🤖 Créditos de IA limitados.

### 💎 Plan Pro

**Precio**: $4.99/mes por servidor

**Incluye**:
- ✅ Todo de Free.
- ❌ **Sin anuncios**.
- ⚡ Límites ampliados:
  - Colas ilimitadas.
  - Sin límite de duración.
  - Más créditos de IA.
- 📻 Radio 24/7 real.
- 🏆 Módulo de deportes + apuestas virtuales.
- 🎛️ Dashboard avanzado:
  - Gráficas de uso.
  - Config de economía detallada.
  - IA personalizada (opcional).
- 📺 Anuncios locales personalizados.

### 🔐 Beta Supporter

**Cómo obtenerlo**:
- Donar/apoyar el proyecto (Patreon, Ko-fi, etc.).
- Ser tester oficial.
- Contribuir al código.

**Beneficios**:
- ✅ Todo de Pro.
- 🧪 Acceso a **comandos beta** antes que nadie:
  - Nuevos juegos.
  - Comandos experimentales de IA.
  - Integraciones tempranas.
- 🎛️ Pestaña "Laboratorio" en dashboard.

### 👑 Owner Benefits (Gratis)

**Para IDs en `OWNER_IDS`**:
- ✅ Acceso total sin pagar.
- ✅ Todas las funciones Pro + Beta.
- 🛠️ Admin Dashboard completo.
- 💻 Guía para hostear gratis en **GitHub Codespaces**.

---

## 9. Sistema Beta + Owner Benefits

### 🧪 Gestión de Beta Testers

**Listas**:
```javascript
// src/config/beta.json
{
  "betaUsers": ["123456789", "987654321"],
  "betaGuilds": ["111222333", "444555666"]
}
```

**Verificación en comandos**:
```javascript
if (command.beta && !isBetaUser(interaction.user.id)) {
  return interaction.reply('Este comando está en beta. Apoya el proyecto para acceder.')
}
```

### 👑 Owner Access

**Config**:
```javascript
// src/config/owners.json
{
  "ownerIds": ["TU_USER_ID"]
}
```

**Beneficios automáticos**:
- Sin límites de créditos.
- Sin anuncios.
- Acceso a todos los comandos (incluidos beta y dev).
- Panel admin en dashboard.

### 📘 Guía para owners

**README sección especial**:
> "Si eres owner de Solome o desarrollador, abre el repo en **GitHub Codespaces** y tendrás TODO desbloqueado gratis: funciones Pro, Beta, y panel admin completo."

**Pasos**:
1. Fork del repo.
2. Click en "Open in Codespaces".
3. `cp .env.example .env` y pegar token.
4. `npm install && npm run register && npm start`.

---

## Timeline Estimado

### 🎯 Fase 1: Fundación (Marzo - Abril 2026)
- ✅ Actualizar dependencias.
- ✅ Implementar prefix handler (`!`).
- ✅ Crear estructura de dashboard (frontend + backend básico).
- ✅ Sistema de auth con Discord OAuth2.

### 🎯 Fase 2: Core Features (Mayo - Junio 2026)
- ✅ AI Service centralizado.
- ✅ Dashboard público funcional (música, IA, juegos).
- ✅ Economía interna básica.
- ✅ Radio 24/7.

### 🎯 Fase 3: Monetización (Julio - Agosto 2026)
- ✅ Sistema de anuncios Free.
- ✅ SOLOME Sponsor Dashboard.
- ✅ Integración Stripe para Pro.
- ✅ TTS para anuncios.

### 🎯 Fase 4: Expansión (Septiembre - Octubre 2026)
- ✅ Módulo de deportes.
- ✅ Apuestas virtuales.
- ✅ Dashboard avanzado (gráficas, métricas).
- ✅ Sistema beta.

### 🎯 Fase 5: Lanzamiento 5.0 (Noviembre 2026)
- 🚀 **Release v5.0.0 Pro**.
- 📢 Marketing y anuncios.
- 📊 Monitoreo y feedback.

---

## 🤝 Contribuciones

Para colaborar en el desarrollo de 5.0 Pro:

1. Revisa los [issues con etiqueta `5.0-roadmap`](https://github.com/luisitoys12/solome-bot/labels/5.0-roadmap).
2. Lee la [guía de contribución](CONTRIBUTING.md).
3. Únete al servidor de Discord para coordinar.

---

## 📝 Notas

- Este roadmap es dinámico y se actualizará según feedback.
- Las fechas son estimadas y pueden cambiar.
- Los nombres de comandos y funciones pueden variar en la implementación final.

---

**Versión del roadmap**: 1.0  
**Última actualización**: Febrero 21, 2026  
**Próxima revisión**: Marzo 2026
