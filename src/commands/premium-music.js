const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class PremiumMusic extends Command {
  constructor (client) {
    super(client, {
      name: 'premium-music',
      aliases: ['pmusic'],
      description: '🎵 Funciones premium de música: ecualizador, filtros y más'
    })
  }

  async runSlash (interaction) {
    const funcion = interaction.options.getString('funcion')

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('🎵 Música Premium')
      .setDescription(`Función seleccionada: **${funcion}**\n\nSistema premium próximamente`)

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'funcion',
          description: 'Función premium a usar',
          required: true,
          choices: [
            { name: '🎵 Ecualizador', value: 'equalizer' },
            { name: '🔊 Filtros de Audio', value: 'filters' },
            { name: '🔁 Loop Infinito', value: 'loop' },
            { name: '🔀 Shuffle Inteligente', value: 'shuffle' },
            { name: '📥 Descargar MP3', value: 'download' }
          ]
        }
      ]
    }
  }
}
