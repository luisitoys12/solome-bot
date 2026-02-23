const Command = require('../structures/command.js')
const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const ytdl = require('ytdl-core')
const fs = require('fs')
const path = require('path')

module.exports = class Download extends Command {
  constructor (client) {
    super(client, {
      name: 'download',
      aliases: ['dl', 'descargar'],
      description: '📥 Descarga videos o audio de YouTube (uso personal, no comercial)'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const url = interaction.options.getString('url')
    const formato = interaction.options.getString('formato') || 'audio'
    
    // Validar URL de YouTube
    if (!ytdl.validateURL(url)) {
      return interaction.editReply('❌ URL de YouTube inválida. Usa un enlace válido de youtube.com o youtu.be')
    }

    try {
      // Obtener info del video
      const info = await ytdl.getInfo(url)
      const videoTitle = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)
      const duration = parseInt(info.videoDetails.lengthSeconds)
      
      // Limitar duración (10 minutos máximo para no saturar)
      if (duration > 600) {
        return interaction.editReply('❌ El video es muy largo. Máximo 10 minutos permitido.')
      }

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('📥 Descargando...')
        .setDescription(`**${info.videoDetails.title}**`)
        .addFields(
          { name: '👤 Canal', value: info.videoDetails.author.name, inline: true },
          { name: '⏱️ Duración', value: this.formatDuration(duration), inline: true },
          { name: '💾 Formato', value: formato === 'audio' ? '🎵 Audio MP3' : '🎥 Video MP4', inline: true }
        )
        .setThumbnail(info.videoDetails.thumbnails[0]?.url)
        .setFooter({ text: 'Descarga para uso personal • No uso comercial' })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })

      // Crear directorio temporal
      const tempDir = path.join(__dirname, '../../temp')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const fileName = `${videoTitle}.${formato === 'audio' ? 'mp3' : 'mp4'}`
      const filePath = path.join(tempDir, fileName)

      // Descargar
      const stream = ytdl(url, {
        quality: formato === 'audio' ? 'highestaudio' : 'highest',
        filter: formato === 'audio' ? 'audioonly' : 'audioandvideo'
      })

      const writeStream = fs.createWriteStream(filePath)
      stream.pipe(writeStream)

      writeStream.on('finish', async () => {
        const fileSize = fs.statSync(filePath).size
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)

        // Discord tiene límite de 25MB para bots normales
        if (fileSize > 25 * 1024 * 1024) {
          fs.unlinkSync(filePath)
          return interaction.editReply({
            content: `❌ El archivo es muy grande (${fileSizeMB}MB). Máximo 25MB.`,
            embeds: []
          })
        }

        try {
          const attachment = new AttachmentBuilder(filePath, { name: fileName })
          
          const successEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('✅ Descarga Completada')
            .setDescription(`**${info.videoDetails.title}**`)
            .addFields(
              { name: '💾 Tamaño', value: `${fileSizeMB} MB`, inline: true },
              { name: '📁 Archivo', value: fileName, inline: true }
            )
            .setFooter({ 
              text: '⚠️ Solo para uso personal • Respeta los derechos de autor',
              iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp()

          await interaction.editReply({ 
            embeds: [successEmbed],
            files: [attachment]
          })

          // Limpiar archivo temporal después de 5 segundos
          setTimeout(() => {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
            }
          }, 5000)

        } catch (error) {
          this.client.log('error', 'Error enviando archivo:', error)
          fs.unlinkSync(filePath)
          await interaction.editReply({
            content: '❌ Error al enviar el archivo. Puede ser muy grande.',
            embeds: []
          })
        }
      })

      writeStream.on('error', async (error) => {
        this.client.log('error', 'Error descargando:', error)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        await interaction.editReply({
          content: '❌ Error al descargar el archivo.',
          embeds: []
        })
      })

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al procesar la URL. Verifica que sea un video público.')
    }
  }

  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'url',
          description: 'URL del video de YouTube',
          required: true
        },
        {
          type: 3,
          name: 'formato',
          description: 'Formato de descarga',
          required: false,
          choices: [
            { name: '🎵 Audio (MP3)', value: 'audio' },
            { name: '🎥 Video (MP4)', value: 'video' }
          ]
        }
      ]
    }
  }
}
