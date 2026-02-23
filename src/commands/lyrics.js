const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Lyrics extends Command {
  constructor (client) {
    super(client, {
      name: 'lyrics',
      aliases: ['letra', 'letras'],
      description: '📝 Obtiene la letra de una canción'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    let query = interaction.options.getString('cancion')
    
    // Si no se especifica canción, usar la que está sonando
    if (!query) {
      const player = this.client.manager?.players.get(interaction.guild.id)
      if (!player || !player.queue.current) {
        return interaction.editReply('❌ No hay música reproduciéndose. Especifica el nombre de la canción.')
      }
      query = `${player.queue.current.author} ${player.queue.current.title}`
    }
    
    try {
      // Intentar con API de Genius (más precisa)
      let lyrics = await this.getLyricsFromGenius(query)
      
      // Si falla, intentar con API alternativa
      if (!lyrics) {
        lyrics = await this.getLyricsFromLyrics(query)
      }
      
      if (!lyrics) {
        return interaction.editReply(`❌ No se encontraron letras para: **${query}**`)
      }
      
      // Dividir letras en chunks si es muy largo
      const chunks = this.splitLyrics(lyrics, 4000)
      
      for (let i = 0; i < chunks.length; i++) {
        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(i === 0 ? `📝 Letras: ${query}` : `📝 Letras (continuación ${i + 1})`)
          .setDescription(chunks[i])
          .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
          .setTimestamp()
        
        if (i === 0) {
          await interaction.editReply({ embeds: [embed] })
        } else {
          await interaction.followUp({ embeds: [embed] })
        }
      }
      
    } catch (error) {
      this.client.log('error', 'Lyrics error:', error)
      await interaction.editReply('❌ Error al obtener las letras. Intenta con otro nombre.')
    }
  }

  async getLyricsFromGenius(query) {
    try {
      // API gratuita de Genius (sin API key)
      const response = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`)
      
      if (response.data && response.data.lyrics) {
        return response.data.lyrics
      }
    } catch (error) {
      return null
    }
    return null
  }

  async getLyricsFromLyrics(query) {
    try {
      // API alternativa gratuita
      const [artist, ...titleParts] = query.split(' ')
      const title = titleParts.join(' ')
      
      const response = await axios.get(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      )
      
      if (response.data && response.data.lyrics) {
        return response.data.lyrics
      }
    } catch (error) {
      return null
    }
    return null
  }

  splitLyrics(lyrics, maxLength) {
    const chunks = []
    const lines = lyrics.split('\n')
    let currentChunk = ''
    
    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > maxLength) {
        chunks.push(currentChunk)
        currentChunk = line
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk)
    }
    
    return chunks
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3, // STRING
          name: 'cancion',
          description: 'Nombre de la canción (deja vacío para usar la canción actual)',
          required: false
        }
      ]
    }
  }
}
