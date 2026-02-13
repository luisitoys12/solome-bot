# instrucciones.md

## Cambios realizados en esta versión
- Se resolvió y normalizó la configuración de runtime en archivos clave:
  - `src/web/server.js`
  - `start-bot.sh`
  - `start-dashboard.sh`
- El servidor web ahora incluye endpoint de salud `GET /health` para verificar estado del dashboard sin cargar HTML.
- `start-bot.sh` permite ejecutar con secretos inyectados por entorno aunque no exista `.env` (útil en GitHub Codespaces).
- `start-dashboard.sh` ahora incorpora fallback de token si `openssl` no está disponible y muestra endpoint de salud.

## Requisitos o dependencias nuevas
- No se agregaron dependencias npm.
- Opcional recomendado: `openssl` para generar token aleatorio fuerte en preview.

## Guía paso a paso para probar la funcionalidad

### 1) Configurar secretos privados (solo tú y tu equipo)
1. GitHub → Repo → `Settings` → `Secrets and variables` → `Codespaces`.
2. Crear secretos:
   - `TOKEN`
   - `CLIENT_ID`
   - `OWNER`
3. Reiniciar Codespace.

### 2) Arrancar bot + dashboard persistente en Codespaces
```bash
bash start-codespace.sh
```

### 3) Arrancar solo dashboard privado
```bash
PORT=3000 HOST=127.0.0.1 bash start-dashboard.sh
```

### 4) Mantener privado (no público en internet)
1. En pestaña **Ports**, poner puerto en **Private**.
2. Si compartes temporalmente, exige header:
   - `x-dashboard-token: <DASHBOARD_ACCESS_TOKEN>`

### 5) Validaciones rápidas
```bash
# Health check
curl -s -H "x-dashboard-token: $DASHBOARD_ACCESS_TOKEN" http://127.0.0.1:3000/health

# Proceso activo
ps aux | rg 'node.*index.js'

# Logs
tail -f bot.log
# o
tail -f dashboard.log
```
