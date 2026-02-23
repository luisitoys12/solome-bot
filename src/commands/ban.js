const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = class Ban extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      aliases: ['banear'],
      description: '🔨 Banea a un usuario del servidor'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ No tienes permiso de **Banear Miembros**', flags: 64 })
    }
    
    const user = interaction.options.getUser('usuario')
    const razon = interaction.options.getString('razon') || 'Sin razón especificada'
    const dias = interaction.options.getInteger('dias') || 0
    
    const member = interaction.guild.members.cache.get(user.id)
    
    if (member) {
      if (member.id === interaction.user.id) {
        return interaction.reply({ content: '❌ No puedes banearte a ti mismo', flags: 64 })
      }
      
      if (member.id === interaction.guild.ownerId) {
        return interaction.reply({ content: '❌ No puedes banear al dueño del servidor', flags: 64 })
      }
      
      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({ content: '❌ No puedes banear a alguien con rol igual o superior', flags: 64 })
      }
      
      if (!member.bannable) {
        return interaction.reply({ content: '❌ No puedo banear a este usuario', flags: 64 })
      }
    }
    
    try {
      await interaction.guild.members.ban(user, { 
        deleteMessageDays: dias,
        reason: `${razon} | Baneado por ${interaction.user.tag}` 
      })
      
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('🔨 Usuario Baneado')
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: '👤 Usuario', value: `${user.tag} (${user.id})`, inline: true },
          { name: '👮 Moderador', value: interaction.user.tag, inline: true },
          { name: '📝 Razón', value: razon, inline: false },
          { name: '🗑️ Mensajes eliminados', value: `Últimos ${dias} días`, inline: true }
        )
        .setFooter({ text: `ID: ${user.id}` })
        .setTimestamp()
      
      await interaction.reply({ embeds: [embed] })
      
    } catch (error) {
      this.client.log('error', 'Ban error:', error)
      await interaction.reply({ content: '❌ Error al banear al usuario', flags: 64 })
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
          description: 'Usuario a banear',
          required: true
        },
        {
          type: 3, // STRING
          name: 'razon',
          description: 'Razón del baneo',
          required: false
        },
        {
          type: 4, // INTEGER
          name: 'dias',
          description: 'Días de mensajes a eliminar (0-7)',
          required: false,
          minValue: 0,
          maxValue: 7
        }
      ]
    }
  }
}
