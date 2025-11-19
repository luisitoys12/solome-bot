const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = class Ban extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      description: 'Banea a un usuario del servidor'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ No tienes permisos para banear miembros.', ephemeral: true })
    }

    const user = interaction.options.getUser('usuario')
    const reason = interaction.options.getString('razon') || 'No especificada'
    const days = interaction.options.getInteger('dias') || 0
    const member = interaction.guild.members.cache.get(user.id)

    if (member && !member.bannable) {
      return interaction.reply({ content: '❌ No puedo banear a este usuario.', ephemeral: true })
    }

    try {
      await interaction.guild.members.ban(user, { reason, deleteMessageDays: days })
      
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🔨 Usuario Baneado')
        .addFields(
          { name: 'Usuario', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
          { name: 'Razón', value: reason },
          { name: 'Mensajes Eliminados', value: `${days} días`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al banear al usuario.', ephemeral: true })
    }
  }
}
