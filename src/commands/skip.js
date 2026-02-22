const Command = require('../structures/command.js')

module.exports = class Skip extends Command {
  constructor (client) {
    super(client, {
      name: 'skip',
      aliases: ['s', 'next', 'saltar'],
      description: 'Salta a la siguiente canción en la cola'
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

    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose.', ephemeral: true })
    }

    const currentTrack = player.queue.current

    await player.skip()

    await interaction.reply(`⏭️ Saltado: **${currentTrack.info.title}**`)
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
