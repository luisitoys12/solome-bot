const Command = require('../structures/command.js')

module.exports = class Stop extends Command {
  constructor (client) {
    super(client, {
      name: 'stop',
      aliases: ['disconnect', 'dc', 'leave'],
      description: '⏹️ Detiene la reproducción y desconecta el bot del canal de voz'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Debes estar en un canal de voz', ephemeral: true })
    }

    await interaction.reply('⏹️ Reproducción detenida')
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
