const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Nivel extends Command {
  constructor (client) {
    super(client, {
      name: 'nivel',
      aliases: ['level', 'rank', 'xp'],
      description: '🎮 Muestra tu nivel y experiencia en el servidor'
    })
  }

  async runSlash (interaction) {
    const usuario = interaction.options.getUser('usuario') || interaction.user
    
    // Simular sistema de niveles
    const level = Math.floor(Math.random() * 50) + 1
    const currentXP = Math.floor(Math.random() * 800)
    const requiredXP = level * 100
    const totalXP = (level * (level - 1) * 50) + currentXP
    const progress = Math.floor((currentXP / requiredXP) * 20)
    const progressBar = '█'.repeat(progress) + '░'.repeat(20 - progress)
    
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🎮 Nivel de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL())
      .setDescription(`**Nivel ${level}**\n${progressBar} ${Math.floor((currentXP/requiredXP)*100)}%`)
      .addFields(
        { name: '⭐ XP Actual', value: `${currentXP.toLocaleString()}`, inline: true },
        { name: '🎯 XP Requerido', value: `${requiredXP.toLocaleString()}`, inline: true },
        { name: '📊 XP Total', value: `${totalXP.toLocaleString()}`, inline: true },
        { name: '📈 Próximo Nivel', value: `${requiredXP - currentXP} XP restantes`, inline: false }
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
