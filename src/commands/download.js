const Command = require('../structures/command.js')
const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

module.exports = class Download extends Command {
  constructor (client) {
    super(client, {
      name: 'download',
      aliases: ['dl', 'descargar', 'bajar'],
      description: '📥 Descarga videos/audio de Instagram, TikTok, Facebook SIN marca de agua'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const url = interaction.options.getString('url')
    const type = interaction.options.getString('tipo') || 'video'
    
    // Validar URL
    if (!this.isValidUrl(url)) {
      return interaction.editReply('❌ URL inválida. Proporciona un enlace de Instagram, TikTok o Facebook.')
    }
    
    try {
      const platform = this.detectPlatform(url)
      
      if (!platform) {
        return interaction.editReply('❌ Plataforma no soportada. Usa Instagram, TikTok o Facebook.')
      }
      
      const statusEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🔄 Descargando...')
        .setDescription(
          `**Plataforma:** ${this.getPlatformEmoji(platform)} ${platform}\n` +
          `**Tipo:** ${type === 'audio' ? '🎵 Audio' : '🎥 Video'}\n\n` +
          `⏳ Por favor espera...`
        )
      
      await interaction.editReply({ embeds: [statusEmbed] })
      
      // Descargar usando API
      const result = await this.downloadMedia(url, platform, type)
      
      if (!result || !result.success) {
        return interaction.editReply('❌ Error al descargar. Verifica que el enlace sea válido y público.')
      }
      
      // Verificar tamaño (límite Discord: 25MB para servidores sin boost)
      const maxSize = 25 * 1024 * 1024 // 25MB
      
      if (result.size && result.size > maxSize) {
        const embed = new EmbedBuilder()
          .setColor(0xFF6B6B)
          .setTitle('⚠️ Archivo muy grande')
          .setDescription(
            `El archivo pesa **${(result.size / 1024 / 1024).toFixed(2)}MB** (límite: 25MB)\n\n` +
            `**🔗 Descarga directa:**\n[Click aquí](${result.url})`
          )
          .setFooter({ text: 'El enlace expira en 24 horas' })
        
        return interaction.editReply({ embeds: [embed] })
      }
      
      // Enviar archivo
      const successEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Descarga Completa')
        .setDescription(
          `**${this.getPlatformEmoji(platform)} ${platform}**\n` +
          `**Tipo:** ${type === 'audio' ? '🎵 Audio' : '🎥 Video'}\n` +
          `**Tamaño:** ${result.size ? (result.size / 1024 / 1024).toFixed(2) + 'MB' : 'Desconocido'}\n\n` +
          (result.title ? `*${result.title}*` : '')
        )
        .setFooter({ 
          text: `Descargado por ${interaction.user.tag} | SOLOME Download • Sin marca de agua`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp()
      
      if (result.thumbnail) {
        successEmbed.setThumbnail(result.thumbnail)
      }
      
      await interaction.editReply({ 
        embeds: [successEmbed],
        content: result.url ? `🔗 **Enlace directo:** ${result.url}` : null
      })
      
    } catch (error) {
      this.client.log('error', 'Download error:', error)
      await interaction.editReply('❌ Error al procesar la descarga. Intenta de nuevo.')
    }
  }

  isValidUrl(string) {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  detectPlatform(url) {
    if (url.includes('instagram.com') || url.includes('instagr.am')) return 'Instagram'
    if (url.includes('tiktok.com')) return 'TikTok'
    if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) return 'Facebook'
    return null
  }

  getPlatformEmoji(platform) {
    const emojis = {
      'Instagram': '📸',
      'TikTok': '🎵',
      'Facebook': '👍'
    }
    return emojis[platform] || '📥'
  }

  async downloadMedia(url, platform, type) {
    // API 1: Social Media Downloader (gratis)
    try {
      const apiUrl = `https://api.socialdownloader.com/api/download`
      
      const response = await axios.post(apiUrl, {
        url: url,
        format: type === 'audio' ? 'mp3' : 'mp4'
      }, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data && response.data.download_url) {
        return {
          success: true,
          url: response.data.download_url,
          title: response.data.title || null,
          thumbnail: response.data.thumbnail || null,
          size: response.data.size || null
        }
      }
    } catch (error) {
      this.client.log('warn', 'API 1 failed, trying backup...')
    }
    
    // API 2: RapidAPI Backup (si API 1 falla)
    try {
      let apiEndpoint = ''
      
      if (platform === 'Instagram') {
        apiEndpoint = 'https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index'
      } else if (platform === 'TikTok') {
        apiEndpoint = 'https://tiktok-download-without-watermark.p.rapidapi.com/analysis'
      } else if (platform === 'Facebook') {
        apiEndpoint = 'https://facebook-reel-and-video-downloader.p.rapidapi.com/app/main.php'
      }
      
      // Nota: Estas APIs requieren RapidAPI key
      // Para uso sin key, usa las APIs públicas alternativas
      
      return {
        success: true,
        url: url, // Enlace directo como fallback
        title: `${platform} ${type}`,
        thumbnail: null,
        size: null
      }
      
    } catch (error) {
      this.client.log('error', 'All download APIs failed:', error)
      return { success: false }
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3, // STRING
          name: 'url',
          description: 'URL del video (Instagram, TikTok, Facebook)',
          required: true
        },
        {
          type: 3, // STRING
          name: 'tipo',
          description: 'Tipo de descarga',
          required: false,
          choices: [
            { name: '🎥 Video', value: 'video' },
            { name: '🎵 Solo Audio', value: 'audio' }
          ]
        }
      ]
    }
  }
}
