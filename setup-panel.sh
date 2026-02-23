#!/bin/bash

# Script de configuración automática para panel web del bot
# Solo se ejecuta una vez

SETUP_FLAG=".panel_configured"

if [ -f "$SETUP_FLAG" ]; then
    echo "✅ El panel ya fue configurado anteriormente."
    echo "🌐 Accede a tu panel en: https://solome-panel.duckdns.org"
    exit 0
fi

echo "🚀 Iniciando configuración del panel web..."
echo ""

# Verificar si se está ejecutando como root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Este script debe ejecutarse con sudo"
    echo "Ejecuta: sudo bash setup-panel.sh"
    exit 1
fi

# Solicitar token de DuckDNS
echo "🔑 Configuración de DuckDNS"
echo "-------------------------------------"
echo "Para obtener tu token:"
echo "1. Ve a: https://www.duckdns.org/"
echo "2. Inicia sesión con Google o GitHub"
echo "3. Crea el subdominio: solome-panel"
echo "4. Copia el TOKEN que aparece arriba"
echo ""
read -p "Pega tu TOKEN de DuckDNS aquí: " DUCKDNS_TOKEN

if [ -z "$DUCKDNS_TOKEN" ]; then
    echo "❌ Token vacío. Abortando."
    exit 1
fi

DUCKDNS_DOMAIN="solome-panel"
FULL_DOMAIN="${DUCKDNS_DOMAIN}.duckdns.org"

echo ""
echo "🌐 Obteniendo IP pública..."
PUBLIC_IP=$(curl -s ifconfig.me)
echo "✅ Tu IP pública es: $PUBLIC_IP"

# Actualizar DuckDNS
echo ""
echo "🔄 Registrando dominio en DuckDNS..."
RESPONSE=$(curl -s "https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=${PUBLIC_IP}")

if [ "$RESPONSE" = "OK" ]; then
    echo "✅ DuckDNS configurado correctamente"
else
    echo "❌ Error al configurar DuckDNS: $RESPONSE"
    echo "Verifica tu token y el nombre del subdominio"
    exit 1
fi

# Configurar cron para actualizar IP automáticamente
echo ""
echo "⏰ Configurando actualización automática de IP..."
CRON_JOB="*/5 * * * * curl -s 'https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=' >/dev/null 2>&1"
(crontab -l 2>/dev/null | grep -v "duckdns.org"; echo "$CRON_JOB") | crontab -
echo "✅ IP se actualizará automáticamente cada 5 minutos"

# Instalar Nginx si no está instalado
echo ""
echo "📦 Verificando Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "📝 Instalando Nginx..."
    apt update -qq
    apt install -y nginx
    echo "✅ Nginx instalado"
else
    echo "✅ Nginx ya está instalado"
fi

# Crear configuración de Nginx
echo ""
echo "⚙️ Configurando Nginx como reverse proxy..."

NGINX_CONFIG="/etc/nginx/sites-available/bot-panel"

cat > "$NGINX_CONFIG" <<EOF
server {
    listen 80;
    server_name ${FULL_DOMAIN};

    access_log /var/log/nginx/bot-panel-access.log;
    error_log /var/log/nginx/bot-panel-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

echo "✅ Configuración de Nginx creada"

# Activar sitio
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/bot-panel

# Verificar configuración
echo ""
echo "🔍 Verificando configuración de Nginx..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Configuración válida"
else
    echo "❌ Error en la configuración de Nginx"
    nginx -t
    exit 1
fi

# Reiniciar Nginx
echo ""
echo "🔄 Reiniciando Nginx..."
systemctl restart nginx
systemctl enable nginx
echo "✅ Nginx reiniciado"

# Instalar Certbot para SSL
echo ""
echo "🔒 Instalando Certbot para SSL..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    echo "✅ Certbot instalado"
else
    echo "✅ Certbot ya está instalado"
fi

# Configurar SSL
echo ""
echo "🔐 Configurando certificado SSL gratuito..."
echo "Esto puede tardar un momento..."

certbot --nginx -d "${FULL_DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email --redirect 2>&1 | grep -v "Saving debug log"

if [ $? -eq 0 ]; then
    echo "✅ SSL configurado correctamente"
else
    echo "⚠️ SSL no pudo configurarse automáticamente"
    echo "Puedes configurarlo manualmente después con:"
    echo "sudo certbot --nginx -d ${FULL_DOMAIN}"
fi

# Abrir puerto 80 y 443 en firewall si UFW está activo
if command -v ufw &> /dev/null && ufw status | grep -q "active"; then
    echo ""
    echo "🔥 Configurando firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "✅ Puertos 80 y 443 abiertos"
fi

# Marcar como configurado
touch "$SETUP_FLAG"
echo "${DUCKDNS_TOKEN}" > .duckdns_token
chmod 600 .duckdns_token

# Resumen final
echo ""
echo "================================================"
echo "🎉 ¡CONFIGURACIÓN COMPLETADA!"
echo "================================================"
echo ""
echo "🌐 Tu panel está disponible en:"
echo "   🔗 https://${FULL_DOMAIN}"
echo ""
echo "📝 Información:"
echo "   - Dominio: ${FULL_DOMAIN}"
echo "   - IP: ${PUBLIC_IP}"
echo "   - Puerto local: 3000"
echo "   - SSL: Activado 🔒"
echo ""
echo "ℹ️ Notas:"
echo "   - El dominio se actualiza automáticamente cada 5 min"
echo "   - El certificado SSL se renueva automáticamente"
echo "   - Asegúrate de que tu aplicación esté corriendo en el puerto 3000"
echo ""
echo "================================================"
echo ""
