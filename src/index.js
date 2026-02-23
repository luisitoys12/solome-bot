require('dotenv').config()
const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require('discord.js')
const fs = require('fs')
const path = require('path')

// Crear cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message]
})

// Collections para comandos
client.slashCommands = new Collection()
client.commands = new Collection()

// Logger simple
client.log = (level, ...args) => {
  const timestamp = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
  const prefix = {
    info: '✅',
    error: '❌',
    warn: '⚠️',
    debug: '🔍'
  }[level] || '💬'
  console.log(`[${timestamp}] ${prefix}`, ...args)
}

// AUTO-REGISTER: Registrar comandos automáticamente al iniciar
async function autoRegisterCommands() {
  const commands = []
  const commandsPath = path.join(__dirname, 'commands')
  
  if (!fs.existsSync(commandsPath)) {
    client.log('warn', 'No se encontró carpeta de comandos')
    return
  }
  
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
  
  client.log('info', `🔄 Registrando comandos slash...`)
  
  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file)
      delete require.cache[require.resolve(filePath)]
      const CommandClass = require(filePath)
      
      if (typeof CommandClass === 'function') {
        const commandInstance = new CommandClass(client)
        
        if (typeof commandInstance.getSlashCommandData === 'function') {
          const slashBuilder = commandInstance.getSlashCommandData()
          
          // Verificar que sea un SlashCommandBuilder válido
          if (slashBuilder && typeof slashBuilder.toJSON === 'function') {
            const commandData = slashBuilder.toJSON()
            
            if (commandData && commandData.name && commandData.description) {
              commands.push(commandData)
              client.log('debug', `  ✅ ${file.padEnd(25)} -> /${commandData.name}`)
            }
          } else if (slashBuilder && slashBuilder.name && slashBuilder.description) {
            // Soporte para objetos simples (backward compatibility)
            commands.push(slashBuilder)
            client.log('debug', `  ⚠️  ${file.padEnd(25)} -> /${slashBuilder.name} (objeto simple)`)
          }
        }
      }
    } catch (error) {
      client.log('warn', `  ❌ ${file}: ${error.message}`)
    }
  }
  
  if (commands.length === 0) {
    client.log('warn', 'No se encontraron comandos válidos para registrar')
    return
  }
  
  try {
    const token = process.env.TOKEN || process.env.DISCORD_TOKEN
    const clientId = process.env.CLIENT_ID || client.user?.id
    
    if (!token || !clientId) {
      client.log('error', 'Falta TOKEN o CLIENT_ID para auto-registro')
      return
    }
    
    const rest = new REST({ version: '10' }).setToken(token)
    
    client.log('info', `📤 Subiendo ${commands.length} comandos a Discord...`)
    
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    )
    
    client.log('info', `✅ ${data.length} comandos registrados en Discord!`)
  } catch (error) {
    client.log('error', 'Error en auto-registro:', error.message)
    if (error.rawError?.errors) {
      console.error('Detalles:', JSON.stringify(error.rawError.errors, null, 2))
    }
  }
}

// Cargar comandos slash
const commandsPath = path.join(__dirname, 'commands')
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
  
  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file)
      const CommandClass = require(filePath)
      
      if (typeof CommandClass === 'function') {
        const command = new CommandClass(client)
        
        if (command.name && typeof command.runSlash === 'function') {
          client.slashCommands.set(command.name, command)
          
          if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
              client.commands.set(alias, command)
            })
          }
        }
      }
    } catch (error) {
      // Ignorar errores silenciosamente
    }
  }
  
  client.log('info', `🎮 Cargados ${client.slashCommands.size} comandos slash`)
}

// Cargar eventos
const eventsPath = path.join(__dirname, 'events')
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))
  
  for (const file of eventFiles) {
    try {
      const filePath = path.join(eventsPath, file)
      const event = require(filePath)
      
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client))
      } else {
        client.on(event.name, (...args) => event.execute(...args, client))
      }
      
      client.log('info', `🔊 Evento cargado: ${event.name}`)
    } catch (error) {
      // Ignorar
    }
  }
}

// Evento: Bot listo
client.once('ready', async () => {
  client.log('info', `🚀 Bot conectado como ${client.user.tag}`)
  client.log('info', `🏠 En ${client.guilds.cache.size} servidores`)
  client.log('info', `👥 Viendo ${client.users.cache.size} usuarios`)
  
  // AUTO-REGISTER AUTOMÁTICO
  await autoRegisterCommands()
  
  // INICIAR DASHBOARD WEB
  try {
    const dashboardPath = path.join(__dirname, '../dashboard/server.js')
    if (fs.existsSync(dashboardPath)) {
      const { startDashboard } = require(dashboardPath)
      startDashboard(client)
    }
  } catch (error) {
    client.log('warn', 'No se pudo iniciar dashboard:', error.message)
  }
  
  // Establecer estado
  client.user.setPresence({
    activities: [{ name: '/help | EstacionKusTV', type: 2 }],
    status: 'online'
  })
})

// Evento: Interacciones
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  
  const command = client.slashCommands.get(interaction.commandName)
  
  if (!command) {
    try {
      const { handle404Error } = require('./handlers/errorHandler.js')
      if (handle404Error) {
        await handle404Error(client, interaction, interaction.commandName)
      }
    } catch (e) {
      await interaction.reply({ 
        content: `❌ Comando /${interaction.commandName} no encontrado.`, 
        ephemeral: true 
      })
    }
    return
  }
  
  try {
    await command.runSlash(interaction)
  } catch (error) {
    client.log('error', `Error ejecutando /${interaction.commandName}:`, error)
    
    const errorMessage = {
      content: '❌ Ocurrió un error al ejecutar el comando.',
      ephemeral: true
    }
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage)
    } else {
      await interaction.reply(errorMessage)
    }
  }
})

client.on('error', error => {
  client.log('error', 'Error del cliente:', error)
})

process.on('unhandledRejection', error => {
  client.log('error', 'Promesa rechazada:', error)
})

process.on('uncaughtException', error => {
  client.log('error', 'Excepción no capturada:', error)
  process.exit(1)
})

const token = process.env.TOKEN || process.env.DISCORD_TOKEN

if (!token) {
  console.error('❌ No se encontró TOKEN en .env')
  process.exit(1)
}

client.login(token).catch(error => {
  console.error('❌ Error al conectar:', error.message)
  process.exit(1)
})

process.on('SIGINT', () => {
  client.log('info', '🛑 Apagando bot...')
  client.destroy()
  process.exit(0)
})

process.on('SIGTERM', () => {
  client.log('info', '🛑 Apagando bot...')
  client.destroy()
  process.exit(0)
})

// Exportar cliente para el dashboard
module.exports = client
