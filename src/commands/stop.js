const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

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
      return interaction.reply({ content: '❌ Debes estar en un canal de voz.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('⏹️ Reproducción Detenida')
      .setDescription('Bot desconectado del canal de voz.')
      .setFooter({ text: 'Usa /play para reproducir nuevamente' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
