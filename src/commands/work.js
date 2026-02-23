const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Work extends Command {
  constructor (client) {
    super(client, {
      name: 'work',
      aliases: ['trabajar'],
      description: '💼 Trabaja y gana dinero virtual (cooldown: 1 hora)'
    })
  }

  async runSlash (interaction) {
    const economy = load('economy', {})
    const userData = economy[interaction.user.id] || { balance: 0, lastWork: 0 }

    const cooldown = 3600000 // 1 hora
    const now = Date.now()

    if (now - userData.lastWork < cooldown) {
      const tiempoRestante = Math.ceil((cooldown - (now - userData.lastWork)) / 60000)
      return interaction.reply({ 
        content: `⏰ Debes esperar ${tiempoRestante} minutos para trabajar de nuevo.`,
        ephemeral: true 
      })
    }

    const trabajos = [
      { nombre: 'Programador', paga: [100, 300] },
      { nombre: 'Diseñador', paga: [80, 250] },
      { nombre: 'Streamer', paga: [50, 400] },
      { nombre: 'Editor de video', paga: [120, 280] }
    ]

    const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
    const ganancia = Math.floor(Math.random() * (trabajo.paga[1] - trabajo.paga[0] + 1)) + trabajo.paga[0]

    userData.balance += ganancia
    userData.lastWork = now
    economy[interaction.user.id] = userData
    save('economy', economy)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('💼 Trabajo Completado')
      .setDescription(`Trabajaste como **${trabajo.nombre}**`)
      .addFields(
        { name: '💰 Ganancia', value: `+$${ganancia}`, inline: true },
        { name: '💵 Balance', value: `$${userData.balance}`, inline: true }
      )

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
