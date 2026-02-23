const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Radio extends Command {
  constructor (client) {
    super(client, {
      name: 'radio',
      aliases: ['stream', 'live'],
      description: '📻 Reproduce estaciones de radio en vivo (iHeartRadio, TuneIn, MyTuner)'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()

    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Debes estar en un canal de voz.')
    }

    const estacion = interaction.options.getString('estacion')
    const fuente = interaction.options.getString('fuente') || 'all'

    const embed = new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle('📻 Radio en Vivo')
      .setDescription(`Buscando: **${estacion}**`)
      .addFields(
        { name: '🌐 Fuente', value: fuente === 'all' ? 'Todas' : fuente, inline: true },
        { name: '👥 Canal', value: interaction.member.voice.channel.name, inline: true }
      )
      .setFooter({ text: 'Reproducción iniciando...' })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'estacion',
          description: 'Nombre de la estación de radio',
          required: true
        },
        {
          type: 3,
          name: 'fuente',
          description: 'Fuente de búsqueda',
          required: false,
          choices: [
            { name: 'Todas las fuentes', value: 'all' },
            { name: 'iHeartRadio', value: 'iheart' },
            { name: 'TuneIn', value: 'tunein' },
            { name: 'MyTuner', value: 'mytuner' }
          ]
        }
      ]
    }
  }
}
