// SOLOME Bot - Main Entry Point
require('dotenv').config()
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js')
const fs = require('fs')
const path = require('path')
const LavalinkManager = require('./utils/lavalink.js')

// Crear cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember
  ]
})

// Colecciones
client.slashCommands = new Collection()
client.aliases = new Collection()

// Logger mejorado
client.log = (type, ...args) => {
  const timestamp = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
  const types = {
    'error': '\x1b[31m❌ ERROR\x1b[0m',
    'warn': '\x1b[33m⚠️  WARN\x1b[0m',
    'info': '\x1b[36mℹ️  INFO\x1b[0m',
    'success': '\x1b[32m✅ SUCCESS\x1b[0m',
    'debug': '\x1b[35m🐛 DEBUG\x1b[0m'
  }
  console.log(`[${timestamp}] ${types[type] || types.info}`, ...args)
}

// Cargar comandos
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  try {
    const Command = require(path.join(commandsPath, file))
    const command = new Command(client)
    client.slashCommands.set(command.name, command)
    
    if (command.aliases && command.aliases.length > 0) {
      command.aliases.forEach(alias => {
        client.aliases.set(alias, command.name)
      })
    }
  } catch (error) {
    client.log('error', `Error cargando comando ${file}:`, error)
  }
}

client.log('success', `📦 ${client.slashCommands.size} comandos cargados`)

// Cargar eventos
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
  try {
    const event = require(path.join(eventsPath, file))
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client))
    } else {
      client.on(event.name, (...args) => event.execute(...args, client))
    }
  } catch (error) {
    client.log('error', `Error cargando evento ${file}:`, error)
  }
}

client.log('success', `🎭 ${eventFiles.length} eventos cargados`)

// Evento Ready
client.once('ready', () => {
  client.log('success', `🤖 Bot conectado como ${client.user.tag}`)
  client.log('info', `📊 Servidores: ${client.guilds.cache.size}`)
  client.log('info', `👥 Usuarios: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`)
  
  // Actualizar presencia
  client.user.setPresence({
    activities: [{ name: '/play | BabaRadio & EstacionKusTV', type: 2 }],
    status: 'online'
  })
  
  // Inicializar Lavalink Manager
  try {
    const lavalinkManager = new LavalinkManager(client)
    client.manager = lavalinkManager.init()
    client.manager.init(client.user.id)
    
    client.log('success', '🎵 Lavalink Manager inicializado (Local + Públicos)')
    client.log('info', `🔗 Intentando conectar a ${client.manager.nodes.size} nodos...`)
  } catch (error) {
    client.log('error', 'Error inicializando Lavalink:', error)
    client.log('warn', '⚠️  Comandos de música no disponibles')
  }
  
  client.log('success', '📻 Sistema de Radio LOCAL listo')
  
  // Registrar comandos slash globalmente
  registerSlashCommands()
})

// Registrar comandos slash
async function registerSlashCommands() {
  const commands = []
  
  client.slashCommands.forEach(command => {
    if (command.getSlashCommandData) {
      commands.push(command.getSlashCommandData())
    }
  })
  
  try {
    await client.application.commands.set(commands)
    client.log('success', `✅ ${commands.length} comandos slash registrados`)
  } catch (error) {
    client.log('error', 'Error registrando comandos slash:', error)
  }
}

// Manejar raw events para Lavalink
client.on('raw', d => {
  if (client.manager) {
    client.manager.updateVoiceState(d)
  }
})

// Manejo de errores
process.on('unhandledRejection', error => {
  client.log('error', 'Unhandled promise rejection:', error)
})

process.on('uncaughtException', error => {
  client.log('error', 'Uncaught exception:', error)
})

// Login
client.login(process.env.DISCORD_TOKEN).catch(error => {
  client.log('error', 'Error al iniciar sesión:', error)
  process.exit(1)
})
