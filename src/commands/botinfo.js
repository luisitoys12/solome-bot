const Command = require('../structures/command.js')
const { EmbedBuilder, version } = require('discord.js')
const os = require('os')

module.exports = class BotInfo extends Command {
  constructor (client) {
    super(client, {
      name: 'botinfo',
      description: 'Información sobre el bot'
    })
  }

  async runSlash (interaction) {
    const uptime = process.uptime()
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor(uptime / 3600) % 24
    const minutes = Math.floor(uptime / 60) % 60
    const seconds = Math.floor(uptime) % 60

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🤖 Información del Bot')
      .setThumbnail(this.client.user.displayAvatarURL())
      .addFields(
        { name: '📛 Nombre', value: this.client.user.tag, inline: true },
        { name: '🆔 ID', value: this.client.user.id, inline: true },
        { name: '📅 Creado', value: `<t:${Math.floor(this.client.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🏠 Servidores', value: `${this.client.guilds.cache.size}`, inline: true },
        { name: '👥 Usuarios', value: `${this.client.users.cache.size}`, inline: true },
        { name: '📡 Canales', value: `${this.client.channels.cache.size}`, inline: true },
        { name: '⏰ Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '🏓 Ping', value: `${this.client.ws.ping}ms`, inline: true },
        { name: '💾 Memoria', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: '📚 Discord.js', value: `v${version}`, inline: true },
        { name: '🟢 Node.js', value: process.version, inline: true },
        { name: '💻 Sistema', value: `${os.type()} ${os.release()}`, inline: true }
      )
      .setFooter({ text: 'Baba Radio v3.0 - Creado por perronosaurio' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }
}
