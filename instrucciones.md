# instrucciones.md

## Cambios realizados en esta versión
- Se agregó una guía explícita para guardar secretos (como `TOKEN` de Discord) sin exponerlos en repositorio.
- Se documentó el flujo recomendado para GitHub Codespaces usando **Secrets** y variables de entorno locales.
- Se añadió procedimiento para mantener el dashboard privado (puerto `Private`) y uso de `DASHBOARD_ACCESS_TOKEN`.

## Requisitos o dependencias nuevas
- No se añadieron dependencias de npm.
- Requiere acceso a:
  - GitHub Codespaces (Secrets del usuario/repo).
  - Archivo `.env` local dentro del Codespace (ya ignorado por git).

## Guía paso a paso para probar la funcionalidad

### 1) Dónde guardar el token de Discord de forma privada

#### Opción A (Recomendada para equipo): GitHub Secrets + Codespaces
1. En GitHub del repositorio entra a:
   - `Settings` → `Secrets and variables` → `Codespaces`.
2. Crea estos secretos:
   - `TOKEN`
   - `CLIENT_ID`
   - `OWNER`
3. Reinicia el Codespace para que estén disponibles como variables de entorno.
4. Verifica sin imprimir valores sensibles:
   ```bash
   env | rg '^(TOKEN|CLIENT_ID|OWNER)=' >/dev/null && echo "Secrets cargados"
   ```

#### Opción B (rápida/local en un Codespace): archivo `.env`
1. Crea `.env` (no se sube a git porque está en `.gitignore`).
2. Usa este formato:
   ```env
   TOKEN=tu_token_real
   CLIENT_ID=tu_client_id
   PREFIX=!
   OWNER=tu_discord_user_id
   ```
3. Nunca pegues el `.env` en commits, issues, chats o capturas.

---

### 2) Arrancar bot + dashboard en Codespaces (privado)
```bash
bash start-codespace.sh
```

Esto deja el proceso en background y muestra cómo usar el token del dashboard (`x-dashboard-token`) si el puerto se comparte.

---

### 3) Evitar que se vea en internet
1. Abre la pestaña **Ports** en Codespaces.
2. Selecciona el puerto (ej. `3000`) y deja **Visibility = Private**.
3. Si temporalmente lo compartes, protege con header:
   - `x-dashboard-token: <DASHBOARD_ACCESS_TOKEN>`

---

### 4) Vista previa y verificación rápida
- URL local interna:
  - `http://127.0.0.1:3000`
- Logs:
  ```bash
  tail -f bot.log
  # o
  tail -f dashboard.log
  ```
- Estado del proceso:
  ```bash
  ps aux | rg 'node.*index.js'
  ```
