# 🛡️ Módulo de Moderación

## Permisos Necesarios

El bot necesita: `BAN_MEMBERS`, `KICK_MEMBERS`, `MANAGE_MESSAGES`, `MANAGE_ROLES`, `MODERATE_MEMBERS`

## Comandos de Moderación

### Sanciones

```
/ban <@usuario> [razón]           - Banear permanentemente
/unban <userID>                   - Desbanear por ID
/kick <@usuario> [razón]          - Expulsar del servidor
/timeout <@usuario> <10m|1h|1d>   - Timeout temporal
/mute <@usuario> <tiempo>         - Silenciar en texto/voz
/unmute <@usuario>                - Quitar silencio
/warn <@usuario> <razón>          - Advertencia formal
```

### Gestión de Mensajes

```
/purge <1-100>                    - Borrar últimos N mensajes
/purge user <@usuario>            - Borrar mensajes de usuario
/purge bots                       - Borrar mensajes de bots
/slowmode <0-21600>               - Segundos entre mensajes
/lock [#canal]                    - Nadie puede escribir
/unlock [#canal]                  - Restaurar escritura
```

### Sistema de Advertencias

```
/warn <@usuario> <razón>          - Añadir advertencia
/warnings <@usuario>              - Ver advertencias
/clearwarnings <@usuario>         - Limpiar todas
/cases <@usuario>                 - Historial completo
/case <id>                        - Detalle de un caso
/case delete <id>                 - Eliminar caso
```

### AutoMod

```
/automod setup                    - Configurar automoderación
/automod words add <palabra>      - Bloquear palabra
/automod words list               - Ver lista negra
/antispam                         - Config anti-spam
/antilink                         - Config anti-links externos
```

## Configuración de Logs

Usar `/config logs channel #canal` para que todos los eventos de moderación se registren automáticamente.
