const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Daily extends Command {
  constructor (client) {
    super(client, {
      name: 'daily',
      aliases: ['diario'],
      description: '🎁 Reclama tu recompensa diaria'
    })
  }

  async runSlash (interaction) {
    // Simular recompensa
    const amount = Math.floor(Math.random() * 500) + 200
    const streak = Math.floor(Math.random() * 30) + 1
    const bonus = streak * 10
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🎁 ¡Recompensa Diaria Reclamada!')
      .setDescription(`Has ganado **$${amount.toLocaleString()}** monedas`)
      .addFields(
        { name: '🔥 Racha actual', value: `${streak} días`, inline: true },
        { name: '⭐ Bonus por racha', value: `$${bonus}`, inline: true },
        { name: '💰 Total recibido', value: `$${(amount + bonus).toLocaleString()}`, inline: true }
      )
      .setFooter({ text: 'Vuelve mañana para continuar tu racha' })
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
