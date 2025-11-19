const { Client, GatewayIntentBits, ActivityType } = require('discord.js')
const { readdirSync } = require('fs')
const { LavalinkManager } = require('lavalink-client')
const lavalinkConfig = require('../lavalink.config.js')

module.exports = class Baba extends Client {
  constructor (options) {
    super(options)
    this.commands = []
    this.customCommands = new Map()
    this.premiumGuilds = new Set()
    
    // Initialize Lavalink (will be initialized in ready event)
    this.lavalinkConfig = lavalinkConfig
    this.lavalink = null

    this.once('ready', this._ready.bind(this))
    this.initCommands('./src/commands')
    this.initEvents('./src/events')
  }

  _ready () {
    // Initialize Lavalink after bot is ready
    try {
      this.lavalink = new LavalinkManager({
        nodes: this.lavalinkConfig.nodes,
        sendToShard: (guildId, payload) => this.guilds.cache.get(guildId)?.shard?.send(payload),
        client: {
          id: this.user.id,
          username: this.user.username
        },
        ...this.lavalinkConfig.options
      })
      
      this.lavalink.init({ id: this.user.id, username: this.user.username })
      this.log('info', 'Lavalink initialized successfully - Powered by TechByte & Yumi Team')
    } catch (error) {
      this.log('error', 'Failed to initialize Lavalink:', error)
      this.log('info', 'Bot will continue without Lavalink support')
    }

    // Check maintenance mode
    const fs = require('fs')
    try {
      const maintenance = JSON.parse(fs.readFileSync('./maintenance.json', 'utf8'))
      if (maintenance.enabled) {
        this.user.setActivity('🔧 En Mantenimiento', { 
          type: ActivityType.Streaming,
          url: 'https://www.twitch.tv/solomeradio'
        })
        this.log('info', '⚠️ Bot en modo mantenimiento')
        this.maintenanceMode = true
      } else {
        this.user.setActivity('Solome Radio', { 
          type: ActivityType.Streaming,
          url: 'https://www.twitch.tv/solomeradio'
        })
        this.maintenanceMode = false
      }
    } catch (e) {
      this.maintenanceMode = false
    }

    // Track uptime
    this.startTime = Date.now()
    
    this.log('info', 'Bot is ready! Streaming Solome Radio 🎵')
  }

  log (type, ...args) {
    console.log(`[${type}]`, ...args)
  }

  initCommands (dir) {
    readdirSync(dir).forEach(file => {
      if (file.endsWith('.js')) {
        try {
          const Command = require(`./commands/${file}`)
          this.commands.push(new Command(this))
          delete require.cache[require.resolve(`./commands/${file}`)]
        } catch (err) {
          this.log('error', err)
        } finally {
          this.log('commands', `${file} loaded.`)
        }
      }
    })
  }

  initEvents (dir) {
    readdirSync(dir).forEach(file => {
      if (file.endsWith('.js')) {
        try {
          const Event = require(`./events/${file}`)
          const event = new Event(this)
          super.on(event.name, (...args) => event._run(...args))
          delete require.cache[require.resolve(`./events/${file}`)]
        } catch (err) {
          this.log('error', err)
        } finally {
          this.log('events', `${file} loaded.`)
        }
      }
    })
  }
}
