const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = class Uptime extends Command {
  constructor (client) {
    super(client, {
      name: 'uptime',
      description: 'Muestra el tiempo que el bot ha estado encendido'
    })
  }

  async runSlash (interaction) {
    const uptime = Date.now() - (this.client.startTime || Date.now())
    
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24))
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000)

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('⏰ Tiempo de Actividad')
      .setDescription(`El bot ha estado en línea por:`)
      .addFields(
        { name: '📅 Días', value: `${days}`, inline: true },
        { name: '⏰ Horas', value: `${hours}`, inline: true },
        { name: '⏱️ Minutos', value: `${minutes}`, inline: true },
        { name: '⚡ Segundos', value: `${seconds}`, inline: true },
        { name: '🟢 Estado', value: 'Operacional', inline: true },
        { name: '📊 Ping', value: `${this.client.ws.ping}ms`, inline: true }
      )
      .setFooter({ text: `Iniciado: ${new Date(this.client.startTime).toLocaleString()}` })
      .setTimestamp()

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('report_crash')
          .setLabel('🚨 Reportar Problema')
          .setStyle(ButtonStyle.Danger)
      )

    await interaction.reply({ embeds: [embed], components: [row] })
  }
}
