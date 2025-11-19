# 🚀 Baba Radio - Ultimate All-in-One Bot

## ✨ TODAS LAS FUNCIONALIDADES IMPLEMENTADAS

**Versión:** 4.0.0  
**Comandos Totales:** 28  
**Estado:** 🟢 Operacional  
**Desarrollador:** djluisalegre  

---

## 🎯 FUNCIONES PRINCIPALES

### 1. ⏰ **SISTEMA DE UPTIME Y REPORTES**

**Comando:** `/uptime`
- Muestra tiempo exacto de actividad
- Días, horas, minutos, segundos
- Estado del bot y ping
- Botón de reporte de problemas

**Reporte de Problemas:**
- Botón "🚨 Reportar Problema"
- Envía DM automático a djluisalegre
- Incluye información del usuario y servidor
- Timestamp del reporte

---

### 2. 🔧 **MODO MANTENIMIENTO**

**Características:**
- ✅ Activación/desactivación automática
- ✅ Estado en streaming: "🔧 En Mantenimiento"
- ✅ Mensaje personalizado durante mantenimiento
- ✅ Tiempo estimado de finalización
- ✅ Solo `/uptime` funciona durante mantenimiento
- ✅ Todos los demás comandos responden con mensaje de mantenimiento

**Archivo:** `maintenance.json`
```json
{
  "enabled": false,
  "reason": "Actualizaciones del sistema",
  "startTime": null,
  "estimatedEnd": "5 minutos"
}
```

---

### 3. 🤖 **AUTO-MODERACIÓN INTELIGENTE**

**Detección de Groserías en Múltiples Idiomas:**
- 🇪🇸 Español
- 🇬🇧 Inglés
- 🇵🇹 Portugués
- 🇫🇷 Francés
- 🇩🇪 Alemán

**Acción Automática:**
- ❌ Elimina el mensaje
- 🔇 Silencia al usuario por 1 minuto
- ⚠️ Envía advertencia temporal (5 segundos)
- 📝 Registra en logs

**Palabras Detectadas:** 40+ groserías en 5 idiomas

---

### 4. 📢 **SISTEMA DE ANUNCIOS**

**Comando:** `/announce`

**Opciones:**
- Canal de destino
- Título del anuncio
- Mensaje completo
- Color personalizado (hex)
- Menciones (@everyone, @here, ninguna)

**Características:**
- ✅ Solo administradores
- ✅ Embeds personalizados
- ✅ Footer con autor
- ✅ Timestamp automático

---

### 5. 😂 **MEMES Y GIFS**

**Comando:** `/meme`
- Memes aleatorios de Reddit
- Información del subreddit
- Votos (upvotes)
- Imagen de alta calidad

**Comando:** `/gif`
- Búsqueda en Giphy
- GIFs animados
- Búsqueda por palabra clave
- Rating PG-13

---

### 6. 🌐 **DASHBOARD WEB OPERATIVO**

**Ubicación:** `dashboard/index.html`

**Características:**
- ✅ Diseño moderno y responsive
- ✅ Estadísticas en tiempo real
- ✅ Información de comandos
- ✅ Planes premium
- ✅ Enlaces funcionales
- ✅ Gradientes y animaciones

**Acceso:** Comando `/portal` con enlace directo

---

### 7. 🏨 **30 FUNCIONES INSPIRADAS EN HABBO**

Ver `HABBO_FEATURES.md` para lista completa.

**Categorías:**
1. **Funciones Sociales** (10)
   - Salas virtuales
   - Badges/Insignias
   - Sistema de amigos
   - Estados de usuario
   - Perfiles personalizados

2. **Economía Virtual** (10)
   - Moneda virtual
   - Tienda de items
   - Trading
   - Trabajos virtuales
   - Casino

3. **Personalización** (10)
   - Decoración de canales
   - Temas y colores
   - Mascotas virtuales
   - Emotes personalizados
   - Construcción de salas

---

## 📊 COMANDOS COMPLETOS (28)

### 🎵 Música (7)
1. `/play` - Lavalink v4
2. `/music` - YouTube clásico
3. `/radio` - Radio múltiple
4. `/lyrics` - Letras
5. `/queue` - Cola
6. `/skip` - Saltar
7. `/stop` - Detener

### 🎮 Juegos (3)
8. `/8ball`
9. `/tictactoe`
10. `/connect4`

### 📚 Información (3)
11. `/wikipedia`
12. `/botinfo`
13. `/credits`

### 🛡️ Moderación (7)
14. `/kick`
15. `/ban`
16. `/timeout`
17. `/warn`
18. `/clear`
19. `/lock`
20. `/unlock`

