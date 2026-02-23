const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load } = require('../utils/database.js')

module.exports = class Nivel extends Command {
  constructor (client) {
    super(client, {
      name: 'nivel',
      aliases: ['level', 'rank', 'xp'],
      description: '🎯 Consulta tu nivel y experiencia en el servidor'
    })
  }

  async runSlash (interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    const levels = load('levels', {})
    const userData = levels[targetUser.id] || { xp: 0, level: 1 }

    const xpForNext = userData.level * 100
    const progress = Math.floor((userData.xp / xpForNext) * 100)

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🎯 Nivel de ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '🏆 Nivel', value: `${userData.level}`, inline: true },
        { name: '⭐ XP Actual', value: `${userData.xp}/${xpForNext}`, inline: true },
        { name: '📊 Progreso', value: `${progress}%`, inline: true }
      )
      .setFooter({ text: 'Gana XP chateando en el servidor' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 6,
          name: 'usuario',
          description: 'Usuario a consultar (opcional)',
          required: false
        }
      ]
    }
  }
}
