# 🌐 Guía de Instalación del Dashboard - Solome Bot

## 🚀 Inicio Rápido

### 1. Clonar/Actualizar el repositorio

```bash
cd ~/solome-bot
git pull origin master
```

### 2. Instalar nuevas dependencias

```bash
npm install
```

Esto instalará:
- `express` - Servidor web
- `express-session` - Manejo de sesiones
- `passport` - Autenticación
- `passport-discord` - OAuth2 de Discord
- `ejs` - Motor de plantillas

### 3. Configurar Discord Developer Portal

#### Paso 1: Obtener Client Secret

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación (Solome Bot)
3. Ve a **OAuth2** > **General**
4. Copia el **Client Secret** (haz clic en "Reset Secret" si no lo ves)
5. **¡Importante!** Guárdalo, solo se muestra una vez

#### Paso 2: Configurar Redirects

1. En la misma página de OAuth2
2. En **Redirects**, añade:
   - Para desarrollo local: `http://localhost:3000/callback`
   - Para producción: `https://tu-dominio.com/callback`
3. Haz clic en **Save Changes**

### 4. Configurar variables de entorno

Edita tu archivo `.env`:

```bash
nano ~/.solome-bot/.env
```

Añade estas líneas:

```env
# Dashboard Configuration
CLIENT_SECRET=tu_client_secret_aqui
CALLBACK_URL=http://localhost:3000/callback
SESSION_SECRET=$(openssl rand -hex 32)
DASHBOARD_PORT=3000
DASHBOARD_ENABLED=true
```

**Generar SESSION_SECRET automáticamente:**
```bash
echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env
```

### 5. Iniciar el bot con dashboard

```bash
npm start
```

Deberías ver:
```
✅ Bot conectado exitosamente
🌐 Dashboard disponible en: http://localhost:3000
📊 Panel de administración iniciado correctamente
```

## 💻 Uso del Dashboard

### Acceder al dashboard

1. Abre tu navegador en: `http://localhost:3000`
2. Haz clic en **"Iniciar sesión con Discord"**
3. Autoriza la aplicación (solo la primera vez)
4. Verás la lista de servidores donde tienes permisos de **Administrar Servidor**
5. Haz clic en un servidor para gestionar su configuración

### Funciones disponibles

#### 🏠 Dashboard Principal
- Ver todos tus servidores con el bot
- Estadísticas globales en tiempo real
- Acceso rápido a configuraciones

#### ⚙️ Panel de Configuración del Servidor

**Módulo de Música:**
- Activar/desactivar reproducción
- Ajustar volumen predeterminado
- Configurar anuncios de canciones
- Restricción por rol DJ

**Módulo de Radio:**
- Activar/desactivar estaciones
- Seleccionar calidad de stream (64/128/320kbps)
- Configurar estaciones favoritas

**Módulo de Moderación:**
- Sistema de logs
- Canal de registros
- Auto-moderación
- Configurar mensajes de moderación

**Módulo de Entretenimiento:**
- Activar/desactivar juegos
- Configurar sistema de lotería
- Personalizar comandos divertidos

## 🌍 Despliegue en Producción (VPS)

### Opción 1: Con Nginx + PM2 (Recomendado)

#### Paso 1: Actualizar .env para producción
```env
CALLBACK_URL=https://bot.estacionkus.tv/callback
DASHBOARD_PORT=3000
```

#### Paso 2: Configurar Nginx

Crea el archivo de configuración:

```bash
sudo nano /etc/nginx/sites-available/solome-dashboard
```

Pega esta configuración:

```nginx
server {
    listen 80;
    server_name bot.estacionkus.tv;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activa el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/solome-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Paso 3: Obtener certificado SSL

```bash
sudo certbot --nginx -d bot.estacionkus.tv
```

#### Paso 4: Iniciar con PM2

```bash
cd ~/solome-bot
pm2 start index.js --name "solome-bot"
pm2 save
pm2 startup
```

Verificar estado:
```bash
pm2 status
pm2 logs solome-bot
```

### Opción 2: Puerto directo (Desarrollo)

Si no quieres usar Nginx:

1. Cambia `DASHBOARD_PORT=80` en `.env`
2. Ejecuta con sudo: `sudo npm start`
3. Accede directamente: `http://tu-ip:80`

**Nota:** Requiere permisos root para usar puerto 80

## 🔧 Configuración Avanzada

### Usar puerto personalizado

```env
DASHBOARD_PORT=8080
```

Luego accede en: `http://localhost:8080`

### Dashboard en servidor separado

Puedes ejecutar solo el dashboard sin el bot:

```bash
DASHBOARD_ONLY=true npm start
```

### Múltiples dominios/subdominios

Añade todos los redirects en Discord Developer Portal:
- `http://localhost:3000/callback`
- `https://bot.estacionkus.tv/callback`
- `https://dashboard.tusitio.com/callback`

## 🐛 Solución de Problemas

### Error: "Invalid OAuth2 redirect_uri"

**Causa:** La URL de callback no está registrada en Discord

**Solución:**
1. Ve a Discord Developer Portal
2. OAuth2 > General > Redirects
3. Añade exactamente: `http://localhost:3000/callback`
4. Guarda cambios

### Error: "Missing CLIENT_SECRET"

**Solución:**
1. Verifica que `.env` tenga `CLIENT_SECRET=...`
2. Reinicia el bot: `pm2 restart solome-bot`

### Dashboard no carga

**Verificaciones:**

```bash
# Ver logs
pm2 logs solome-bot

# Verificar puerto
sudo netstat -tulpn | grep 3000

# Verificar variables
cat .env | grep DASHBOARD
```

### No aparecen mis servidores

**Causa:** No tienes permisos de "Administrar Servidor"

**Solución:**
- Solo aparecerán servidores donde tengas el permiso **MANAGE_GUILD**
- Verifica tus permisos en Discord

### Sesiones no persisten

**Solución:**
1. Genera un `SESSION_SECRET` fuerte:
   ```bash
   openssl rand -hex 32
   ```
2. Añádelo a `.env`
3. Reinicia el bot

## 📊 Monitoreo

### Ver logs en tiempo real

```bash
pm2 logs solome-bot --lines 100
```

### Verificar memoria y CPU

```bash
pm2 monit
```

### Estadísticas del dashboard

Accede a: `http://tu-dashboard/api/stats` (requiere login)

Respuesta:
```json
{
  "guilds": 150,
  "users": 45000,
  "channels": 3500,
  "uptime": 86400,
  "memory": {...},
  "ping": 45
}
```

## 🎉 Funciones Futuras

Próximas actualizaciones del dashboard:

- [ ] Base de datos MongoDB para configuraciones persistentes
- [ ] Logs de moderación en tiempo real
- [ ] Editor visual de mensajes de bienvenida
- [ ] Sistema de comandos personalizados
- [ ] Gráficas de uso con Chart.js
- [ ] Gestión de playlists desde el dashboard
- [ ] Sistema de tickets desde web
- [ ] Webhook para notificaciones externas
- [ ] Módulo de economía y niveles
- [ ] Integración con analytics

## 📚 Recursos

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Express.js Guide](https://expressjs.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Configuration](https://nginx.org/en/docs/)

## ❓ Soporte

Si necesitas ayuda:

1. Revisa esta guía completa
2. Verifica los logs: `pm2 logs solome-bot`
3. Consulta el archivo `dashboard/README.md`
4. Contacta: EstacionKusTV

---

🌟 **Dashboard desarrollado para Solome Bot 4.0** por EstacionKusTV

Inspiración: Dyno, ProBot, MEE6
