const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Sugerencia extends Command {
  constructor (client) {
    super(client, {
      name: 'sugerencia',
      aliases: ['suggest', 'suggestion'],
      description: 'Envía una sugerencia para el servidor'
    })
  }

  async runSlash (interaction) {
    const sugerencia = interaction.options.getString('sugerencia')
    
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('💡 Nueva Sugerencia')
      .setDescription(sugerencia)
      .addFields(
        { name: '👤 Autor', value: `${interaction.user.tag}`, inline: true },
        { name: '🕑 Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: `ID: ${interaction.user.id}` })
      .setTimestamp()
    
    const message = await interaction.reply({ embeds: [embed], fetchReply: true })
    
    // Añadir reacciones
    await message.react('✅') // Check
    await message.react('❌') // X
    
    await interaction.followUp({ 
      content: '✅ Tu sugerencia ha sido enviada!',
      ephemeral: true 
    })
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
