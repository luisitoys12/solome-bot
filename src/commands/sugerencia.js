const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Sugerencia extends Command {
  constructor (client) {
    super(client, {
      name: 'sugerencia',
      aliases: ['suggest', 'suggestion'],
      description: '💡 Envía una sugerencia para mejorar el servidor'
    })
  }

  async runSlash (interaction) {
    const sugerencia = interaction.options.getString('sugerencia')

    const embed = new EmbedBuilder()
      .setColor(0xffff00)
      .setTitle('💡 Nueva Sugerencia')
      .setDescription(sugerencia)
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp()

    await interaction.reply({ content: '✅ Sugerencia enviada', ephemeral: true })
    
    // Enviar a canal de sugerencias si existe
    const channel = interaction.guild.channels.cache.find(ch => ch.name === 'sugerencias')
    if (channel) {
      const msg = await channel.send({ embeds: [embed] })
      await msg.react('✅')
      await msg.react('❌')
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 3, name: 'sugerencia', description: 'Tu sugerencia para mejorar el servidor', required: true }
      ]
    }
  }
}
