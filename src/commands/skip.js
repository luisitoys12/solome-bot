const Command = require('../structures/command.js')

module.exports = class Skip extends Command {
  constructor (client) {
    super(client, {
      name: 'skip',
      description: 'Salta la canción actual'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Necesitas estar en un canal de voz!', ephemeral: true })
    }

    if (!this.client.lavalink) {
      return interaction.reply({ content: '❌ El sistema de música no está disponible.', ephemeral: true })
    }

    const player = this.client.lavalink.getPlayer(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay ninguna canción reproduciéndose.', ephemeral: true })
    }

    const skipped = player.queue.current
    await player.skip()

    await interaction.reply({ content: `⏭️ Canción saltada: **${skipped.info.title}**` })
  }
}
