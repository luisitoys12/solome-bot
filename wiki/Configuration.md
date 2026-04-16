# ⚙️ Configuración del Bot

## Configuración Inicial

```bash
# Ejecutar asistente de setup
/setup
```

El comando `/setup` te guía paso a paso por la configuración de canales, roles y módulos.

## Configuración de Canales

```
/config logs channel #canal       - Log de moderación
/config welcome channel #canal    - Bienvenidas
/config goodbye channel #canal    - Despedidas
/config suggestions #canal        - Sugerencias
/config reports #canal            - Reportes
/config ticketchannel #canal      - Soporte/tickets
/config starboard #canal          - Starboard
```

## Configuración de Roles

```
/config autorole @rol             - Rol al entrar al servidor
/config botrole @rol              - Rol automático para bots
/config djrole @rol               - Rol con acceso a música
/config modrole @rol              - Moderadores
/config adminrole @rol            - Administradores
/config muterole @rol             - Rol de silenciado
```

## Activar/Desactivar Módulos

```
/config economy toggle            - Sistema de economía
/config levels toggle             - Sistema de niveles
/config music toggle              - Módulo de música
/config nsfw toggle               - Comandos NSFW
```

## Mensajes de Bienvenida

```
/config welcome message           - Personalizar mensaje
  Variables disponibles:
  {user}     - Mención del usuario
  {username} - Nombre del usuario
  {server}   - Nombre del servidor
  {count}    - Número de miembros
```

## Resetear Configuración

```
/config reset                     - ⚠️ Resetea TODA la config
```
