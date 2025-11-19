# 🚀 Baba Radio - Roadmap de Funcionalidades

## ✅ Funcionalidades Actuales (v3.0)

### 🎵 Música
- [x] Reproducción de radio (iHeartRadio)
- [x] Reproducción de YouTube
- [x] Búsqueda interactiva de estaciones
- [x] Menús desplegables

### 🎮 Juegos
- [x] Bola 8 mágica
- [x] Tic-Tac-Toe (Gato)
- [x] Connect 4 (4 en línea)

### 📚 Información
- [x] Wikipedia (5 idiomas)
- [x] Respuesta a menciones con ayuda

### 🔧 Sistema
- [x] Slash commands
- [x] Sin intents privilegiados
- [x] Estado de streaming
- [x] Logs completos

---

## 🔄 En Desarrollo (v3.5)

### 🎵 Sistema de Música Avanzado con Lavalink

#### Características Principales:
- [ ] **Lavalink Integration** - Sistema de audio profesional
  - Mejor calidad de audio
  - Menor uso de recursos
  - Mayor estabilidad

- [ ] **Múltiples Fuentes de Audio**
  - YouTube (✅ ya implementado)
  - Spotify
  - SoundCloud
  - Enlaces directos MP3/WAV/OGG
  - Radio streams personalizadas
  - Apple Music
  - Deezer

#### Comandos de Música:
- [ ] `/music <query>` - Reproducir de cualquier fuente
- [ ] `/queue` - Ver cola de reproducción
- [ ] `/skip` - Saltar canción
- [ ] `/pause` - Pausar reproducción
- [ ] `/resume` - Reanudar reproducción
- [ ] `/stop` - Detener y limpiar cola
- [ ] `/volume <1-100>` - Ajustar volumen
- [ ] `/nowplaying` - Ver canción actual
- [ ] `/shuffle` - Mezclar cola
- [ ] `/loop` - Repetir canción/cola
- [ ] `/seek <tiempo>` - Saltar a tiempo específico
- [ ] `/lyrics` - Mostrar letra de la canción

---

## 🛡️ Moderación (Planeado v4.0)

### Comandos Básicos:
- [ ] `/kick <usuario> [razón]` - Expulsar usuario
- [ ] `/ban <usuario> [razón]` - Banear usuario
- [ ] `/unban <usuario>` - Desbanear usuario
- [ ] `/timeout <usuario> <duración> [razón]` - Silenciar temporalmente
- [ ] `/untimeout <usuario>` - Quitar silencio
- [ ] `/warn <usuario> <razón>` - Advertir usuario
- [ ] `/warnings <usuario>` - Ver advertencias
- [ ] `/clear <cantidad>` - Eliminar mensajes
- [ ] `/slowmode <segundos>` - Modo lento en canal
- [ ] `/lock` - Bloquear canal
- [ ] `/unlock` - Desbloquear canal

### Sistema de Logs:
- [ ] Registro de acciones de moderación
- [ ] Logs de mensajes eliminados
- [ ] Logs de usuarios baneados/expulsados
- [ ] Logs de cambios de roles
- [ ] Logs de entradas/salidas

### Auto-Moderación:
- [ ] Filtro de palabras prohibidas
- [ ] Anti-spam
- [ ] Anti-raid
- [ ] Anti-links
- [ ] Anti-invites
- [ ] Límite de menciones

---

## 🎭 Sistema de Roles (Planeado v4.0)

### Gestión de Roles:
- [ ] `/role add <usuario> <rol>` - Dar rol
- [ ] `/role remove <usuario> <rol>` - Quitar rol
- [ ] `/role create <nombre> [color]` - Crear rol
- [ ] `/role delete <rol>` - Eliminar rol
- [ ] `/role info <rol>` - Información del rol
- [ ] `/role list` - Listar todos los roles

### Roles Automáticos:
- [ ] `/autorole set <rol>` - Rol automático al unirse
- [ ] `/autorole remove` - Quitar rol automático
- [ ] Roles por reacción (reaction roles)
- [ ] Roles temporales
- [ ] Roles por nivel/experiencia

### Juego de Roles (RPG):
- [ ] Sistema de niveles
- [ ] Sistema de experiencia
- [ ] Economía virtual
- [ ] Inventario de items
- [ ] Misiones/Quests
- [ ] Batallas entre usuarios
- [ ] Tienda de items
- [ ] Rankings

---

## 📊 Información y Utilidades (Planeado v4.0)

### Comandos de Información:
- [ ] `/botinfo` - Información del bot
- [ ] `/serverinfo` - Información del servidor
- [ ] `/userinfo <usuario>` - Información de usuario
- [ ] `/avatar <usuario>` - Avatar de usuario
- [ ] `/banner <usuario>` - Banner de usuario
- [ ] `/roleinfo <rol>` - Información de rol
- [ ] `/channelinfo <canal>` - Información de canal
- [ ] `/ping` - Latencia del bot
- [ ] `/uptime` - Tiempo en línea
- [ ] `/stats` - Estadísticas del bot

### Utilidades:
- [ ] `/poll <pregunta> [opciones]` - Crear encuesta
- [ ] `/remind <tiempo> <mensaje>` - Recordatorio
- [ ] `/translate <idioma> <texto>` - Traducir texto
- [ ] `/weather <ciudad>` - Clima
- [ ] `/calculator <expresión>` - Calculadora
- [ ] `/qrcode <texto>` - Generar código QR
- [ ] `/shorten <url>` - Acortar URL

