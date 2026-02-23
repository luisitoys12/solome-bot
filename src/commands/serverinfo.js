const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class ServerInfo extends Command {
  constructor (client) {
    super(client, {
      name: 'serverinfo',
      aliases: ['server', 'guild'],
      description: '🏛️ Muestra información del servidor'
    })
  }

  async runSlash (interaction) {
    const { guild } = interaction
    
    await guild.members.fetch()
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🏛️ ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Dueño', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Creado', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👥 Miembros', value: `${guild.memberCount}`, inline: true },
        { name: '🤖 Bots', value: `${guild.members.cache.filter(m => m.user.bot).size}`, inline: true },
        { name: '🟢 En línea', value: `${guild.members.cache.filter(m => m.presence?.status === 'online').size}`, inline: true },
        { name: '💬 Canales', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎨 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount || 0} (Nivel ${guild.premiumTier})`, inline: true },
        { name: '📢 Nivel verificación', value: guild.verificationLevel.toString(), inline: true },
        { name: '😎 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '🎵 Stickers', value: `${guild.stickers.cache.size}`, inline: true }
      )
    
    if (guild.description) {
      embed.setDescription(guild.description)
    }
    
    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ size: 512 }))
    }
    
    embed.setFooter({ text: `Solicitado por ${interaction.user.tag}` })
    embed.setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
