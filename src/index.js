require('dotenv').config()
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js')
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
        
        if (command.name) {
          client.slashCommands.set(command.name, command)
          
          // También agregar aliases si existen
          if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach(alias => {
              client.commands.set(alias, command)
            })
          }
        }
      }
    } catch (error) {
      client.log('error', `Error cargando comando ${file}:`, error.message)
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
      client.log('error', `Error cargando evento ${file}:`, error.message)
    }
  }
}

// Evento: Bot listo (FIXED: clientReady en vez de ready)
client.once('clientReady', () => {
  client.log('info', `🚀 Bot conectado como ${client.user.tag}`)
  client.log('info', `🏠 En ${client.guilds.cache.size} servidores`)
  client.log('info', `👥 Viendo ${client.users.cache.size} usuarios`)
  
  // Establecer estado
  client.user.setPresence({
    activities: [{ name: '/help | BabaRadio', type: 2 }],
    status: 'online'
  })
})

// Evento: Interacciones (comandos slash)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  
  const command = client.slashCommands.get(interaction.commandName)
  
  if (!command) {
    // Manejar 404
    const { handle404Error } = require('./handlers/errorHandler.js')
    if (handle404Error) {
      await handle404Error(client, interaction, interaction.commandName)
    } else {
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

// Evento: Errores no capturados
client.on('error', error => {
  client.log('error', 'Error del cliente:', error)
})

process.on('unhandledRejection', error => {
  client.log('error', 'Promesa rechazada no manejada:', error)
})

process.on('uncaughtException', error => {
  client.log('error', 'Excepción no capturada:', error)
  process.exit(1)
})

// Login
const token = process.env.TOKEN || process.env.DISCORD_TOKEN

if (!token) {
  console.error('❌ No se encontró TOKEN en .env')
  console.error('Asegúrate de tener TOKEN=tu_token_aqui en el archivo .env')
  process.exit(1)
}

client.login(token).catch(error => {
  console.error('❌ Error al conectar con Discord:', error.message)
  if (error.code === 'TokenInvalid') {
    console.error('🔑 El token en .env es inválido. Verifica que esté correcto.')
  }
  process.exit(1)
})

// Graceful shutdown
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
