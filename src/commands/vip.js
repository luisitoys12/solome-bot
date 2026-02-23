const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class VIP extends Command {
  constructor (client) {
    super(client, {
      name: 'vip',
      aliases: [],
      description: '👑 Sistema VIP - Solicita canciones, reclama recompensas y activa beneficios'
    })
  }

  async runSlash (interaction) {
    const accion = interaction.options.getString('accion')
    
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('👑 Sistema VIP')
      .setDescription(`Acción: ${accion}\n\nEsta función está en desarrollo.`)

    await interaction.reply({ embeds: [embed], ephemeral: true })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'accion',
          description: 'Acción VIP a realizar',
          required: true,
          choices: [
            { name: '🎵 Solicitar canción prioritaria', value: 'request' },
            { name: '🎁 Reclamar recompensa VIP', value: 'reward' },
            { name: '👑 Ver beneficios VIP', value: 'benefits' },
            { name: '⭐ Activar modo VIP en canal', value: 'activate' }
          ]
        }
      ]
    }
  }
}
