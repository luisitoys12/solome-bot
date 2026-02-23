const Command = require('../structures/command.js')

module.exports = class Recordatorio extends Command {
  constructor (client) {
    super(client, {
      name: 'recordatorio',
      aliases: ['reminder', 'remind'],
      description: '⏰ Crea un recordatorio que te notificará en el tiempo especificado'
    })
  }

  async runSlash (interaction) {
    const tiempo = interaction.options.getString('tiempo')
    const mensaje = interaction.options.getString('mensaje')

    await interaction.reply(`⏰ Recordatorio configurado para **${tiempo}**: ${mensaje} (próximamente)`)
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 3, name: 'tiempo', description: 'Cuándo recordarte (ej: 10m, 1h, 2d)', required: true },
        { type: 3, name: 'mensaje', description: 'Qué recordarte', required: true }
      ]
    }
  }
}
