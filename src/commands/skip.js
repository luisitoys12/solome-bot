const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Skip extends Command {
  constructor (client) {
    super(client, {
      name: 'skip',
      aliases: ['s', 'saltar'],
      description: 'Salta la canción actual y reproduce la siguiente'
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

    if (!player || !player.playing) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose.', ephemeral: true })
    }

    const currentTrack = player.queue.current
    await player.skip()

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('⏭️ Canción Saltada')
      .setDescription(`**${currentTrack.info.title}** - ${currentTrack.info.author}`)
      .setFooter({ text: `Saltado por ${interaction.user.tag}` })
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
