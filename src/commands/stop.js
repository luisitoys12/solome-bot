const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Stop extends Command {
  constructor (client) {
    super(client, {
      name: 'stop',
      aliases: ['parar', 'disconnect'],
      description: 'Detiene la música y desconecta el bot del canal de voz'
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
      return interaction.reply({ content: '❌ No hay nada reproduciéndose.', ephemeral: true })
    }

    await player.destroy()

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('⏹️ Reproducción Detenida')
      .setDescription('La música se ha detenido y el bot se ha desconectado.')
      .setFooter({ text: `Detenido por ${interaction.user.tag}` })
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
