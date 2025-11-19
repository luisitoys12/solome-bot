const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Credits extends Command {
  constructor (client) {
    super(client, {
      name: 'credits',
      description: 'Créditos y agradecimientos'
    })
  }

  async runSlash (interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle('💖 Créditos y Agradecimientos')
      .setDescription('Baba Radio no sería posible sin estas increíbles personas y servicios.')
      .addFields(
        {
          name: '👨‍💻 Desarrollador Principal',
          value: '**djluisalegre**\nCreador y desarrollador de Solome\n\n*Baba Radio no sería posible sin estas increíbles personas y servicios.*',
          inline: false
        },
        {
          name: '🎵 Servicio de Audio - Lavalink',
          value: '**Yumi Team**\nGracias por proporcionar el servidor Lavalink v4.1.1\nHost: 173.249.0.115:13592\n\n*Sin su servicio, la reproducción de música de alta calidad no sería posible.*',
          inline: false
        },
        {
          name: '📚 Tecnologías Utilizadas',
          value: [
            '• **Discord.js v14** - Framework de Discord',
            '• **Lavalink** - Sistema de audio profesional',
            '• **Node.js** - Runtime de JavaScript',
            '• **iHeartRadio API** - Estaciones de radio',
            '• **play-dl** - Reproducción de YouTube'
          ].join('\n'),
          inline: false
        },
        {
          name: '📻 Servicios de Radio',
          value: [
            '• **iHeartRadio** - Miles de estaciones de radio',
            '• **TuneIn** - Radio global (próximamente)',
            '• **MyTuner** - Estaciones internacionales (próximamente)'
          ].join('\n'),
          inline: false
        },
        {
          name: '🌟 Agradecimientos Especiales',
          value: [
            '• **djluisalegre** - Por crear Solome',
            '• **Yumi Team** - Por el hosting de Lavalink',
            '• A todos los usuarios que usan el bot',
            '• A la comunidad de Discord.js',
            '• A los contribuidores del proyecto'
          ].join('\n'),
          inline: false
        },
        {
          name: '🔗 Enlaces',
          value: '[GitHub](https://github.com/perronosaurio/baba-radio) • [Servidor de Soporte](#) • [Invitar Bot](#)',
          inline: false
        }
      )
      .setThumbnail(this.client.user.displayAvatarURL())
      .setFooter({ text: 'Baba Radio v3.5 - Hecho con ❤️' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }
}
