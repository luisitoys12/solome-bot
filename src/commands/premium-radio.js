const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class PremiumRadio extends Command {
  constructor (client) {
    super(client, {
      name: 'premium-radio',
      aliases: [],
      description: '⭐ [PREMIUM] Estaciones premium sin anuncios - Requiere premium'
    })
  }

  async runSlash (interaction) {
    const isPremium = false
    
    if (!isPremium) {
      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('🔒 Radios Premium Bloqueadas')
        .setDescription('Accede a **500,000+ estaciones premium** sin anuncios')
        .addFields(
          { name: '✨ Incluye', value: '• Todas las estaciones de pago\n• Calidad 320kbps\n• Sin anuncios\n• Estaciones exclusivas\n• Radio personalizada\n• Grabación de programas' },
          { name: '📡 Fuentes Premium', value: 'iHeart+, TuneIn Premium, Sirius XM, Spotify Radio' }
        )
        .setFooter({ text: 'Mejora a premium con /premium' })
        .setTimestamp()
      
      return interaction.reply({ embeds: [embed], ephemeral: true })
    }
    
    await interaction.reply({ content: '📻 Accediendo a radios premium...' })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'busqueda',
          description: 'Buscar en estaciones premium',
          required: true
        }
      ]
    }
  }
}
