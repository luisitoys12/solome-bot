const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = class Premium extends Command {
  constructor (client) {
    super(client, {
      name: 'premium',
      description: 'Información sobre Baba Radio Premium'
    })
  }

  async runSlash (interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('👑 Baba Radio Premium')
      .setDescription('Desbloquea funciones exclusivas y lleva tu servidor al siguiente nivel!')
      .addFields(
        {
          name: '🎵 Música Premium',
          value: [
            '• Cola ilimitada de canciones',
            '• Calidad de audio superior (320kbps)',
            '• Filtros de audio avanzados',
            '• Ecualizador personalizado',
            '• Playlists guardadas ilimitadas',
            '• Sin anuncios ni interrupciones',
            '• Acceso prioritario a servidores Lavalink',
            '• Letras de canciones en tiempo real'
          ].join('\n'),
          inline: false
        },
        {
          name: '🛡️ Moderación Premium',
          value: [
            '• Auto-moderación con IA',
            '• Logs ilimitados y permanentes',
            '• Backup automático de configuración',
            '• Sistema de tickets avanzado',
            '• Comandos de moderación masiva',
            '• Filtros personalizados',
            '• Reportes automáticos',
            '• Dashboard web completo'
          ].join('\n'),
          inline: false
        },
        {
          name: '💎 Funciones Exclusivas',
          value: [
            '• Comandos personalizados ilimitados',
            '• Respuestas automáticas avanzadas',
            '• Sistema de economía personalizado',
            '• Niveles y XP personalizables',
            '• Embeds y botones personalizados',
            '• API de acceso completo',
            '• Soporte prioritario 24/7',
            '• Actualizaciones anticipadas'
          ].join('\n'),
          inline: false
        },
        {
          name: '💰 Planes Disponibles',
          value: [
            '**Basic** - $4.99/mes',
            '• 1 servidor',
            '• Funciones básicas premium',
            '',
            '**Pro** - $9.99/mes',
            '• 3 servidores',
            '• Todas las funciones premium',
            '',
            '**Enterprise** - $19.99/mes',
            '• Servidores ilimitados',
            '• Soporte dedicado',
            '• Funciones personalizadas'
          ].join('\n'),
          inline: false
        }
      )
      .setFooter({ text: 'Baba Radio Premium - Desarrollado por djluisalegre' })
      .setTimestamp()

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('🛒 Comprar Premium')
          .setStyle(ButtonStyle.Link)
          .setURL('https://babaradio.com/premium'),
        new ButtonBuilder()
          .setLabel('📊 Dashboard')
          .setStyle(ButtonStyle.Link)
          .setURL('https://dash.babaradio.com'),
        new ButtonBuilder()
          .setLabel('💬 Soporte')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/babaradio')
      )

    await interaction.reply({ embeds: [embed], components: [row] })
  }
}
