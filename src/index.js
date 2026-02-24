require('dotenv').config()
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js')
const { Manager } = require('erela.js')
const Spotify = require('erela.js-spotify')
const Deezer = require('erela.js-deezer')
const fs = require('fs')
const path = require('path')

// Cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message]
})

// Collections
client.slashCommands = new Collection()
client.commands = new Collection()
client.aliases = new Collection()

// Logger simple
client.log = function(level, ...args) {
  const timestamp = new Date().toLocaleString('es-MX', { 
    timeZone: 'America/Mexico_City',
    hour12: true 
  })
  const emoji = {
    info: '✅',
    error: '❌',
    warn: '⚠️',
    debug: '🔍',
    success: '✨'
  }[level] || '📢'
  
  console.log(`[${timestamp}] ${emoji} ${level.toUpperCase()}`, ...args)
}

// 🎵 LAVALINK MANAGER CON MÚLTIPLES NODOS PÚBLICOS
const lavalinkNodes = [
  // Nodo local (si existe)
  {
    identifier: 'Local-VPS',
    host: process.env.LAVALINK_HOST || 'localhost',
    port: parseInt(process.env.LAVALINK_PORT) || 2333,
    password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
    secure: false,
    retryAmount: 3,
    retryDelay: 5000
  },
  // Nodos públicos confiables
  {
    identifier: 'Public-US-1',
    host: 'lava.link',
    port: 80,
    password: 'anything',
    secure: false,
    retryAmount: 5,
    retryDelay: 3000
  },
  {
    identifier: 'Public-EU-1',
    host: 'lavalink.devamop.in',
    port: 443,
    password: 'DevamOP',
    secure: true,
    retryAmount: 5,
    retryDelay: 3000
  },
  {
    identifier: 'Public-US-2',
    host: 'lavalink.oops.wtf',
    port: 443,
    password: 'www.freelavalink.ga',
    secure: true,
    retryAmount: 5,
    retryDelay: 3000
  },
  {
    identifier: 'Public-AS-1',
    host: 'lavalink-repl.mrjvs.repl.co',
    port: 443,
    password: 'mrjvs.repl.co',
    secure: true,
    retryAmount: 5,
    retryDelay: 3000
  }
]

try {
  client.manager = new Manager({
    nodes: lavalinkNodes,
    send: (id, payload) => {
      const guild = client.guilds.cache.get(id)
      if (guild) guild.shard.send(payload)
    },
    plugins: [
      new Spotify({
        clientID: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      new Deezer()
    ],
    autoPlay: true,
    clientName: 'SolomeBot/1.0'
  })
  
  // Eventos de Lavalink
  client.manager.on('nodeConnect', node => {
    client.log('success', `🎵 Lavalink conectado: ${node.options.identifier}`)
  })
  
  client.manager.on('nodeError', (node, error) => {
    client.log('error', `Lavalink error (${node.options.identifier}):`, error.message)
  })
  
  client.manager.on('nodeDisconnect', node => {
    client.log('warn', `🔌 Lavalink desconectado: ${node.options.identifier}`)
  })
  
  client.manager.on('nodeReconnect', node => {
    client.log('info', `🔄 Lavalink reconectando: ${node.options.identifier}`)
  })
  
  client.manager.on('trackStart', (player, track) => {
    const channel = client.channels.cache.get(player.textChannel)
    if (channel) {
      const { EmbedBuilder } = require('discord.js')
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('▶️ Reproduciendo Ahora')
        .setDescription(`**[${track.title}](${track.uri})**`)
        .addFields(
          { name: '🎤 Artista', value: track.author || 'Desconocido', inline: true },
          { name: '⏱️ Duración', value: formatDuration(track.duration), inline: true }
        )
        .setThumbnail(track.displayThumbnail('maxresdefault'))
        .setFooter({ text: `Nodo: ${player.node.options.identifier}` })
        .setTimestamp()
      
      channel.send({ embeds: [embed] }).catch(() => {})
    }
  })
  
  client.manager.on('queueEnd', player => {
    const channel = client.channels.cache.get(player.textChannel)
    if (channel) {
      channel.send('⏹️ Cola finalizada. Usa `/play` para reproducir más música.').catch(() => {})
    }
    player.destroy()
  })
  
  client.log('success', `🎵 Lavalink Manager inicializado (${lavalinkNodes.length} nodos configurados)`)
  
} catch (error) {
  client.log('error', 'Error al inicializar Lavalink Manager:', error)
  client.manager = null
}

function formatDuration(ms) {
  if (!ms || ms === 0) return '0:00'
  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor(ms / (1000 * 60 * 60))
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Cargar comandos
const loadCommands = () => {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'))
  
  for (const file of commandFiles) {
    try {
      delete require.cache[require.resolve(`./commands/${file}`)]
      const CommandClass = require(`./commands/${file}`)
      const command = new CommandClass(client)
      
      client.slashCommands.set(command.name, command)
      client.commands.set(command.name, command)
      
      if (command.aliases) {
        command.aliases.forEach(alias => {
          client.aliases.set(alias, command.name)
        })
      }
      
      client.log('debug', `✅ Comando cargado: ${command.name}`)
    } catch (error) {
      client.log('error', `Error cargando ${file}:`, error)
    }
  }
  
  client.log('info', `📦 ${client.slashCommands.size} comandos cargados`)
}

// Cargar eventos
const loadEvents = () => {
  const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'))
  
  for (const file of eventFiles) {
    try {
      delete require.cache[require.resolve(`./events/${file}`)]
      const event = require(`./events/${file}`)
      
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client))
      } else {
        client.on(event.name, (...args) => event.execute(...args, client))
      }
      
      client.log('debug', `📡 Evento registrado: ${event.name}`)
    } catch (error) {
      client.log('error', `Error cargando evento ${file}:`, error)
    }
  }
  
  client.log('info', `📡 ${eventFiles.length} eventos registrados`)
}

// Cargar todo
loadCommands()
loadEvents()

// Eventos de Discord
client.on('ready', () => {
  client.log('success', `🤖 Bot conectado como ${client.user.tag}`)
  client.log('info', `📊 Servidores: ${client.guilds.cache.size}`)
  client.log('info', `👥 Usuarios: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`)
  
  // Iniciar Lavalink
  if (client.manager) {
    client.manager.init(client.user.id)
    client.log('info', `🔗 Intentando conectar a ${lavalinkNodes.length} nodos Lavalink...`)
  }
})

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
  client.log('error', 'Error al conectar:', error)
  process.exit(1)
})
