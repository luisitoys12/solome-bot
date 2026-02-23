const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Skip extends Command {
  constructor (client) {
    super(client, {
      name: 'skip',
      aliases: ['s', 'next', 'saltar'],
      description: '⏭️ Salta la canción actual'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Debes estar en un canal de voz.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0xfaa61a)
      .setTitle('⏭️ Canción Saltada')
      .setDescription('Reproduciendo siguiente canción...')
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
