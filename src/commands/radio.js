const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Radio extends Command {
  constructor (client) {
    super(client, {
      name: 'radio',
      aliases: ['r', 'estacion'],
      description: '📻 Reproduce estaciones de radio de iHeartRadio, TuneIn y MyTuner'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const estacion = interaction.options.getString('estacion')
    const fuente = interaction.options.getString('fuente') || 'all'
    
    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Debes estar en un canal de voz')
    }

    await interaction.editReply(`📻 Buscando estación: **${estacion}** (sistema de radio próximamente)`)
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 3, name: 'estacion', description: 'Nombre de la estación de radio', required: true },
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
