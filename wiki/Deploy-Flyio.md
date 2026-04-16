# ☁️ Deploy en Fly.io — Guía Completa

## Requisitos

- Cuenta en [fly.io](https://fly.io)
- `flyctl` instalado
- Docker instalado (opcional, Fly lo maneja)

## Instalación de flyctl

```bash
# Linux/macOS
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"

# macOS con Homebrew
brew install flyctl
```

## Primer Deploy

```bash
# 1. Login
fly auth login

# 2. Crear la app (solo primera vez)
fly launch --name solome-bot --region ams --no-deploy

# 3. Configurar secretos de entorno
fly secrets set DISCORD_TOKEN=tu_token
fly secrets set CLIENT_ID=tu_client_id
fly secrets set GUILD_ID=tu_guild_id
fly secrets set LAVALINK_HOST=tu_lavalink_host
fly secrets set LAVALINK_PASSWORD=tu_password

# 4. Deploy
fly deploy

# 5. Ver estado
fly status

# 6. Ver logs en tiempo real
fly logs
```

## Comandos Fly.io de Uso Frecuente

```bash
# Ver apps
fly apps list

# Escalar máquinas
fly scale count 1
fly scale memory 2048

# SSH a la máquina
fly ssh console

# Reiniciar app
fly apps restart solome-bot

# Ver secretos configurados
fly secrets list

# Eliminar un secreto
fly secrets unset NOMBRE_SECRETO

# Ver métricas
fly dashboard

# Destruir app (cuidado)
fly apps destroy solome-bot
```

## fly.toml Explicado

```toml
app = 'solome-bot'        # Nombre único de la app
primary_region = 'ams'   # Región principal (Amsterdam)

[build]                   # Usa el Dockerfile automáticamente

[env]
  NODE_ENV = 'production'
  PORT = '8080'           # Puerto interno

[http_service]
  internal_port = 8080    # Puerto que escucha tu app
  force_https = true      # Forzar HTTPS
  auto_stop_machines = false  # No apagar máquinas
  min_machines_running = 1    # Siempre 1 máquina activa

[[vm]]
  memory = '2gb'
  cpu_kind = 'shared'
  cpus = 4

[checks]
  # Health check cada 15s en /health
```

## Troubleshooting

| Error | Solución |
|---|---|
| `no machines in group 'app'` | Ejecutar `fly scale count 1` |
| `Error: app not found` | Verificar nombre en fly.toml |
| Bot offline | Revisar `fly logs` para errores |
| Secrets no cargados | `fly secrets list` para verificar |
| Deploy falla | Revisar Dockerfile y dependencias |

## Regiones Disponibles

| Código | Región |
|---|---|
| `ams` | Amsterdam, NL |
| `dfw` | Dallas, TX (USA) |
| `gru` | São Paulo, BR |
| `lax` | Los Ángeles, CA |
| `mia` | Miami, FL |
| `ord` | Chicago, IL |
| `sjc` | San José, CA |
| `yyz` | Toronto, CA |
