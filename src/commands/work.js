const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Work extends Command {
  constructor (client) {
    super(client, {
      name: 'work',
      aliases: ['trabajar', 'currar'],
      description: '💼 Trabaja para ganar monedas'
    })
  }

  async runSlash (interaction) {
    const economy = load('economy', {})
    const workCooldowns = load('work-cooldowns', {})
    
    const userId = interaction.user.id
    const now = Date.now()
    const cooldownTime = 60 * 60 * 1000 // 1 hora
    
    if (workCooldowns[userId] && now - workCooldowns[userId] < cooldownTime) {
      const timeLeft = cooldownTime - (now - workCooldowns[userId])
      const minutes = Math.floor(timeLeft / (60 * 1000))
      
      return interaction.reply({ 
        content: `⏰ Ya trabajaste recientemente. Vuelve en ${minutes} minutos`,
        ephemeral: true 
      })
    }

    const trabajos = [
      { nombre: 'Programador', min: 200, max: 500 },
      { nombre: 'Streamer', min: 150, max: 400 },
      { nombre: 'DJ', min: 100, max: 300 },
      { nombre: 'Community Manager', min: 80, max: 250 }
    ]

    const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
    const ganancia = Math.floor(Math.random() * (trabajo.max - trabajo.min + 1)) + trabajo.min
    
    economy[userId] = (economy[userId] || 0) + ganancia
    workCooldowns[userId] = now
    
    save('economy', economy)
    save('work-cooldowns', workCooldowns)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('💼 Trabajo Completado')
      .setDescription(`Trabajaste como **${trabajo.nombre}** y ganaste **${ganancia}** monedas!\n\nBalance actual: **${economy[userId]}** monedas`)
      .setFooter({ text: 'Vuelve en 1 hora' })
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
