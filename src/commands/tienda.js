const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Tienda extends Command {
  constructor (client) {
    super(client, {
      name: 'tienda',
      aliases: ['shop', 'store'],
      description: '🏪 Muestra la tienda del servidor con items especiales'
    })
  }

  async runSlash (interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xe91e63)
      .setTitle('🏪 Tienda del Servidor')
      .setDescription('Compra items especiales con tus monedas')
      .addFields(
        {
          name: '🎨 Roles de Color',
          value: '**$1,000** - Rol personalizado con color\n**$2,500** - Rol animado (Premium)\n**$5,000** - Rol con icono (Premium)',
          inline: false
        },
        {
          name: '🎉 Funciones Especiales',
          value: '**$500** - Acceso a canal VIP por 7 días\n**$1,500** - Prioridad en cola de música\n**$3,000** - Comandos exclusivos por 30 días',
          inline: false
        },
        {
          name: '⭐ Items Premium',
          value: '**$10,000** - Badge exclusivo en perfil\n**$15,000** - Bot personal temporal (7 días)\n**$25,000** - Servidor premium permanente',
          inline: false
        },
        {
          name: '🎵 Música & Radio',
          value: '**$800** - Volumen ilimitado por 7 días\n**$2,000** - Radio sin anuncios\n**$4,000** - Playlist personalizada',
          inline: false
        }
      )
      .setFooter({ text: 'Usa /comprar <item> para adquirir' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
