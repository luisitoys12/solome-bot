# 🎵 Módulo de Música

## Requisitos

- Servidor **Lavalink** activo y configurado
- Variables `LAVALINK_HOST`, `LAVALINK_PORT`, `LAVALINK_PASSWORD` en `.env`

## Comandos de Música

### Reproducción Básica

```
/play <canción|URL>     - Reproduce canción de YouTube, Spotify, SoundCloud
/pause                  - Pausa la canción actual
/resume                 - Reanuda la canción
/stop                   - Para y limpia la cola
/skip                   - Salta a la siguiente
/previous               - Vuelve a la anterior
/disconnect             - Bot sale del canal de voz
```

### Gestión de Cola

```
/queue                  - Ver cola completa
/queue clear            - Limpiar toda la cola
/queue remove <pos>     - Eliminar canción de posición X
/queue shuffle          - Mezclar aleatoriamente
/move <pos1> <pos2>     - Mover canción de posición
/loop                   - Modo bucle: off > canción > cola
```

### Audio y Filtros

```
/volume <0-100>         - Ajustar volumen
/seek <segundos>        - Saltar al segundo X
/filter bass            - Boost de graves
/filter nightcore       - Nightcore (más rápido+agudo)
/filter vaporwave       - Vaporwave (más lento+grave)
/filter 8d              - Audio 8D envolvente
/filter reset           - Quitar todos los filtros
/equalizer              - Panel de ecualizador
```

### Playlists Personales

```
/playlist create <nombre>  - Nueva playlist
/playlist add <nombre>     - Añadir canción actual
/playlist play <nombre>    - Reproducir tu playlist
/playlist list             - Ver tus playlists
/playlist delete <nombre>  - Eliminar playlist
```

## Fuentes Soportadas

- ✅ YouTube
- ✅ YouTube Music
- ✅ Spotify (links)
- ✅ SoundCloud
- ✅ Twitch (streams)
- ✅ Bandcamp
- ✅ URLs directas (MP3, etc.)
