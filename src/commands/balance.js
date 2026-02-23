const Command = require('../structures/command.js')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { load } = require('../utils/database.js')

module.exports = class Balance extends Command {
  constructor (client) {
    super(client, {
      name: 'balance',
      aliases: ['bal', 'dinero', 'money'],
      description: '💰 Consulta tu balance de monedas del servidor'
    })
  }

  async runSlash (interaction) {
    // ✅ Responder inmediatamente
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    
    try {
      const economy = load('economy', {})
      const balance = economy[targetUser.id] || 0

      const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle('💰 Balance')
        .setDescription(`**${targetUser.username}** tiene **${balance.toLocaleString()}** monedas`)
        .setThumbnail(targetUser.displayAvatarURL())
        .setFooter({ text: 'Usa /daily para ganar monedas diarias' })
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', 'Error en balance:', error)
      await interaction.reply({ 
        content: '❌ Error al obtener el balance. Inténtalo de nuevo.', 
        ephemeral: true 
      }).catch(() => {})
    }
  }

  getSlashCommandData() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(option =>
        option
          .setName('usuario')
          .setDescription('Usuario a consultar (opcional)')
          .setRequired(false)
      )
  }
}
