const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Ping extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      aliases: ['latencia', 'latency'],
      description: '🏓 Muestra la latencia del bot'
    })
  }

  async runSlash (interaction) {
    const sent = await interaction.reply({ content: '🏓 Calculando ping...', fetchReply: true })
    
    const ping = sent.createdTimestamp - interaction.createdTimestamp
    const apiPing = Math.round(this.client.ws.ping)
    
    // Determinar color según latencia
    let color = 0x00FF00 // Verde
    if (apiPing > 200) color = 0xFFFF00 // Amarillo
    if (apiPing > 500) color = 0xFF0000 // Rojo
    
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: '💬 Latencia del mensaje', value: `${ping}ms`, inline: true },
        { name: '💓 Latencia de API', value: `${apiPing}ms`, inline: true },
        { name: '📊 Estado', value: apiPing < 200 ? '✅ Excelente' : apiPing < 500 ? '⚠️ Bueno' : '❌ Lento', inline: true }
      )
      .setFooter({ text: `Uptime: ${this.formatUptime(this.client.uptime)}` })
      .setTimestamp()
    
    await interaction.editReply({ content: null, embeds: [embed] })
  }

  formatUptime(ms) {
    const days = Math.floor(ms / 86400000)
    const hours = Math.floor(ms / 3600000) % 24
    const minutes = Math.floor(ms / 60000) % 60
    const seconds = Math.floor(ms / 1000) % 60
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
