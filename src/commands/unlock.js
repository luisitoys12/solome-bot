const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = class Unlock extends Command {
  constructor (client) {
    super(client, {
      name: 'unlock',
      description: 'Desbloquea un canal'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ No tienes permisos para gestionar canales.', ephemeral: true })
    }

    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: null
      })

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🔓 Canal Desbloqueado')
        .setDescription('Este canal ha sido desbloqueado. Todos pueden enviar mensajes.')
        .addFields(
          { name: 'Moderador', value: `${interaction.user.tag}`, inline: true }
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al desbloquear el canal.', ephemeral: true })
    }
  }
}
