const Command = require('../structures/command.js')
const { PermissionFlagsBits } = require('discord.js')

module.exports = class Clear extends Command {
  constructor (client) {
    super(client, {
      name: 'clear',
      description: 'Elimina mensajes del canal'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ No tienes permisos para gestionar mensajes.', ephemeral: true })
    }

    const amount = interaction.options.getInteger('cantidad')

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ Debes especificar un número entre 1 y 100.', ephemeral: true })
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true)
      
      await interaction.reply({ content: `🗑️ Se eliminaron ${deleted.size} mensajes.`, ephemeral: true })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al eliminar mensajes. Los mensajes deben tener menos de 14 días.', ephemeral: true })
    }
  }
}
