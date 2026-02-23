const Command = require('../structures/command.js')

module.exports = class Skip extends Command {
  constructor (client) {
    super(client, {
      name: 'skip',
      aliases: ['s', 'saltar', 'next'],
      description: '⏭️ Salta a la siguiente canción en la cola'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Debes estar en un canal de voz', ephemeral: true })
    }

    await interaction.reply('⏭️ Canción saltada (sistema de música próximamente)')
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
