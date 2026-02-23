const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Play extends Command {
  constructor (client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'tocar'],
      description: '🎵 Reproduce música de YouTube, Spotify, SoundCloud o URL directa'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()

    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Debes estar en un canal de voz para usar este comando.')
    }

    const cancion = interaction.options.getString('cancion')

    // TODO: Implementar lógica de reproducción
    // Por ahora solo muestra mensaje de placeholder

    const embed = new EmbedBuilder()
      .setColor(0x1db954)
      .setTitle('🎵 Reproduciendo Música')
      .setDescription(`Buscando: **${cancion}**`)
      .addFields(
        { name: '👥 Canal', value: interaction.member.voice.channel.name, inline: true },
        { name: '🔊 Volumen', value: '100%', inline: true }
      )
      .setFooter({ text: 'Usa /queue para ver la cola' })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'cancion',
          description: 'Nombre de la canción, URL de YouTube/Spotify/SoundCloud o enlace MP3',
          required: true
        }
      ]
    }
  }
}
