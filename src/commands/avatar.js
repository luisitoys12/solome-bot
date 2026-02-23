const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Avatar extends Command {
  constructor (client) {
    super(client, {
      name: 'avatar',
      aliases: ['av', 'pfp'],
      description: '🖼️ Muestra el avatar de un usuario'
    })
  }

  async runSlash (interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🖼️ Avatar de ${user.tag}`)
      .setDescription(
        `[🔗 PNG](${user.displayAvatarURL({ extension: 'png', size: 4096 })}) | ` +
        `[🔗 JPG](${user.displayAvatarURL({ extension: 'jpg', size: 4096 })}) | ` +
        `[🔗 WEBP](${user.displayAvatarURL({ extension: 'webp', size: 4096 })})`
      )
      .setImage(user.displayAvatarURL({ size: 1024 }))
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 6, // USER
          name: 'usuario',
          description: 'Usuario del cual ver el avatar (opcional)',
          required: false
        }
      ]
    }
  }
}
