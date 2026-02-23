# 🔧 GUÍA COMPLETA: REPARAR Y VERIFICAR LOS 71 COMANDOS

## 🚨 PROBLEMA IDENTIFICADO

Algunos comandos no se registran correctamente porque:
1. **Estructura de clases incorrecta**
2. **Falta `getSlashCommandData()` method**
3. **Options mal definidas**
4. **Nombres inválidos en Discord API**

---

## 💉 SOLUCIÓN RÁPIDA (3 minutos)

### **Paso 1: Ejecutar verificador**

```bash
cd ~/solome-bot
node scripts/fix-commands.js
```

Esto te mostrará **qué comandos tienen problemas**.

### **Paso 2: Ver logs del bot**

```bash
pm2 logs solome-bot --lines 100 | grep "comando"
```

Busca mensajes como:
- `❌ Error cargando comando`
- `⚠️  Comando sin data`

### **Paso 3: Reiniciar y verificar**

```bash
pm2 restart solome-bot
pm2 logs solome-bot
```

Deberías ver:
```
✅ 71 comandos slash cargados
✅ 71 comandos registrados automáticamente
```

---

## 🛠️ ESTRUCTURA CORRECTA DE COMANDO

TODOS los comandos deben seguir este formato:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = class NombreComando {
    constructor(client) {
        this.client = client;
        this.name = 'nombre';
        this.description = 'Descripción del comando';
        this.category = 'categoria';
    }

    // ✅ MÉTODO REQUERIDO
    getSlashCommandData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .toJSON(); // ¡IMPORTANTE!
    }

    // ✅ MÉTODO REQUERIDO
    async runSlash(interaction) {
        // Lógica del comando
        await interaction.reply('Hola mundo!');
    }

    // Opcional: para comandos de texto
    async execute(message, args) {
        message.reply('Hola mundo!');
    }
};
```

---

## 🧰 EJEMPLOS DE COMANDOS COMUNES

### **Comando simple (Ping)**

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = class PingCommand {
    constructor(client) {
        this.client = client;
        this.name = 'ping';
        this.description = 'Ver la latencia del bot';
    }

    getSlashCommandData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .toJSON();
    }

    async runSlash(interaction) {
        const latencia = Date.now() - interaction.createdTimestamp;
        const apiLatencia = Math.round(this.client.ws.ping);
        
        await interaction.reply(`🏓 Pong! Latencia: ${latencia}ms | API: ${apiLatencia}ms`);
    }
};
```

### **Comando con opciones (Ban)**

```javascript
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = class BanCommand {
    constructor(client) {
        this.client = client;
        this.name = 'ban';
        this.description = 'Banear un usuario';
    }

    getSlashCommandData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
            .addUserOption(option =>
                option
                    .setName('usuario')
                    .setDescription('Usuario a banear')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('razón')
                    .setDescription('Razón del ban')
                    .setRequired(false)
            )
            .toJSON();
    }

    async runSlash(interaction) {
        const usuario = interaction.options.getUser('usuario');
        const razon = interaction.options.getString('razón') || 'Sin razón';
        
        await interaction.guild.members.ban(usuario, { reason: razon });
        await interaction.reply(`✅ ${usuario.tag} ha sido baneado. Razón: ${razon}`);
    }
};
```

