const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class UserInfo extends Command {
  constructor (client) {
    super(client, {
      name: 'userinfo',
      aliases: ['user', 'whois'],
      description: '👤 Muestra información de un usuario'
    })
  }

  async runSlash (interaction) {
    const user = interaction.options.getUser('usuario') || interaction.user
    const member = interaction.guild.members.cache.get(user.id)
    
    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor || 0x5865F2)
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '👤 Mención', value: `<@${user.id}>`, inline: true },
        { name: '🤖 Bot', value: user.bot ? '✅ Sí' : '❌ No', inline: true },
        { name: '📅 Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: false }
      )
    
    if (member) {
      embed.addFields(
        { name: '💬 Unió al servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false },
        { name: '🎨 Roles', value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(' ') || 'Sin roles', inline: false },
        { name: '🟢 Estado', value: member.presence?.status || 'offline', inline: true },
        { name: '🎮 Actividad', value: member.presence?.activities[0]?.name || 'Ninguna', inline: true }
      )
    }
    
    if (user.bannerURL()) {
      embed.setImage(user.bannerURL({ size: 512 }))
    }
    
    embed.setFooter({ text: `Solicitado por ${interaction.user.tag}` })
    embed.setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 6, // USER
          name: 'usuario',
          description: 'Usuario del cual ver información (opcional)',
          required: false
        }
      ]
    }
  }
}
