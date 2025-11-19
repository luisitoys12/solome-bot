const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const ms = require('ms')

module.exports = class Timeout extends Command {
  constructor (client) {
    super(client, {
      name: 'timeout',
      description: 'Silencia temporalmente a un usuario'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ No tienes permisos para silenciar miembros.', ephemeral: true })
    }

    const user = interaction.options.getUser('usuario')
    const duration = interaction.options.getString('duracion')
    const reason = interaction.options.getString('razon') || 'No especificada'
    const member = interaction.guild.members.cache.get(user.id)

    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado.', ephemeral: true })
    }

    if (!member.moderatable) {
      return interaction.reply({ content: '❌ No puedo silenciar a este usuario.', ephemeral: true })
    }

    try {
      const time = ms(duration)
      if (!time || time > ms('28d')) {
        return interaction.reply({ content: '❌ Duración inválida. Usa formato como: 10m, 1h, 1d (máximo 28 días)', ephemeral: true })
      }

      await member.timeout(time, reason)
      
      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('🔇 Usuario Silenciado')
        .addFields(
          { name: 'Usuario', value: `${user.tag}`, inline: true },
          { name: 'Duración', value: duration, inline: true },
          { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
          { name: 'Razón', value: reason },
          { name: 'Expira', value: `<t:${Math.floor((Date.now() + time) / 1000)}:R>` }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al silenciar al usuario.', ephemeral: true })
    }
  }
}
