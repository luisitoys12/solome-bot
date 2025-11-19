const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = class Kick extends Command {
  constructor (client) {
    super(client, {
      name: 'kick',
      description: 'Expulsa a un usuario del servidor'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ No tienes permisos para expulsar miembros.', ephemeral: true })
    }

    const user = interaction.options.getUser('usuario')
    const reason = interaction.options.getString('razon') || 'No especificada'
    const member = interaction.guild.members.cache.get(user.id)

    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado.', ephemeral: true })
    }

    if (!member.kickable) {
      return interaction.reply({ content: '❌ No puedo expulsar a este usuario.', ephemeral: true })
    }

    try {
      await member.kick(reason)
      
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('👢 Usuario Expulsado')
        .addFields(
          { name: 'Usuario', value: `${user.tag}`, inline: true },
          { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
          { name: 'Razón', value: reason }
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al expulsar al usuario.', ephemeral: true })
    }
  }
}
