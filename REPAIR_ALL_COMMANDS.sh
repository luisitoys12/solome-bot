#!/bin/bash
# REPAIR_ALL_COMMANDS.sh - Script maestro para reparar TODOS los comandos

echo "🔧 REPARADOR MAESTRO DE COMANDOS SOLOME BOT"
echo "=========================================="
echo ""

cd ~/solome-bot || exit 1

echo "📥 Paso 1: Actualizando repositorio..."
git pull origin master

if [ $? -ne 0 ]; then
    echo "❌ Error al actualizar repositorio"
    echo "🔄 Intentando forzar..."
    git fetch --all
    git reset --hard origin/master
fi

echo ""
echo "📦 Paso 2: Instalando dependencias del dashboard..."
npm install

echo ""
echo "🔧 Paso 3: Ejecutando reparador automático..."
if [ -f "fix-commands.js" ]; then
    node fix-commands.js
else
    echo "⚠️ fix-commands.js no encontrado, saltando..."
fi

echo ""
echo "📝 Paso 4: Verificando archivos actualizados..."
ls -lh src/commands/*.js | head -10

echo ""
echo "🚀 Paso 5: Registrando comandos en Discord..."
npm run register

echo ""
echo "✅ PROCESO COMPLETADO"
echo "=================="
echo ""
echo "👉 Próximos pasos:"
echo "   1. Revisa la salida de 'npm run register'"
echo "   2. Si hay errores, comparte el log completo"
echo "   3. Reinicia el bot: pm2 restart solome-bot"
echo ""
