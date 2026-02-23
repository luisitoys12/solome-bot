const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

module.exports = class Help extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      aliases: ['ayuda', 'comandos'],
      description: '📚 Muestra todos los comandos disponibles del bot'
    })
  }

  async runSlash (interaction) {
    const categoria = interaction.options.getString('categoria')

    const categories = {
      MUSIC: { name: '🎵 Música', commands: ['play', 'skip', 'stop', 'queue', 'premium-music'] },
      RADIO: { name: '📻 Radio', commands: ['radio', 'premium-radio'] },
      FUN: { name: '🎮 Diversión', commands: ['duelo', 'loteria', 'ruleta', 'slots', 'entretenimiento'] },
      GAMER: { name: '🎮 Gamer', commands: ['perfil-gamer', 'alter-ego'] },
      UTILITY: { name: '🔧 Utilidad', commands: ['traducir', 'clima', 'recordatorio', 'download', 'noticias'] },
      ECONOMY: { name: '💰 Economía', commands: ['balance', 'daily', 'work', 'tienda', 'mascota'] },
      AI: { name: '🤖 IA', commands: ['ai', 'voice', 'moderar'] },
      MODERATION: { name: '🛡️ Moderación', commands: ['moderar'] }
    }

    if (categoria) {
      const cat = categories[categoria]
      if (!cat) return interaction.reply({ content: '❌ Categoría inválida', ephemeral: true })

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(cat.name)
        .setDescription(cat.commands.map(c => `\`/${c}\``).join(', '))
        .setFooter({ text: 'Usa /help para ver todas las categorías' })

      return interaction.reply({ embeds: [embed] })
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📚 Ayuda - SOLOME Bot')
      .setDescription('Selecciona una categoría para ver sus comandos')
      .addFields(
        Object.values(categories).map(cat => ({
          name: cat.name,
          value: `${cat.commands.length} comandos`,
          inline: true
        }))
      )
      .setFooter({ text: 'Usa /help categoria para ver comandos específicos' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'categoria',
          description: 'Selecciona una categoría específica',
          required: false,
          choices: [
            { name: '🎵 Música', value: 'MUSIC' },
            { name: '📻 Radio', value: 'RADIO' },
            { name: '🎮 Diversión', value: 'FUN' },
            { name: '🎮 Gamer', value: 'GAMER' },
            { name: '🔧 Utilidad', value: 'UTILITY' },
            { name: '💰 Economía', value: 'ECONOMY' },
            { name: '🤖 IA', value: 'AI' },
            { name: '🛡️ Moderación', value: 'MODERATION' }
          ]
        }
      ]
    }
  }
}
