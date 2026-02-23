const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class VIP extends Command {
  constructor (client) {
    super(client, {
      name: 'vip',
      aliases: ['premium'],
      description: '⭐ Accede a funciones VIP exclusivas del servidor'
    })
  }

  async runSlash (interaction) {
    const accion = interaction.options.getString('accion')

    const beneficios = [
      '🎵 Solicitudes de canciones prioritarias',
      '🏆 Roles y badges exclusivos',
      '💰 Multiplicador de monedas x2',
      '🎮 Acceso a comandos premium',
      '🎁 Recompensas diarias mejoradas'
    ]

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('⭐ Beneficios VIP')
      .setDescription(beneficios.join('\n'))
      .setFooter({ text: 'Sistema VIP próximamente' })

    await interaction.reply({ embeds: [embed] })
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