### **Comando con subcomandos (Music)**

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = class MusicCommand {
    constructor(client) {
        this.client = client;
        this.name = 'music';
        this.description = 'Comandos de música';
    }

    getSlashCommandData() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand(sub =>
                sub
                    .setName('play')
                    .setDescription('Reproducir una canción')
                    .addStringOption(opt =>
                        opt
                            .setName('canción')
                            .setDescription('Nombre o URL de la canción')
                            .setRequired(true)
                    )
            )
            .addSubcommand(sub =>
                sub
                    .setName('stop')
                    .setDescription('Detener la música')
            )
            .addSubcommand(sub =>
                sub
                    .setName('skip')
                    .setDescription('Saltar la canción actual')
            )
            .toJSON();
    }

    async runSlash(interaction) {
        const subcomando = interaction.options.getSubcommand();
        
        switch (subcomando) {
            case 'play':
                const cancion = interaction.options.getString('canción');
                await interaction.reply(`🎵 Reproduciendo: ${cancion}`);
                break;
            case 'stop':
                await interaction.reply('⏹️ Música detenida');
                break;
            case 'skip':
                await interaction.reply('⏭️ Canción saltada');
                break;
        }
    }
};
```

---

## 💉 ARREGLAR COMANDOS ROTOS

### **Error común 1: "Missing getSlashCommandData"**

**❌ Incorrecto:**
```javascript
module.exports = class MiComando {
    constructor(client) {
        this.client = client;
        this.name = 'test';
    }
    // Falta getSlashCommandData()
}
```

**✅ Correcto:**
```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = class MiComando {
    constructor(client) {
        this.client = client;
        this.name = 'test';
        this.description = 'Comando de prueba'; // ¡Agregar!
    }

    getSlashCommandData() { // ¡Agregar este método!
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .toJSON();
    }

    async runSlash(interaction) {
        await interaction.reply('Test!');
    }
}
```

### **Error común 2: "Description too short"**

Discord requiere que las descripciones tengan **al menos 1 carácter**.

**❌ Incorrecto:**
```javascript
this.description = ''; // Vacío
this.description = ' '; // Solo espacios
```

**✅ Correcto:**
```javascript
this.description = 'Descripción del comando';
```

### **Error común 3: "Invalid command name"**

Los nombres de comandos deben:
- Ser **minúsculas**
- No contener espacios
- Solo letras, números, guiones `-` y guiones bajos `_`
- Entre 1-32 caracteres

**❌ Incorrecto:**
```javascript
this.name = 'Mi Comando'; // Tiene espacios
this.name = 'Comando!'; // Carácter inválido
this.name = 'COMANDO'; // Mayúsculas
```

**✅ Correcto:**
```javascript
this.name = 'mi-comando';
this.name = 'comando';
this.name = 'mi_comando';
```

---

## 🔍 VERIFICAR QUE TODO FUNCIONE

### **1. Verificar carga de comandos**

```bash
pm2 logs solome-bot --lines 50 | grep "comando"
```

Debe mostrar:
```
🎮 Cargados 71 comandos slash
✅ 71 comandos registrados automáticamente
```

### **2. Ver comandos en Discord**

En cualquier canal de tu servidor, escribe `/` y deberías ver **TODOS** tus comandos.

### **3. Probar un comando**

```
/ping
/help
/botinfo
```

Deben funcionar correctamente.

---

## 🛡️ COMANDOS PROBLEMÁTICOS CONOCIDOS

Estos comandos suelen tener problemas:

1. **entretenimiento.js** - Muchos subcomandos
2. **moderation.js** - Permisos complejos
3. **music.js** - Dependencias externas
4. **noticias.js** - API keys
5. **stream.js** - Voice connections

Si alguno falla, revisa:
- ¿Tiene todas las dependencias?
- ¿Tiene API keys necesarias?
- ¿Está bien la estructura?

---

## 💻 DASHBOARD MODERNO

Tu dashboard ya está actualizado con:
- ✅ Diseño moderno oscuro
- ✅ Sidebar de navegación
- ✅ Stats animados
- ✅ Lista de comandos
- ✅ Logs en tiempo real
- ✅ Actualización cada 5 segundos

**Acceder:**
```
http://localhost:3000
http://103.45.245.158:3000
https://solome-panel.duckdns.org
```

---

## 🚑 AYUDA URGENTE

Si sigues teniendo problemas:

**1. Ver logs completos:**
```bash
pm2 logs solome-bot --lines 200 > logs.txt
cat logs.txt
```

**2. Reinicio limpio:**
```bash
pm2 delete all
pm2 kill
rm -rf node_modules package-lock.json
npm install
pm2 start src/index.js --name solome-bot
```

**3. Verificar .env:**
```bash
cat .env
```

Debe tener:
```
TOKEN=tu_token_de_discord
CLIENT_ID=tu_client_id
```

**4. Probar manualmente:**
```bash
node src/index.js
```

Ver los errores en tiempo real.

---

## ✅ CHECKLIST FINAL

- [ ] Todos los comandos tienen `getSlashCommandData()`
- [ ] Todos los comandos tienen `runSlash(interaction)`
- [ ] Las descripciones no están vacías
- [ ] Los nombres son válidos (minúsculas, sin espacios)
- [ ] El bot se conecta correctamente
- [ ] Los comandos aparecen al escribir `/`
- [ ] El dashboard muestra los 71 comandos
- [ ] No hay errores en `pm2 logs`

---

## 🎉 ¡LISTO!

Si todo está ✅, tu bot ya tiene:
- **71 comandos slash funcionales**
- **Dashboard moderno y profesional**
- **Auto-registro automático**
- **Sistema de logs completo**

🚀 **EstacionKusTV - SOLOME Bot v4.0**
