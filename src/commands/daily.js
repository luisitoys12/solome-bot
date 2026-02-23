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
    const userId = interaction.user.id
    const economy = load('economy', {})
    const cooldowns = load('daily-cooldowns', {})

    const now = Date.now()
    const cooldownTime = 24 * 60 * 60 * 1000 // 24 horas
    const lastDaily = cooldowns[userId] || 0

    if (now - lastDaily < cooldownTime) {
      const timeLeft = cooldownTime - (now - lastDaily)
      const hours = Math.floor(timeLeft / (60 * 60 * 1000))
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))

      return interaction.reply({
        content: `⏰ Ya reclamaste tu recompensa diaria. Vuelve en **${hours}h ${minutes}m**`,
        ephemeral: true
      })
    }

    const reward = Math.floor(Math.random() * 500) + 500 // 500-1000 monedas

    if (!economy[userId]) {
      economy[userId] = { coins: 0, bank: 0 }
    }

    economy[userId].coins += reward
    cooldowns[userId] = now

    save('economy', economy)
    save('daily-cooldowns', cooldowns)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🎁 Recompensa Diaria')
      .setDescription(`¡Has reclamado tu recompensa diaria!`)
      .addFields(
        { name: '💰 Ganaste', value: `${reward} monedas`, inline: true },
        { name: '💵 Nuevo balance', value: `${economy[userId].coins} monedas`, inline: true }
      )
      .setFooter({ text: 'Vuelve mañana para reclamar más' })
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
