const Command = require('../structures/command.js')
const { PermissionFlagsBits } = require('discord.js')

module.exports = class Clear extends Command {
  constructor (client) {
    super(client, {
      name: 'clear',
      aliases: ['purge', 'delete'],
      description: '🧹 Elimina mensajes de un canal'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ No tienes permiso de **Administrar Mensajes**', flags: 64 })
    }
    
    const cantidad = interaction.options.getInteger('cantidad')
    
    if (cantidad < 1 || cantidad > 100) {
      return interaction.reply({ content: '❌ Debes especificar entre 1 y 100 mensajes', flags: 64 })
    }
    
    await interaction.deferReply({ flags: 64 })
    
    try {
      const messages = await interaction.channel.bulkDelete(cantidad, true)
      
      await interaction.editReply(`✅ Eliminados **${messages.size}** mensajes`)
      
      // Auto-eliminar confirmación después de 5s
      setTimeout(() => {
        interaction.deleteReply().catch(() => {})
      }, 5000)
      
    } catch (error) {
      this.client.log('error', 'Clear error:', error)
      await interaction.editReply('❌ Error al eliminar mensajes. Asegúrate de que no sean mayores a 14 días')
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 4, // INTEGER
          name: 'cantidad',
          description: 'Cantidad de mensajes a eliminar (1-100)',
          required: true,
          minValue: 1,
          maxValue: 100
        }
      ]
    }
  }
}
