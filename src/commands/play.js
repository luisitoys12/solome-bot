const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Play extends Command {
  constructor (client) {
    super(client, {
      name: 'play',
      aliases: [],
      description: 'Reproduce música de YouTube, Spotify, SoundCloud, enlaces MP3 y más con Lavalink'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const query = interaction.options.getString('cancion')

    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Necesitas estar en un canal de voz!')
    }

    // Verificar si Lavalink está disponible
    if (!this.client.lavalink) {
      return interaction.editReply('❌ El sistema de música Lavalink no está disponible en este momento. Intenta más tarde.')
    }

    try {
      const player = this.client.lavalink.getPlayer(interaction.guild.id) || 
                     this.client.lavalink.createPlayer({
                       guildId: interaction.guild.id,
                       voiceChannelId: interaction.member.voice.channel.id,
                       textChannelId: interaction.channel.id,
                       selfDeaf: true,
                       selfMute: false
                     })

      if (!player.connected) await player.connect()

      // Detectar tipo de fuente
      let searchQuery = query
      if (query.includes('youtube.com') || query.includes('youtu.be')) {
        searchQuery = query
      } else if (query.includes('spotify.com')) {
        searchQuery = query
      } else if (query.includes('soundcloud.com')) {
        searchQuery = query
      } else if (query.match(/\.(mp3|wav|ogg|flac|m4a)$/i) || query.startsWith('http')) {
        searchQuery = query
      } else {
        searchQuery = `ytsearch:${query}`
      }

      const res = await player.search({ query: searchQuery }, interaction.user)

      if (!res || !res.tracks || res.tracks.length === 0) {
        return interaction.editReply('❌ No se encontraron resultados.')
      }

      const track = res.tracks[0]
      
      await player.queue.add(track)
      
      if (!player.playing && !player.paused && player.queue.tracks.length === 1) {
        await player.play()
      }

      // Determinar icono y nombre de fuente
      let sourceIcon = '🎵'
      let sourceName = 'Desconocido'
      
      if (track.info.sourceName === 'youtube') {
        sourceIcon = '▶️'
        sourceName = 'YouTube'
      } else if (track.info.sourceName === 'spotify') {
        sourceIcon = '🟢'
        sourceName = 'Spotify'
      } else if (track.info.sourceName === 'soundcloud') {
        sourceIcon = '🟠'
        sourceName = 'SoundCloud'
      } else if (track.info.sourceName === 'http') {
        sourceIcon = '🔗'
        sourceName = 'Link Directo'
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`${sourceIcon} Reproduciendo Ahora`)
        .setDescription(`**${track.info.title}**`)
        .addFields(
          { name: '👤 Artista', value: track.info.author || 'Desconocido', inline: true },
          { name: '⏱️ Duración', value: this.formatDuration(track.info.duration), inline: true },
          { name: '📡 Fuente', value: sourceName, inline: true }
        )
        .setThumbnail(track.info.artworkUrl || 'https://cdn.discordapp.com/attachments/330739726321713153/598282410349690890/kisspng-iheartradio-iheartmedia-app-store-internet-radio-hibiki-radio-station-5b3d78199a0fb4.png')
        .setFooter({ text: `Solicitado por ${interaction.user.tag} • Powered by Yumi Team Lavalink` })
        .setTimestamp()

      if (track.info.uri) {
        embed.setURL(track.info.uri)
      }

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al reproducir la música. Verifica que el enlace sea válido.')
    }
  }

  formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
