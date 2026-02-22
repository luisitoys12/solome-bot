# Solome Bot Dashboard

🌐 Panel de administración web profesional para Solome Bot al estilo Dyno/ProBot.

## 🚀 Características

- **🔐 OAuth2 de Discord**: Autenticación segura con Discord
- **🏠 Gestión de Servidores**: Panel para cada servidor donde está el bot
- **⚙️ Configuración Completa**: Módulos de música, radio, moderación y más
- **📊 Estadísticas en Vivo**: Monitoreo en tiempo real
- **🎨 Diseño Moderno**: Interfaz estilo Discord con tema oscuro

## 🛠️ Instalación
### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y completa:

```env
CLIENT_ID=tu_client_id
CLIENT_SECRET=tu_client_secret
CALLBACK_URL=http://localhost:3000/callback
SESSION_SECRET=clave_secreta_aleatoria
DASHBOARD_PORT=3000
DASHBOARD_ENABLED=true
```

### 3. Obtener Client Secret

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. En "OAuth2" > "General", copia el **Client Secret**
4. Añade en "Redirects": `http://localhost:3000/callback`

### 4. Iniciar el dashboard

El dashboard se inicia automáticamente con el bot:

```bash
npm start
```

O solo el dashboard:

```bash
npm run dashboard
```

## 💻 Uso

1. Abre `http://localhost:3000` en tu navegador
2. Haz clic en "Iniciar sesión con Discord"
3. Autoriza la aplicación
4. Selecciona un servidor para gestionar

## 📦 Estructura de archivos

```
dashboard/
├── server.js          # Servidor Express con OAuth2
├── public/
│   └── css/
│       └── style.css   # Estilos del dashboard
└── views/
    ├── index.ejs       # Página principal
    ├── dashboard.ejs   # Lista de servidores
    ├── server.ejs      # Panel de configuración
    └── 404.ejs         # Página de error
```

## 🌍 Despliegue en producción
### En VPS/Servidor

1. Actualiza `CALLBACK_URL` a tu dominio:
   ```env
   CALLBACK_URL=https://tu-dominio.com/callback
   ```

2. Añade el redirect en Discord Developer Portal

3. Usa un reverse proxy (nginx) para HTTPS:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Obtén certificado SSL con Certbot:
```bash
sudo certbot --nginx -d tu-dominio.com
```

### Con PM2

```bash
pm2 start index.js --name "solome-bot"
pm2 save
pm2 startup
```

## 📚 API Endpoints

### Públicos
- `GET /` - Página principal
- `GET /login` - Iniciar sesión con Discord
- `GET /callback` - Callback de OAuth2
- `GET /logout` - Cerrar sesión

### Protegidos (requieren autenticación)
- `GET /dashboard` - Lista de servidores del usuario
- `GET /dashboard/:guildId` - Panel de configuración del servidor
- `GET /api/stats` - Estadísticas globales del bot
- `GET /api/guild/:guildId` - Información del servidor
- `POST /api/guild/:guildId/config` - Guardar configuración

## ✨ Próximas funciones

- [ ] Base de datos (MongoDB) para configuraciones
- [ ] Sistema de logs en tiempo real
- [ ] Editor de mensajes de bienvenida/despedida
- [ ] Gestión de playlists personalizadas
- [ ] Sistema de niveles y economía
- [ ] Webhook para notificaciones
- [ ] Gráficas de uso con Chart.js

## 🐛 Soporte

Si encuentras algún problema:

1. Verifica que todas las variables de entorno estén configuradas
2. Comprueba que el `CLIENT_SECRET` sea correcto
3. Revisa los logs del servidor

## 🎉 Créditos

Dashboard desarrollado por **EstacionKusTV** para Solome Bot 4.0

Inspiración: Dyno, ProBot, MEE6
