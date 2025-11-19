const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = class Lock extends Command {
  constructor (client) {
    super(client, {
      name: 'lock',
      description: 'Bloquea un canal para que nadie pueda enviar mensajes'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ No tienes permisos para gestionar canales.', ephemeral: true })
    }

    const reason = interaction.options.getString('razon') || 'No especificada'

    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
        SendMessages: false
      })

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🔒 Canal Bloqueado')
        .setDescription('Este canal ha sido bloqueado. Nadie puede enviar mensajes.')
        .addFields(
          { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
          { name: 'Razón', value: reason }
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al bloquear el canal.', ephemeral: true })
    }
  }
}
