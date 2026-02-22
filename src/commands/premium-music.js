const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class PremiumMusic extends Command {
  constructor (client) {
    super(client, {
      name: 'premium-music',
      aliases: [],
      description: '⭐ [PREMIUM] Funciones de música avanzadas - Requiere premium'
    })
  }

  async runSlash (interaction) {
    // Verificar premium (en producción verificar en BD)
    const isPremium = false // Cambiar según lógica de premium
    
    if (!isPremium) {
      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle('🔒 Función Premium Bloqueada')
        .setDescription('Este comando requiere **Solome Bot Premium**')
        .addFields(
          { name: '✨ Beneficios Premium', value: '• Calidad 320kbps\n• Sin límite de cola\n• Filtros de audio\n• Ecualizador personalizado\n• Música sin interrupciones\n• Prioridad en reproducción' },
          { name: '💳 Precio', value: '$4.99/mes o $49.99/año', inline: true },
          { name: '🎁 Prueba', value: '7 días gratis', inline: true }
        )
        .setFooter({ text: 'Usa /premium para más información' })
        .setTimestamp()
      
      return interaction.reply({ embeds: [embed], ephemeral: true })
    }
    
    // Lógica del comando premium aquí
    await interaction.reply({ content: '✨ Funciones premium de música activadas!' })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'funcion',
          description: 'Función premium a usar',
          required: true,
          choices: [
            { name: '🎵 Ecualizador', value: 'equalizer' },
            { name: '🔊 Filtros de Audio', value: 'filters' },
            { name: '🔁 Loop Infinito', value: 'loop' },
            { name: '🔀 Shuffle Inteligente', value: 'shuffle' },
            { name: '📥 Descargar MP3', value: 'download' }
          ]
        }
      ]
    }
  }
}
