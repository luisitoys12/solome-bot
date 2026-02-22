const fs = require('fs')
const path = require('path')

/**
 * Handler para comandos con prefix (!)
 * Permite usar comandos tipo !play, !radio, !duelo además de los slash
 */
class PrefixHandler {
  constructor(client) {
    this.client = client
    this.prefix = process.env.PREFIX || '!'
    this.commands = new Map()
    
    // Cargar comandos desde src/commands
    this.loadCommands()
    
    // Listener de mensajes
    this.client.on('messageCreate', (message) => this.handleMessage(message))
  }

  /**
   * Carga todos los comandos desde src/commands
   */
  loadCommands() {
    const commandsPath = path.join(__dirname, '../commands')
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file)
      
      try {
        const CommandClass = require(filePath)
        
        // Si es una clase de comando válida
        if (typeof CommandClass === 'function') {
          const commandInstance = new CommandClass({ user: { id: 'temp' } })
          
          if (commandInstance.data && commandInstance.data.name) {
            const commandName = commandInstance.data.name
            this.commands.set(commandName, CommandClass)
            console.log(`✅ Prefix command loaded: !${commandName}`)
          }
        }
      } catch (error) {
        console.error(`❌ Error loading prefix command ${file}:`, error.message)
      }
    }

    console.log(`\n📦 Total prefix commands loaded: ${this.commands.size}\n`)
  }

  /**
   * Maneja mensajes y ejecuta comandos con prefix
   */
  async handleMessage(message) {
    // Ignorar bots y DMs
    if (message.author.bot) return
    if (!message.guild) return

    // Verificar si empieza con prefix
    if (!message.content.startsWith(this.prefix)) return

    // Parsear comando y argumentos
    const args = message.content.slice(this.prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    // Buscar comando
    const CommandClass = this.commands.get(commandName)
    if (!CommandClass) return

    try {
      // Crear instancia del comando
      const commandInstance = new CommandClass({
        user: message.author,
        guild: message.guild,
        channel: message.channel
      })

      // Convertir mensaje a "interaction-like" para compatibilidad
      const fakeInteraction = this.createFakeInteraction(message, args)

      // Ejecutar comando
      await commandInstance.execute(fakeInteraction)
      
    } catch (error) {
      console.error(`Error executing prefix command !${commandName}:`, error)
      
      await message.reply({
        content: `❌ Error al ejecutar el comando: ${error.message}`,
        allowedMentions: { repliedUser: false }
      })
    }
  }

  /**
   * Crea un objeto "interaction-like" desde un mensaje
   * para que los comandos funcionen con prefix y slash
   */
  createFakeInteraction(message, args) {
    return {
      // Propiedades básicas
      user: message.author,
      member: message.member,
      guild: message.guild,
      guildId: message.guild.id,
      channel: message.channel,
      channelId: message.channel.id,
      client: this.client,
      
      // Métodos de reply
      reply: async (options) => {
        return await message.reply({
          ...options,
          allowedMentions: { repliedUser: false }
        })
      },
      
      editReply: async (options) => {
        // Para prefix, simplemente envía otro mensaje
        return await message.channel.send(options)
      },
      
      followUp: async (options) => {
        return await message.channel.send(options)
      },
      
      deferReply: async () => {
        // Para prefix, envía un mensaje de "pensando..."
        this._deferMessage = await message.channel.send('⏳ Procesando...')
      },
      
      // Simulación de options.getString(), etc.
      options: {
        getString: (name) => args[0] || null,
        getInteger: (name) => parseInt(args[0]) || null,
        getUser: (name) => message.mentions.users.first() || null,
        getChannel: (name) => message.mentions.channels.first() || null,
        getSubcommand: () => args[0] || null,
        getSubcommandGroup: () => null
      },
      
      // Metadata
      isPrefix: true,
      commandName: message.content.split(' ')[0].slice(this.prefix.length),
      args: args
    }
  }
}

module.exports = PrefixHandler
