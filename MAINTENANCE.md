# 🔧 Guía de Mantenimiento - Baba Radio

## 🚀 Comandos Básicos

### Iniciar el bot
```bash
./start-bot.sh
```

O manualmente:
```bash
nohup npm start > bot.log 2>&1 &
```

### Detener el bot
```bash
pkill -f "node.*index.js"
```

### Reiniciar el bot
```bash
pkill -f "node.*index.js" && sleep 2 && nohup npm start > bot.log 2>&1 &
```

### Ver logs en tiempo real
```bash
tail -f bot.log
```

### Ver últimas 50 líneas de logs
```bash
tail -50 bot.log
```

### Verificar si el bot está corriendo
```bash
ps aux | grep "node.*index.js" | grep -v grep
```

---

## 📊 Monitoreo

### Ver estado del bot
```bash
cat STATUS.md
```

### Ver comandos usados recientemente
```bash
grep "used slash command" bot.log | tail -20
```

### Ver errores recientes
```bash
grep -i error bot.log | tail -20
```

### Ver usuarios activos
```bash
grep "used slash command" bot.log | awk '{print $2}' | sort | uniq -c | sort -rn
```

---

## 🔄 Actualización de Comandos

### Agregar un nuevo comando

1. Crea el archivo en `src/commands/`:
```bash
nano src/commands/nuevo-comando.js
```

2. Usa esta plantilla:
```javascript
const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class NuevoComando extends Command {
  constructor (client) {
    super(client, {
      name: 'nuevo',
      aliases: [],
      description: 'Descripción del comando'
    })
  }

  async runSlash (interaction) {
    await interaction.reply('¡Hola desde el nuevo comando!')
  }
}
```

3. Agrega el comando a `register-commands.js`:
```javascript
new SlashCommandBuilder()
  .setName('nuevo')
  .setDescription('Descripción del comando')
  .addStringOption(option =>
    option.setName('parametro')
      .setDescription('Descripción del parámetro')
      .setRequired(true)
  )
```

4. Registra los comandos:
```bash
npm run register
```

5. Reinicia el bot:
```bash
pkill -f "node.*index.js" && sleep 2 && nohup npm start > bot.log 2>&1 &
```

---

## 🐛 Solución de Problemas

### El bot no responde
1. Verifica que esté corriendo:
```bash
ps aux | grep "node.*index.js" | grep -v grep
```

2. Revisa los logs:
```bash
tail -50 bot.log
```

3. Reinicia el bot:
```bash
./start-bot.sh
```

### Los comandos no aparecen en Discord
1. Verifica que estén registrados:
```bash
npm run register
```

2. Espera 1-2 minutos (Discord tarda en sincronizar)

3. Recarga Discord (Ctrl+R)

### Error de permisos
1. Verifica que el bot tenga estos permisos:
   - Ver canales
   - Enviar mensajes
   - Conectar (voz)
   - Hablar (voz)
   - Usar comandos de aplicación

### No hay audio en voz
1. Verifica que FFmpeg esté instalado:
```bash
ffmpeg -version
```

2. Si no está instalado:
```bash
sudo apt-get update && sudo apt-get install -y ffmpeg
```

3. Reinicia el bot

### Error "Used disallowed intents"
- El bot NO necesita intents privilegiados
- Verifica que `index.js` solo use estos intents:
  - Guilds
  - GuildVoiceStates
  - GuildMessages

---

## 📦 Actualización de Dependencias

### Ver dependencias desactualizadas
```bash
npm outdated
```

### Actualizar todas las dependencias
```bash
npm update
```

### Actualizar una dependencia específica
```bash
npm install discord.js@latest
```

### Reinstalar todas las dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🔐 Seguridad

### Regenerar token del bot
1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecciona tu aplicación
3. Ve a "Bot" → "Reset Token"
4. Copia el nuevo token
5. Actualiza `.env`:
```bash
nano .env
# Cambia TOKEN=...
```
6. Reinicia el bot

### Verificar que .env no esté en git
```bash
cat .gitignore | grep .env
```

Debe aparecer `.env` en la lista.

---

## 📈 Optimización

### Limpiar logs antiguos
```bash
# Guardar últimas 1000 líneas
tail -1000 bot.log > bot.log.tmp && mv bot.log.tmp bot.log
```

### Ver uso de memoria
```bash
ps aux | grep "node.*index.js" | grep -v grep | awk '{print $6/1024 " MB"}'
```

### Ver uso de CPU
```bash
ps aux | grep "node.*index.js" | grep -v grep | awk '{print $3 "%"}'
```

---

## 🗂️ Backup

### Hacer backup de la configuración
```bash
tar -czf baba-radio-backup-$(date +%Y%m%d).tar.gz \
  .env \
  src/ \
  package.json \
  index.js \
  register-commands.js
```

### Restaurar desde backup
```bash
tar -xzf baba-radio-backup-YYYYMMDD.tar.gz
npm install
npm run register
./start-bot.sh
```

---

## 📝 Logs y Debugging

### Habilitar logs detallados
Edita `src/client.js` y agrega más logs en el método `log()`.

### Ver logs de un comando específico
```bash
grep "/music" bot.log | tail -20
```

### Ver logs de errores de un usuario
```bash
grep "usuario123" bot.log | grep -i error
```

### Exportar logs del día
```bash
grep "$(date +%Y-%m-%d)" bot.log > logs-$(date +%Y-%m-%d).txt
```

---

## 🔄 Automatización

### Crear un cron job para reiniciar el bot diariamente
```bash
crontab -e
```

Agrega:
```
0 4 * * * cd /workspaces/baba-radio && ./start-bot.sh
```

### Crear un script de monitoreo
```bash
nano monitor-bot.sh
```

Contenido:
```bash
#!/bin/bash
if ! ps aux | grep "node.*index.js" | grep -v grep > /dev/null; then
    echo "Bot is down! Restarting..."
    cd /workspaces/baba-radio
    ./start-bot.sh
fi
```

Hacer ejecutable:
```bash
chmod +x monitor-bot.sh
```

Agregar a cron (cada 5 minutos):
```bash
*/5 * * * * /workspaces/baba-radio/monitor-bot.sh
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `tail -50 bot.log`
2. Verifica la documentación: `README.md`, `SETUP.md`
3. Revisa los issues en GitHub
4. Consulta la documentación de Discord.js: https://discord.js.org/

---

**Última actualización:** 2025-11-19
