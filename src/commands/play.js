const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = class Play extends Command {
  constructor (client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'tocar'],
      description: '🎵 Reproduce música de YouTube, Spotify y más'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const query = interaction.options.getString('cancion')
    
    // Validar que el usuario esté en canal de voz
    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Debes estar en un canal de voz primero')
    }
    
    // Verificar que Lavalink esté disponible
    if (!this.client.manager) {
      return interaction.editReply(
        '❌ El sistema de música no está disponible.\n\n' +
        '🛠️ **Para administradores:**\n' +
        'Asegúrate de que Lavalink esté corriendo en el servidor.'
      )
    }
    
    try {
      // Crear o obtener player
      let player = this.client.manager.players.get(interaction.guild.id)
      
      if (!player) {
        player = this.client.manager.create({
          guild: interaction.guild.id,
          voiceChannel: interaction.member.voice.channel.id,
          textChannel: interaction.channel.id,
          selfDeafen: true,
          volume: 100
        })
      }
      
      // Conectar si no está conectado
      if (player.state !== 'CONNECTED') {
        player.connect()
      }
      
      // Buscar canción
      const res = await player.search(query, interaction.user)
      
      if (res.loadType === 'NO_MATCHES') {
        return interaction.editReply('❌ No se encontraron resultados para tu búsqueda')
      }
      
      if (res.loadType === 'LOAD_FAILED') {
        return interaction.editReply('❌ Error al cargar la canción. Intenta de nuevo.')
      }
      
      // Si es una playlist
      if (res.loadType === 'PLAYLIST_LOADED') {
        player.queue.add(res.tracks)
        
        const embed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle('🎶 Playlist Añadida')
          .setDescription(`**${res.playlist.name}**`)
          .addFields(
            { name: '🎵 Canciones', value: `${res.tracks.length}`, inline: true },
            { name: '⏱️ Duración', value: this.formatDuration(res.tracks.reduce((a, b) => a + b.duration, 0)), inline: true },
            { name: '📜 Cola', value: `${player.queue.size} canciones`, inline: true }
          )
          .setThumbnail(res.tracks[0].displayThumbnail('default'))
          .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
          .setTimestamp()
        
        if (!player.playing && !player.paused) {
          player.play()
        }
        
        return interaction.editReply({ embeds: [embed] })
      }
      
      // Canción individual
      const track = res.tracks[0]
      player.queue.add(track)
      
      const isPlaying = player.playing || player.paused
      
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(isPlaying ? '🎵 Añadido a la Cola' : '▶️ Reproduciendo Ahora')
        .setDescription(`**[${track.title}](${track.uri})**`)
        .addFields(
          { name: '🎤 Artista', value: track.author, inline: true },
          { name: '⏱️ Duración', value: this.formatDuration(track.duration), inline: true },
          { name: '📊 Posición', value: `#${player.queue.size}`, inline: true }
        )
        .setThumbnail(track.displayThumbnail('maxresdefault'))
        .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
        .setTimestamp()
      
      // Botones de control
      const row1 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('music_pause')
            .setEmoji('⏸️')
            .setLabel('Pausar')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('music_skip')
            .setEmoji('⏭️')
            .setLabel('Saltar')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('music_stop')
            .setEmoji('⏹️')
            .setLabel('Detener')
            .setStyle(ButtonStyle.Danger)
        )
      
      const row2 = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('music_queue')
            .setEmoji('📜')
            .setLabel('Ver Cola')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('music_lyrics')
            .setEmoji('📝')
            .setLabel('Letras')
            .setStyle(ButtonStyle.Secondary)
        )
      
      if (!player.playing && !player.paused) {
        player.play()
      }
      
      await interaction.editReply({ embeds: [embed], components: [row1, row2] })
      
    } catch (error) {
      this.client.log('error', 'Error en play:', error)
      await interaction.editReply('❌ Error al reproducir música. Intenta de nuevo.')
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
          type: 3, // STRING
          name: 'cancion',
          description: 'Nombre o URL de la canción (YouTube, Spotify, SoundCloud, etc.)',
          required: true
        }
      ]
    }
  }
}
