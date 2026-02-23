const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Daily extends Command {
  constructor (client) {
    super(client, {
      name: 'daily',
      aliases: ['diario'],
      description: '🎁 Reclama tu recompensa diaria de monedas'
    })
  }

  async runSlash (interaction) {
    const economy = load('economy', {})
    const dailyCooldowns = load('daily-cooldowns', {})
    
    const userId = interaction.user.id
    const now = Date.now()
    const cooldownTime = 24 * 60 * 60 * 1000 // 24 horas
    
    if (dailyCooldowns[userId] && now - dailyCooldowns[userId] < cooldownTime) {
      const timeLeft = cooldownTime - (now - dailyCooldowns[userId])
      const hours = Math.floor(timeLeft / (60 * 60 * 1000))
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
      
      return interaction.reply({ 
        content: `⏰ Ya reclamaste tu recompensa diaria. Vuelve en ${hours}h ${minutes}m`,
        ephemeral: true 
      })
    }

    const reward = Math.floor(Math.random() * 500) + 100
    economy[userId] = (economy[userId] || 0) + reward
    dailyCooldowns[userId] = now
    
    save('economy', economy)
    save('daily-cooldowns', dailyCooldowns)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🎁 Recompensa Diaria')
      .setDescription(`¡Recibiste **${reward}** monedas!\n\nBalance actual: **${economy[userId]}** monedas`)
      .setFooter({ text: 'Vuelve en 24 horas' })
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
