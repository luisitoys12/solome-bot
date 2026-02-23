const Command = require('../structures/command.js')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const axios = require('axios')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const execPromise = promisify(exec)

module.exports = class Download extends Command {
  constructor (client) {
    super(client, {
      name: 'download',
      aliases: ['dl', 'descargar'],
      description: '📥 Descarga audio/video de YouTube, Spotify, SoundCloud y más'
    })
  }

  async runSlash (interaction) {
    // ✅ IMPORTANTE: Responder INMEDIATAMENTE (antes de 3 segundos)
    await interaction.deferReply()
    
    const url = interaction.options.getString('url')
    const formato = interaction.options.getString('formato') || 'audio'
    
    try {
      // Validar URL
      if (!this.isValidURL(url)) {
        return interaction.editReply('❌ URL inválida. Soporta: YouTube, Spotify, SoundCloud, TikTok, Twitter, Instagram.')
      }

      // Mensaje de procesamiento
      const processingEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🔄 Procesando...')
        .setDescription(`Obteniendo información de **${this.getPlatform(url)}**...`)
        .setFooter({ text: 'Esto puede tardar unos segundos' })
        .setTimestamp()

      await interaction.editReply({ embeds: [processingEmbed] })

      // Verificar si yt-dlp está instalado
      const hasYtDlp = await this.checkYtDlp()
      
      if (!hasYtDlp) {
        return interaction.editReply({
          content: '❌ **yt-dlp no está instalado en el servidor.**\n\n'
            + '🛠️ Para instalar:\n'
            + '```bash\n'
            + 'sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp\n'
            + 'sudo chmod a+rx /usr/local/bin/yt-dlp\n'
            + '```',
          embeds: []
        })
      }

      // Obtener información del video
      const info = await this.getVideoInfo(url)
      
      if (!info) {
        return interaction.editReply('❌ No se pudo obtener información del video. Verifica que sea público.')
      }

      // Verificar duración (máximo 15 minutos)
      if (info.duration > 900) {
        return interaction.editReply(`❌ El contenido es muy largo (${this.formatDuration(info.duration)}). Máximo 15 minutos.`)
      }

      // Mostrar info
      const infoEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('📥 Descargando...')
        .setDescription(`**${info.title}**`)
        .addFields(
          { name: '👤 Autor', value: info.uploader || 'Desconocido', inline: true },
          { name: '⏱️ Duración', value: this.formatDuration(info.duration), inline: true },
          { name: '💾 Formato', value: formato === 'audio' ? '🎵 Audio MP3' : '🎥 Video MP4', inline: true }
        )
        .setThumbnail(info.thumbnail)
        .setFooter({ text: 'Descarga para uso personal • Respeta derechos de autor' })
        .setTimestamp()

      await interaction.editReply({ embeds: [infoEmbed] })

      // Descargar
      const result = await this.downloadContent(url, formato, info.title)
      
      if (!result.success) {
        return interaction.editReply(`❌ Error: ${result.error}`)
      }

      // Verificar tamaño (máximo 25MB para Discord)
      const fileSize = fs.statSync(result.filePath).size
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)

      if (fileSize > 25 * 1024 * 1024) {
        fs.unlinkSync(result.filePath)
        return interaction.editReply(`❌ El archivo es muy grande (${fileSizeMB}MB). Máximo 25MB para Discord.`)
      }

      // Enviar archivo
      const successEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Descarga Completada')
        .setDescription(`**${info.title}**`)
        .addFields(
          { name: '💾 Tamaño', value: `${fileSizeMB} MB`, inline: true },
          { name: '💾 Formato', value: formato === 'audio' ? 'MP3' : 'MP4', inline: true }
        )
        .setFooter({ 
          text: '⚠️ Solo para uso personal • Respeta los derechos de autor',
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp()

      await interaction.editReply({ 
        embeds: [successEmbed],
        files: [result.filePath]
      })

      // Limpiar archivo después de 10 segundos
      setTimeout(() => {
        if (fs.existsSync(result.filePath)) {
          fs.unlinkSync(result.filePath)
        }
      }, 10000)

    } catch (error) {
      this.client.log('error', 'Error en download:', error)
      
      const errorMessage = error.message.includes('Status code: 410') 
        ? '❌ YouTube bloqueó la descarga. Intenta de nuevo en unos minutos.'
        : `❌ Error: ${error.message}`
      
      await interaction.editReply(errorMessage).catch(() => {})
    }
  }

  async checkYtDlp() {
    try {
      await execPromise('yt-dlp --version')
      return true
    } catch {
      return false
    }
  }

  async getVideoInfo(url) {
    try {
      const { stdout } = await execPromise(`yt-dlp --dump-json --no-playlist "${url}"`)
      const data = JSON.parse(stdout)
      
      return {
        title: data.title?.substring(0, 100) || 'Sin título',
        uploader: data.uploader || data.channel || 'Desconocido',
        duration: data.duration || 0,
        thumbnail: data.thumbnail || data.thumbnails?.[0]?.url || null
      }
    } catch (error) {
      this.client.log('error', 'Error obteniendo info:', error.message)
      return null
    }
  }

  async downloadContent(url, formato, title) {
    try {
      const tempDir = path.join(__dirname, '../../temp')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)
      const timestamp = Date.now()
      const extension = formato === 'audio' ? 'mp3' : 'mp4'
      const fileName = `${safeTitle}_${timestamp}.${extension}`
      const filePath = path.join(tempDir, fileName)

      let command
      if (formato === 'audio') {
        command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${filePath}" "${url}"`
      } else {
        command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${filePath}" "${url}"`
      }

      await execPromise(command, { timeout: 120000 }) // 2 minutos timeout

      return {
        success: true,
        filePath: filePath
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  isValidURL(url) {
    try {
      new URL(url)
      const validDomains = [
        'youtube.com', 'youtu.be', 'spotify.com', 'soundcloud.com',
        'tiktok.com', 'twitter.com', 'x.com', 'instagram.com',
        'facebook.com', 'twitch.tv'
      ]
      return validDomains.some(domain => url.includes(domain))
    } catch {
      return false
    }
  }

  getPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
    if (url.includes('spotify.com')) return 'Spotify'
    if (url.includes('soundcloud.com')) return 'SoundCloud'
    if (url.includes('tiktok.com')) return 'TikTok'
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X'
    if (url.includes('instagram.com')) return 'Instagram'
    if (url.includes('facebook.com')) return 'Facebook'
    if (url.includes('twitch.tv')) return 'Twitch'
    return 'Desconocido'
  }

  formatDuration(seconds) {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  getSlashCommandData() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(option =>
        option
          .setName('url')
          .setDescription('URL del video/audio (YouTube, Spotify, SoundCloud, etc.)')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('formato')
          .setDescription('Formato de descarga')
          .setRequired(false)
          .addChoices(
            { name: '🎵 Audio (MP3)', value: 'audio' },
            { name: '🎥 Video (MP4)', value: 'video' }
          )
      )
  }
}
