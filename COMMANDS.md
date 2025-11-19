# 📋 Lista Completa de Comandos - Baba Radio

## 🎵 Comandos de Música

### `/search <estación>`
Busca y reproduce estaciones de radio de iHeartRadio.

**Parámetros:**
- `estación` (requerido) - Nombre de la estación a buscar

**Ejemplos:**
```
/search solome
/search rock en español
/search jazz
/search 90s hits
```

**Cómo funciona:**
1. El bot busca hasta 5 estaciones que coincidan
2. Te muestra un menú desplegable con las opciones
3. Seleccionas la estación que quieres
4. El bot se une a tu canal de voz y reproduce la estación

---

### `/play <estación>`
Alias de `/search` - funciona exactamente igual.

**Parámetros:**
- `estación` (requerido) - Nombre de la estación a reproducir

**Ejemplos:**
```
/play salsa
/play pop latino
/play reggaeton
```

---

### `/music <canción>`
Reproduce música de YouTube.

**Parámetros:**
- `query` (requerido) - Nombre de la canción o URL de YouTube

**Ejemplos:**
```
/music despacito
/music bad bunny titi me pregunto
/music https://youtube.com/watch?v=dQw4w9WgXcQ
/music shakira waka waka
```

**Características:**
- Busca automáticamente en YouTube
- Muestra información del video (título, canal, duración, vistas)
- Reproduce audio de alta calidad
- Se desconecta automáticamente al terminar

---

## 🎮 Comandos de Juegos

### `/8ball <pregunta>`
Pregunta a la bola mágica 8 y recibe una respuesta misteriosa.

**Parámetros:**
- `question` (requerido) - Tu pregunta para la bola 8

**Ejemplos:**
```
/8ball ¿Voy a aprobar el examen?
/8ball ¿Debería salir hoy?
/8ball ¿Es buena idea?
```

**Respuestas posibles:**
- ✅ Respuestas positivas (10)
- 🤔 Respuestas neutrales (5)
- ❌ Respuestas negativas (5)

---

### `/tictactoe @usuario`
Juega gato (3 en raya) con otro usuario.

**Parámetros:**
- `opponent` (requerido) - El usuario con quien quieres jugar

**Ejemplos:**
```
/tictactoe @amigo
/tictactoe @rival
```

**Cómo jugar:**
1. Invitas a un usuario a jugar
2. Aparece un tablero 3x3 con botones
3. Los jugadores se turnan haciendo clic en los botones
4. El primero en hacer 3 en línea gana
5. El juego expira después de 5 minutos de inactividad

**Símbolos:**
- ❌ Jugador 1 (quien inicia el juego)
- ⭕ Jugador 2 (oponente)
- ⬜ Casilla vacía

---

### `/connect4 @usuario`
Juega 4 en línea (Connect 4) con otro usuario.

**Parámetros:**
- `opponent` (requerido) - El usuario con quien quieres jugar

**Ejemplos:**
```
/connect4 @amigo
/connect4 @rival
```

**Cómo jugar:**
1. Invitas a un usuario a jugar
2. Aparece un tablero 6x7 con botones numerados
3. Los jugadores se turnan eligiendo una columna (1-7)
4. Las fichas caen hasta el fondo de la columna
5. El primero en hacer 4 en línea (horizontal, vertical o diagonal) gana
6. El juego expira después de 10 minutos de inactividad

**Símbolos:**
- 🔴 Jugador 1 (quien inicia el juego)
- 🟡 Jugador 2 (oponente)
- ⚪ Casilla vacía

---

## 📚 Comandos de Información

### `/wikipedia <búsqueda>`
Busca información en Wikipedia.

**Parámetros:**
- `query` (requerido) - Término a buscar
- `language` (opcional) - Idioma de Wikipedia (por defecto: español)

**Idiomas disponibles:**
- 🇪🇸 Español (es)
- 🇬🇧 English (en)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇵🇹 Português (pt)

**Ejemplos:**
```
/wikipedia Discord
/wikipedia Python language:en
/wikipedia Inteligencia Artificial
/wikipedia Marie Curie language:fr
```

**Características:**
- Muestra un resumen del artículo (hasta 500 caracteres)
- Incluye imagen del artículo (si está disponible)
- Enlace directo al artículo completo
- Búsqueda en múltiples idiomas

---

## 💬 Mencionar al Bot

### @Baba Radio
Menciona al bot en cualquier canal para ver la ayuda.

**Ejemplo:**
```
@Baba Radio
¿Qué puedes hacer @Baba Radio?
Hola @Baba Radio
```

**Respuesta:**
El bot te enviará un embed con:
- Lista de todos los comandos disponibles
- Descripción de cada categoría
- Cómo puede ayudarte
- Sugerencias de uso

---

## 📝 Notas Importantes

### Requisitos para comandos de música:
- Debes estar en un canal de voz
- El bot debe tener permisos para conectarse y hablar
- FFmpeg debe estar instalado en el servidor

### Requisitos para comandos de juegos:
- No puedes jugar contra bots
- No puedes jugar contra ti mismo
- Solo el jugador en turno puede hacer movimientos

### Límites de tiempo:
- Tic-Tac-Toe: 5 minutos
- Connect 4: 10 minutos
- Selección de estaciones: 30 segundos

### Permisos necesarios:
- Ver canales
- Enviar mensajes
- Conectar (voz)
- Hablar (voz)
- Usar comandos de aplicación

---

## 🆘 Ayuda Adicional

Si necesitas ayuda:
1. Menciona al bot: `@Baba Radio`
2. Revisa la documentación en GitHub
3. Usa `/` para ver todos los comandos disponibles

¡Disfruta usando Baba Radio! 🎵
