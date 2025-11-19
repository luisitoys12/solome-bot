const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = class Warn extends Command {
  constructor (client) {
    super(client, {
      name: 'warn',
      description: 'Advierte a un usuario'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ No tienes permisos para advertir miembros.', ephemeral: true })
    }

    const user = interaction.options.getUser('usuario')
    const reason = interaction.options.getString('razon')

    // En producción, guardar en base de datos
    if (!this.client.warnings) this.client.warnings = new Map()
    if (!this.client.warnings.has(interaction.guild.id)) {
      this.client.warnings.set(interaction.guild.id, new Map())
    }
    
    const guildWarnings = this.client.warnings.get(interaction.guild.id)
    if (!guildWarnings.has(user.id)) {
      guildWarnings.set(user.id, [])
    }
    
    guildWarnings.get(user.id).push({
      reason,
      moderator: interaction.user.id,
      timestamp: Date.now()
    })

    const totalWarnings = guildWarnings.get(user.id).length

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('⚠️ Usuario Advertido')
      .addFields(
        { name: 'Usuario', value: `${user.tag}`, inline: true },
        { name: 'Advertencias', value: `${totalWarnings}`, inline: true },
        { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
        { name: 'Razón', value: reason }
      )
      .setThumbnail(user.displayAvatarURL())
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })

    try {
      await user.send({ embeds: [embed] })
    } catch (e) {
      // Usuario tiene DMs desactivados
    }
  }
}
