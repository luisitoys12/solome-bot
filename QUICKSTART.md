# 🚀 Quick Start - Baba Radio

## ✅ Bot Status: ONLINE

Tu bot está funcionando correctamente con **Slash Commands** (sin necesidad de intents privilegiados).

## 🎵 Cómo Usar el Bot

### Comandos de Música

#### `/search <estación>`
Busca y reproduce estaciones de radio de iHeartRadio.

**Ejemplos:**
- `/search solome` - Busca Solome Radio
- `/search rock` - Busca estaciones de rock
- `/search jazz` - Busca estaciones de jazz

#### `/play <estación>`
Alias de `/search` - hace exactamente lo mismo.

#### `/music <canción>`
Reproduce música de YouTube.

**Ejemplos:**
- `/music despacito` - Busca y reproduce "Despacito"
- `/music bad bunny` - Busca canciones de Bad Bunny
- `/music https://youtube.com/watch?v=...` - Reproduce un video específico

### 🎮 Comandos de Juegos

#### `/8ball <pregunta>`
Pregunta a la bola mágica 8.

**Ejemplo:**
- `/8ball ¿Voy a aprobar el examen?`

#### `/tictactoe @usuario`
Juega gato (3 en raya) con otro usuario.

**Ejemplo:**
- `/tictactoe @amigo`

#### `/connect4 @usuario`
Juega 4 en línea con otro usuario.

**Ejemplo:**
- `/connect4 @amigo`

### 📚 Comandos de Información

#### `/wikipedia <búsqueda>`
Busca información en Wikipedia.

**Ejemplos:**
- `/wikipedia Discord` - Busca "Discord" en Wikipedia
- `/wikipedia Python language:en` - Busca en inglés

### 💬 Menciona al Bot

Menciona al bot (@Baba Radio) en cualquier canal y te mostrará todos los comandos disponibles y cómo puede ayudarte.

## 🎮 Ejemplo Completo

```
1. Únete a un canal de voz
2. Escribe: /search solome
3. Aparecerá un menú con estaciones
4. Selecciona "Solome Radio" del menú
5. ¡Disfruta la música! 🎵
```

## 📊 Estado del Bot

Cuando el bot está en línea, verás:
- **Estado:** 🟢 En línea
- **Actividad:** "Streaming Solome Radio"
- **Icono de streaming:** Morado/Púrpura

## 🔧 Comandos de Administración

Para reiniciar el bot:
```bash
npm start
```

Para registrar nuevos comandos (solo si agregas comandos nuevos):
```bash
npm run register
```

## ⚠️ Solución de Problemas

### El bot no responde a los comandos
- Asegúrate de que el bot tenga permisos para ver el canal
- Verifica que el bot tenga permiso "Use Application Commands"
- Espera unos segundos, los slash commands pueden tardar en aparecer

### No hay audio en el canal de voz
- Verifica que FFmpeg esté instalado en el sistema
- Asegúrate de que el bot tenga permisos para "Connect" y "Speak"
- Prueba con otra estación de radio

### El menú no aparece
- Asegúrate de estar usando `/search` o `/play` (con la barra diagonal)
- Verifica que el bot tenga permiso para enviar mensajes

## 🎉 ¡Listo!

Tu bot está completamente funcional y listo para reproducir radio en Discord.

**Características:**
- ✅ Sin intents privilegiados requeridos
- ✅ Funciona en servidores con 75+ miembros
- ✅ Interfaz moderna con menús desplegables
- ✅ Estado de streaming "Solome Radio"
- ✅ Búsqueda de estaciones de iHeartRadio
- ✅ Reproducción de audio de alta calidad

¡Disfruta tu bot de radio! 🎵
