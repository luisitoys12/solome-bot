const Event = require('../structures/event.js')
const { ChannelType, EmbedBuilder } = require('discord.js')

module.exports = class Message extends Event {
  constructor (client) {
    super(client, {
      name: 'messageCreate'
    })
  }

  async run (message) {
    if (message.author.bot) return
    if (message.channel.type === ChannelType.DM) return

    // Auto-moderación de groserías
    const badWords = [
      // Español
      'puta', 'puto', 'mierda', 'coño', 'carajo', 'verga', 'chingada', 'pendejo', 'idiota', 'estúpido',
      // Inglés
      'fuck', 'shit', 'bitch', 'ass', 'damn', 'crap', 'dick', 'pussy', 'bastard', 'asshole',
      // Portugués
      'porra', 'merda', 'caralho', 'puta', 'filho da puta', 'idiota',
      // Francés
      'merde', 'putain', 'connard', 'salope',
      // Alemán
      'scheiße', 'arsch', 'fick'
    ]

    const content = message.content.toLowerCase()
    const hasBadWord = badWords.some(word => content.includes(word))

    if (hasBadWord && message.member && message.member.moderatable) {
      try {
        await message.delete()
        await message.member.timeout(60000, 'Uso de lenguaje inapropiado (auto-moderación)')
        
        const warningMsg = await message.channel.send(
          `⚠️ ${message.author}, has sido silenciado por 1 minuto por usar lenguaje inapropiado.`
        )
        
        setTimeout(() => warningMsg.delete().catch(() => {}), 5000)
        
        this.client.log('info', `Auto-mod: ${message.author.tag} silenciado por lenguaje inapropiado`)
        return
      } catch (error) {
        this.client.log('error', 'Error en auto-moderación:', error)
      }
    }

    // Check if bot is mentioned
    if (message.mentions.has(this.client.user.id)) {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('👋 ¡Hola! Soy Baba Radio')
        .setDescription('Soy un bot multifuncional de Discord con música, juegos y más!')
        .addFields(
          {
            name: '🎵 Comandos de Música',
            value: '`/search <estación>` - Busca estaciones de radio\n`/play <estación>` - Reproduce una estación\n`/music <canción>` - Reproduce música de YouTube',
            inline: false
          },
          {
            name: '🎮 Comandos de Juegos',
            value: '`/8ball <pregunta>` - Pregunta a la bola mágica\n`/tictactoe @usuario` - Juega gato (3 en raya)\n`/connect4 @usuario` - Juega 4 en línea',
            inline: false
          },
          {
            name: '📚 Comandos de Información',
            value: '`/wikipedia <búsqueda>` - Busca en Wikipedia',
            inline: false
          },
          {
            name: '💡 ¿Cómo puedo ayudarte hoy?',
            value: 'Usa los comandos slash (/) para interactuar conmigo.\nÚnete a un canal de voz y usa `/music` o `/search` para escuchar música.',
            inline: false
          }
        )
        .setThumbnail(this.client.user.displayAvatarURL())
        .setFooter({ text: 'Usa / para ver todos los comandos disponibles' })
        .setTimestamp()

      message.reply({ embeds: [embed] })
      return
    }

    // Legacy prefix commands (if any)
    if (message.content.startsWith(process.env.PREFIX)) {
      const cmd = message.content.split(' ')[0].substring(process.env.PREFIX.length)
      const args = message.content.substring(cmd.length + process.env.PREFIX.length + 1)
      const command = this.client.commands.find(c => c.name.toLowerCase() === cmd || (c.aliases && c.aliases.includes(cmd)))

      if (this.onlyDev === true && message.author.id === process.env.OWNER) return
      if ((command && cmd.trim()) && command.canRun(message, args)) {
        try {
          command._run(message, args)
        } catch (e) {
          this.client.log('error', e)
        } finally {
          this.client.log('info', `${message.author.tag} issued command: ${message.content}`)
        }
      }
    }
  }
}
