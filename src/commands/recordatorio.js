const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Recordatorio extends Command {
  constructor (client) {
    super(client, {
      name: 'recordatorio',
      aliases: ['remind', 'reminder'],
      description: '⏰ Crea recordatorios personalizados (ej: 10m, 1h, 2d)'
    })
  }

  async runSlash (interaction) {
    const tiempo = interaction.options.getString('tiempo')
    const mensaje = interaction.options.getString('mensaje')

    const ms = this.parseTime(tiempo)
    
    if (!ms) {
      return interaction.reply({ 
        content: '❌ Formato de tiempo inválido. Usa: 10m, 1h, 2d',
        ephemeral: true 
      })
    }

    setTimeout(async () => {
      try {
        await interaction.user.send(`⏰ **Recordatorio:** ${mensaje}`)
      } catch (e) {
        // No se pudo enviar DM
      }
    }, ms)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Recordatorio creado')
      .addFields(
        { name: '⏰ Tiempo', value: tiempo, inline: true },
        { name: '📝 Mensaje', value: mensaje, inline: false }
      )

    await interaction.reply({ embeds: [embed] })
  }

  parseTime(str) {
    const match = str.match(/^(\d+)([smhd])$/)
    if (!match) return null

    const value = parseInt(match[1])
    const unit = match[2]

    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
    return value * (multipliers[unit] || 0)
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'tiempo',
          description: 'Cuándo recordarte (ej: 10m, 1h, 2d)',
          required: true
        },
        {
          type: 3,
          name: 'mensaje',
          description: 'Qué recordarte',
          required: true
        }
      ]
    }
  }
}
