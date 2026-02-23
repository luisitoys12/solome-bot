const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load } = require('../utils/database.js')

module.exports = class Nivel extends Command {
  constructor (client) {
    super(client, {
      name: 'nivel',
      aliases: ['level', 'lvl', 'rank'],
      description: '🏆 Consulta tu nivel y experiencia en el servidor'
    })
  }

  async runSlash (interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    const levels = load('levels', {})
    const userData = levels[targetUser.id] || { xp: 0, level: 0 }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🏆 Nivel')
      .setDescription(`**${targetUser.username}**`)
      .addFields(
        { name: '🔺 Nivel', value: `${userData.level}`, inline: true },
        { name: '⭐ XP', value: `${userData.xp}`, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 6, name: 'usuario', description: 'Usuario a consultar (opcional)', required: false }
      ]
    }
  }
}
