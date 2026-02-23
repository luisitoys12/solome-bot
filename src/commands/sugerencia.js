const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Sugerencia extends Command {
  constructor (client) {
    super(client, {
      name: 'sugerencia',
      aliases: ['suggest'],
      description: '💡 Envía sugerencias para mejorar el servidor'
    })
  }

  async runSlash (interaction) {
    const sugerencia = interaction.options.getString('sugerencia')

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('💡 Nueva Sugerencia')
      .setDescription(sugerencia)
      .setAuthor({ 
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
    
    const msg = await interaction.fetchReply()
    await msg.react('✅')
    await msg.react('❌')
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'sugerencia',
          description: 'Tu sugerencia para mejorar el servidor',
          required: true
        }
      ]
    }
  }
}