---

## 🎁 Sistema de Sorteos (Planeado v4.5)

### Comandos de Sorteos:
- [ ] `/giveaway start` - Iniciar sorteo
  - Duración
  - Premio
  - Número de ganadores
  - Requisitos (roles, nivel, etc.)
- [ ] `/giveaway end <id>` - Terminar sorteo anticipadamente
- [ ] `/giveaway reroll <id>` - Reelegir ganador
- [ ] `/giveaway list` - Listar sorteos activos
- [ ] `/giveaway delete <id>` - Eliminar sorteo

### Características:
- [ ] Sorteos programados
- [ ] Requisitos personalizables
- [ ] Múltiples ganadores
- [ ] Notificaciones automáticas
- [ ] Historial de sorteos

---

## 💎 Sistema Premium/Pro (Planeado v5.0)

### Características Premium:

#### 🎵 Música Premium:
- [ ] Cola ilimitada (vs 10 canciones gratis)
- [ ] Calidad de audio superior
- [ ] Sin anuncios
- [ ] Filtros de audio (bass boost, nightcore, etc.)
- [ ] Ecualizador personalizado
- [ ] Guardar playlists
- [ ] Importar playlists de Spotify/YouTube

#### 🛡️ Moderación Premium:
- [ ] Auto-moderación avanzada con IA
- [ ] Logs ilimitados
- [ ] Backup automático de configuración
- [ ] Múltiples configuraciones guardadas
- [ ] Comandos de moderación masiva
- [ ] Sistema de tickets avanzado

#### 📢 Anuncios Premium:
- [ ] `/announce` - Anuncios personalizados
- [ ] Programar anuncios
- [ ] Anuncios con embeds personalizados
- [ ] Anuncios a múltiples canales
- [ ] Plantillas de anuncios
- [ ] Anuncios con botones interactivos

#### ✅ Verificación Premium:
- [ ] Sistema de verificación por captcha
- [ ] Verificación por reacción
- [ ] Verificación por preguntas
- [ ] Verificación por email
- [ ] Verificación por teléfono
- [ ] Anti-bots avanzado
- [ ] Whitelist/Blacklist

#### 🎨 Personalización Premium:
- [ ] Comandos personalizados ilimitados
- [ ] Respuestas automáticas personalizadas
- [ ] Embeds personalizados
- [ ] Botones personalizados
- [ ] Menús personalizados
- [ ] Eventos personalizados

#### 📊 Estadísticas Premium:
- [ ] Dashboard web completo
- [ ] Gráficas de actividad
- [ ] Análisis de usuarios
- [ ] Reportes automáticos
- [ ] Exportar datos
- [ ] API de acceso

---

## 🌐 Portal Web (Planeado v5.0)

### Acceso:
- [ ] `/portal` - Obtener link de acceso al portal
- [ ] Login con Discord OAuth2
- [ ] Panel de control intuitivo

### Funcionalidades del Portal:

#### 📝 Comandos Personalizados:
- [ ] Crear comandos desde la web
- [ ] Editor visual de comandos
- [ ] Variables y placeholders
- [ ] Condiciones y lógica
- [ ] Respuestas múltiples
- [ ] Cooldowns personalizados
- [ ] Permisos por comando

#### ⚙️ Configuración:
- [ ] Configurar todos los módulos
- [ ] Activar/desactivar funciones
- [ ] Configurar prefijos
- [ ] Configurar canales de logs
- [ ] Configurar roles automáticos
- [ ] Configurar auto-moderación

#### 📊 Dashboard:
- [ ] Estadísticas en tiempo real
- [ ] Gráficas de uso
- [ ] Logs de comandos
- [ ] Actividad de usuarios
- [ ] Uso de música
- [ ] Moderación reciente

#### 👥 Gestión de Usuarios:
- [ ] Ver todos los usuarios
- [ ] Historial de moderación
- [ ] Advertencias
- [ ] Notas de moderadores
- [ ] Búsqueda avanzada

#### 🎵 Gestión de Música:
- [ ] Playlists guardadas
- [ ] Historial de reproducción
- [ ] Canciones favoritas
- [ ] Configuración de música

---

## 🎯 Información del Creador

### Comando `/creator`:
- [ ] Información sobre el creador del bot
- [ ] Links a redes sociales
- [ ] Servidor de soporte
- [ ] Cómo contribuir
- [ ] Donaciones/Premium

---

## 📅 Timeline Estimado

### v3.5 (Actual - En Desarrollo)
- Lavalink integration
- Música de múltiples fuentes
- Comandos de música avanzados
- **ETA: 1-2 semanas**

### v4.0 (Próximo)
- Sistema de moderación completo
- Sistema de roles
- Información y utilidades
- **ETA: 1 mes**

### v4.5 (Futuro Cercano)
- Sistema de sorteos
- Más juegos
- Más utilidades
- **ETA: 2 meses**

### v5.0 (Futuro)
- Sistema Premium
- Portal Web
- API pública
- **ETA: 3-4 meses**

---

## 🤝 Contribuir

Si quieres contribuir al desarrollo:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Crea un Pull Request

---

## 📞 Soporte

- Discord: [Servidor de Soporte](#)
- GitHub: [Issues](https://github.com/perronosaurio/baba-radio/issues)
- Email: support@babaradio.com

---

**Última actualización:** 2025-11-19  
**Versión actual:** 3.0  
**Próxima versión:** 3.5 (En desarrollo)
