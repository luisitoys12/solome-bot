const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = class Kick extends Command {
  constructor (client) {
    super(client, {
      name: 'kick',
      aliases: ['expulsar'],
      description: '👢 Expulsa a un usuario del servidor'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ No tienes permiso de **Expulsar Miembros**', flags: 64 })
    }
    
    const member = interaction.options.getMember('usuario')
    const razon = interaction.options.getString('razon') || 'Sin razón especificada'
    
    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado en el servidor', flags: 64 })
    }
    
    if (member.id === interaction.user.id) {
      return interaction.reply({ content: '❌ No puedes expulsarte a ti mismo', flags: 64 })
    }
    
    if (member.id === interaction.guild.ownerId) {
      return interaction.reply({ content: '❌ No puedes expulsar al dueño del servidor', flags: 64 })
    }
    
    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: '❌ No puedes expulsar a alguien con rol igual o superior', flags: 64 })
    }
    
    if (!member.kickable) {
      return interaction.reply({ content: '❌ No puedo expulsar a este usuario', flags: 64 })
    }
    
    try {
      await member.kick(`${razon} | Expulsado por ${interaction.user.tag}`)
      
      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('👢 Usuario Expulsado')
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          { name: '👤 Usuario', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: '👮 Moderador', value: interaction.user.tag, inline: true },
          { name: '📝 Razón', value: razon, inline: false }
        )
        .setFooter({ text: `ID: ${member.id}` })
        .setTimestamp()
      
      await interaction.reply({ embeds: [embed] })
      
    } catch (error) {
      this.client.log('error', 'Kick error:', error)
      await interaction.reply({ content: '❌ Error al expulsar al usuario', flags: 64 })
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 6, // USER
          name: 'usuario',
          description: 'Usuario a expulsar',
          required: true
        },
        {
          type: 3, // STRING
          name: 'razon',
          description: 'Razón de la expulsión',
          required: false
        }
      ]
    }
  }
}
