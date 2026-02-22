const Command = require('../structures/command.js')

module.exports = class Stop extends Command {
  constructor (client) {
    super(client, {
      name: 'stop',
      aliases: ['disconnect', 'dc', 'leave', 'parar'],
      description: 'Detiene la música y limpia la cola'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Necesitas estar en un canal de voz!', ephemeral: true })
    }

    if (!this.client.lavalink) {
      return interaction.reply({ content: '❌ Sistema de música no disponible.', ephemeral: true })
    }

    const player = this.client.lavalink.getPlayer(interaction.guild.id)

    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose.', ephemeral: true })
    }

    await player.destroy()

    await interaction.reply('⏹️ Música detenida y cola limpiada.')
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
