const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = class Announce extends Command {
  constructor (client) {
    super(client, {
      name: 'announce',
      description: 'Envía un anuncio a un canal específico'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ Solo administradores pueden enviar anuncios.', ephemeral: true })
    }

    const channel = interaction.options.getChannel('canal')
    const title = interaction.options.getString('titulo')
    const message = interaction.options.getString('mensaje')
    const color = interaction.options.getString('color') || '#5865f2'
    const mention = interaction.options.getString('mencion')

    try {
      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`📢 ${title}`)
        .setDescription(message)
        .setFooter({ text: `Anunciado por ${interaction.user.tag}` })
        .setTimestamp()

      let content = ''
      if (mention === 'everyone') {
        content = '@everyone'
      } else if (mention === 'here') {
        content = '@here'
      }

      await channel.send({ content, embeds: [embed] })
      await interaction.reply({ content: `✅ Anuncio enviado a ${channel}`, ephemeral: true })

    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al enviar el anuncio.', ephemeral: true })
    }
  }
}
