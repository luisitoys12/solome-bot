const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice')
const play = require('play-dl')

module.exports = class Music extends Command {
  constructor (client) {
    super(client, {
      name: 'music',
      aliases: [],
      description: 'Reproduce música de YouTube (comando clásico)'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const query = interaction.options.getString('cancion')

    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Necesitas estar en un canal de voz!')
    }

    try {
      // Buscar en YouTube
      const searchResults = await play.search(query, { limit: 1 })
      
      if (!searchResults || searchResults.length === 0) {
        return interaction.editReply('❌ No se encontraron resultados en YouTube.')
      }

      const video = searchResults[0]
      
      // Obtener stream
      const stream = await play.stream(video.url)

      // Unirse al canal de voz
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      })

      await entersState(connection, VoiceConnectionStatus.Ready, 30_000)

      // Crear reproductor
      const player = createAudioPlayer()
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true
      })
      
      player.play(resource)
      connection.subscribe(player)

      // Enviar embed
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🎵 Reproduciendo Ahora')
        .setDescription(`**${video.title}**`)
        .addFields(
          { name: '👤 Canal', value: video.channel.name, inline: true },
          { name: '⏱️ Duración', value: video.durationRaw, inline: true },
          { name: '👁️ Vistas', value: video.views.toLocaleString(), inline: true }
        )
        .setThumbnail(video.thumbnails[0].url)
        .setURL(video.url)
        .setFooter({ text: `Solicitado por ${interaction.user.tag} • YouTube Music` })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy()
      })

      player.on('error', error => {
        this.client.log('error', error)
        interaction.followUp({ content: '❌ Error al reproducir la canción.', ephemeral: true }).catch(() => {})
      })

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al reproducir música de YouTube.')
    }
  }
}