### 🎁 Utilidades (5)
21. `/giveaway`
22. `/portal`
23. `/premium`
24. `/uptime` ⭐ NUEVO
25. `/announce` ⭐ NUEVO

### 🎫 Tickets (1)
26. `/ticket` (6 subcomandos)

### 😂 Diversión (2)
27. `/meme` ⭐ NUEVO
28. `/gif` ⭐ NUEVO

---

## 🎯 CARACTERÍSTICAS TÉCNICAS

### Auto-Moderación
- ✅ 40+ palabras prohibidas
- ✅ 5 idiomas soportados
- ✅ Acción automática (delete + timeout)
- ✅ Logs detallados

### Sistema de Mantenimiento
- ✅ Activación por archivo JSON
- ✅ Estado de streaming personalizado
- ✅ Mensajes informativos
- ✅ Comandos bloqueados excepto uptime

### Reportes
- ✅ Botón interactivo
- ✅ DM automático a desarrollador
- ✅ Información completa del reporte
- ✅ Confirmación al usuario

### APIs Integradas
- ✅ Reddit Meme API
- ✅ Giphy API
- ✅ Lavalink v4
- ✅ iHeartRadio
- ✅ Wikipedia

---

## 🚀 LAVALINK v4 ACTUALIZADO

**Servidor Principal:**
- Host: lavahatry4.techbyte.host:3000
- Version: 4.0.8
- Uptime: 100% (7 días)
- CPU: 6.72% | 12 Core
- Memory: 473.98 MB / 2 GB

**Plugins Activos (8):**
1. lavasrc-plugin v4.7.3
2. java-lyrics-plugin v1.6.5
3. lavasearch-plugin v1.0.0
4. sponsorblock-plugin v3.0.1
5. DuncteBot-plugin v1.7.0
6. jiosaavn-plugin v1.0.3
7. youtube-plugin v1.15.0
8. lavalyrics-plugin v7d60077

---

## 💎 SISTEMA PREMIUM

**3 Tiers Disponibles:**

### Basic - $4.99/mes
- 1 servidor
- Funciones básicas premium
- Cola extendida

### Pro - $9.99/mes
- 3 servidores
- Todas las funciones
- Auto-moderación IA
- Dashboard completo

### Enterprise - $19.99/mes
- Servidores ilimitados
- Soporte 24/7
- API completa
- Funciones personalizadas

---

## 🎊 INNOVACIONES ÚNICAS

1. **Auto-Moderación Multi-Idioma** - Primera vez en Discord
2. **Sistema de Mantenimiento Inteligente** - Con mensajes personalizados
3. **Reportes Directos al Desarrollador** - Un clic
4. **Dashboard HTML Operativo** - Sin necesidad de servidor
5. **30 Funciones Habbo** - Experiencia social única
6. **Lavalink v4 con 8 Plugins** - Audio profesional
7. **28 Comandos Activos** - All-in-One real
8. **Sin Intents Privilegiados** - Funciona en cualquier servidor

---

## 📝 ARCHIVOS IMPORTANTES

- `maintenance.json` - Control de mantenimiento
- `dashboard/index.html` - Dashboard web
- `HABBO_FEATURES.md` - 30 funciones Habbo
- `VERSION_4.0_RELEASE.md` - Notas de lanzamiento
- `ALL_IN_ONE_PLAN.md` - Plan de 168+ comandos

---

## 🎯 PRÓXIMAS ACTUALIZACIONES

### v4.1 (Próxima semana)
- Efecto de trompeta al salir de canales
- Sistema de economía completo
- Más juegos de Habbo
- Sistema de niveles

### v4.5 (Próximo mes)
- Dashboard web con backend
- API pública
- Comandos personalizados
- Sistema de logs avanzado

### v5.0 (Objetivo)
- 168+ comandos
- Todas las funciones Habbo
- IA avanzada
- Sistema de plugins

---

## 🙏 CRÉDITOS

**Desarrollador:** djluisalegre  
**Proyecto:** Solome  
**Lavalink:** TechByte & Yumi Team  
**Inspiración:** Habbo Hotel  
**Comunidad:** Discord.js  

---

## 📞 SOPORTE

- **Reportar Problema:** Usa `/uptime` y haz clic en el botón
- **Dashboard:** `/portal`
- **Premium:** `/premium`
- **GitHub:** https://github.com/perronosaurio/baba-radio

---

**¡Baba Radio v4.0 - El Bot All-in-One Más Completo de Discord! 🚀**

*"Combinando lo mejor de Habbo, Discord y la innovación moderna"*
