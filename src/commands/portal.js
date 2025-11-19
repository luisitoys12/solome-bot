const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = class Portal extends Command {
  constructor (client) {
    super(client, {
      name: 'portal',
      description: 'Accede al portal web de Baba Radio'
    })
  }

  async runSlash (interaction) {
    const portalURL = `https://portal.babaradio.com/auth?user=${interaction.user.id}&guild=${interaction.guild.id}`
    
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🌐 Portal Web de Baba Radio')
      .setDescription('Accede al portal web para gestionar tu servidor y personalizar el bot.')
      .addFields(
        {
          name: '✨ Funcionalidades del Portal',
          value: [
            '• 📝 **Comandos Personalizados** - Crea tus propios comandos',
            '• ⚙️ **Configuración Avanzada** - Configura todos los módulos',
            '• 📊 **Dashboard** - Estadísticas en tiempo real',
            '• 🎵 **Gestión de Música** - Playlists y favoritos',
            '• 🛡️ **Moderación** - Panel de moderación completo',
            '• 💎 **Premium** - Accede a funciones exclusivas'
          ].join('\n')
        },
        {
          name: '🔐 Seguridad',
          value: 'El enlace es único y seguro. Solo tú puedes acceder con tu cuenta de Discord.'
        }
      )
      .setThumbnail(this.client.user.displayAvatarURL())
      .setFooter({ text: 'Baba Radio Portal - Próximamente' })
      .setTimestamp()

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('🌐 Abrir Dashboard')
          .setStyle(ButtonStyle.Link)
          .setURL('file:///workspaces/baba-radio/dashboard/index.html'),
        new ButtonBuilder()
          .setLabel('📚 Documentación')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/perronosaurio/baba-radio'),
        new ButtonBuilder()
          .setLabel('💎 Premium')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/babaradio')
      )

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
  }
}
