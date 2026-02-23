const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const axios = require('axios')

// RSS Feeds predeterminados de medios mexicanos e internacionales
const RSS_FEEDS = {
  general: [
    { name: 'El Universal', url: 'https://www.eluniversal.com.mx/rss.xml', emoji: '📰' },
    { name: 'Milenio', url: 'https://www.milenio.com/rss/portada', emoji: '📰' },
    { name: 'CNN Español', url: 'http://cnnespanol.cnn.com/feed/', emoji: '🌎' },
    { name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml', emoji: '🌍' }
  ],
  espectaculo: [
    { name: 'Quien', url: 'https://www.quien.com/feed/', emoji: '🎬' },
    { name: 'People en Español', url: 'https://peopleenespanol.com/feed/', emoji: '⭐' },
    { name: 'TV Notas', url: 'https://tvnotas.com.mx/feed/', emoji: '📺' },
    { name: 'El Universal - Espectáculos', url: 'https://www.eluniversal.com.mx/rss/espectaculos.xml', emoji: '🎭' }
  ],
  deportes: [
    { name: 'ESPN Deportes', url: 'https://www.espn.com.mx/espndeportes/rss', emoji: '⚽' },
    { name: 'Recórd', url: 'https://www.record.com.mx/rss/portada', emoji: '🏆' },
    { name: 'TUDN', url: 'https://www.tudn.mx/rss/futbol', emoji: '📺' },
    { name: 'Marca', url: 'https://e00-marca.uecdn.es/rss/portada.xml', emoji: '🏟️' }
  ],
  tecnologia: [
    { name: 'Xataka', url: 'https://www.xataka.com/index.xml', emoji: '📱' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', emoji: '💻' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', emoji: '🔌' },
    { name: 'Gizmodo', url: 'https://es.gizmodo.com/rss', emoji: '🤖' }
  ],
  seguridad: [
    { name: 'Animal Político', url: 'https://www.animalpolitico.com/feed/', emoji: '🚨' },
    { name: 'Proceso', url: 'https://www.proceso.com.mx/feed', emoji: '📰' },
    { name: 'Infobae', url: 'https://www.infobae.com/feeds/rss/', emoji: '⚠️' },
    { name: 'Aristegui Noticias', url: 'https://aristeguinoticias.com/feed/', emoji: '📡' }
  ],
  economia: [
    { name: 'El Economista', url: 'https://www.eleconomista.com.mx/rss/economia.xml', emoji: '💰' },
    { name: 'Forbes México', url: 'https://www.forbes.com.mx/feed/', emoji: '💸' },
    { name: 'Bloomberg en Español', url: 'https://www.bloomberg.com/feeds/bview-es.xml', emoji: '📈' },
    { name: 'Expansión', url: 'https://expansion.mx/rss', emoji: '🏦' }
  ],
  internacional: [
    { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', emoji: '🌎' },
    { name: 'Reuters', url: 'https://www.reutersagency.com/feed/', emoji: '🌐' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', emoji: '📡' },
    { name: 'France 24', url: 'https://www.france24.com/es/rss', emoji: '🇫🇷' }
  ]
}

module.exports = class Noticias extends Command {
  constructor (client) {
    super(client, {
      name: 'noticias',
      aliases: ['news', 'rss'],
      description: '📰 Obtén las últimas noticias de medios mexicanos e internacionales'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const categoria = interaction.options.getString('categoria') || 'general'
    const cantidad = interaction.options.getInteger('cantidad') || 5
    
    const feeds = RSS_FEEDS[categoria]
    
    if (!feeds) {
      return interaction.editReply('❌ Categoría no válida.')
    }

    try {
      const allNews = []
      
      // Obtener noticias de todos los feeds de la categoría
      for (const feed of feeds) {
        try {
          const response = await axios.get(feed.url, { 
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; BabaRadio/4.0)'
            }
          })
          
          // Parsear RSS (básico)
          const items = this.parseRSS(response.data)
          
          items.slice(0, 2).forEach(item => {
            allNews.push({
              ...item,
              source: feed.name,
              emoji: feed.emoji
            })
          })
        } catch (error) {
          this.client.log('warn', `Error obteniendo ${feed.name}:`, error.message)
        }
      }

      if (allNews.length === 0) {
        return interaction.editReply('❌ No se pudieron obtener noticias en este momento. Intenta más tarde.')
      }

      // Ordenar por fecha (más recientes primero)
      allNews.sort((a, b) => b.date - a.date)
      
      // Tomar solo la cantidad solicitada
      const news = allNews.slice(0, cantidad)

      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle(`📰 Noticias - ${this.getCategoryName(categoria)}`)
        .setDescription(
          `Últimas ${news.length} noticias de múltiples fuentes\n` +
          `📅 Actualización: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`
        )
        .setFooter({ text: `Fuentes: ${feeds.map(f => f.name).join(', ')}` })
        .setTimestamp()

      // Añadir noticias como fields
      news.forEach((item, index) => {
        const title = item.title.substring(0, 100)
        const description = item.description ? item.description.substring(0, 150) + '...' : 'Sin descripción'
        const timeAgo = this.getTimeAgo(item.date)
        
        embed.addFields({
          name: `${item.emoji} ${title}`,
          value: `${description}\n📄 **${item.source}** • 🕒 ${timeAgo}\n🔗 [Leer más](${item.link})`,
          inline: false
        })
      })

      // Botones para otras categorías
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('General')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📰')
            .setCustomId('news_general'),
          new ButtonBuilder()
            .setLabel('Deportes')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⚽')
            .setCustomId('news_deportes'),
          new ButtonBuilder()
            .setLabel('Espectáculos')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🎬')
            .setCustomId('news_espectaculo'),
          new ButtonBuilder()
            .setLabel('Tecnología')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📱')
            .setCustomId('news_tecnologia')
        )

      await interaction.editReply({ embeds: [embed], components: [row] })

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al obtener noticias. Intenta nuevamente.')
    }
  }

  parseRSS(xml) {
    const items = []
    
    // Regex básico para parsear RSS
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
    const titleRegex = /<title><!\[CDATA\[([^\]]+)\]\]><\/title>|<title>([^<]+)<\/title>/
    const linkRegex = /<link>([^<]+)<\/link>/
    const descRegex = /<description><!\[CDATA\[([^\]]+)\]\]><\/description>|<description>([^<]+)<\/description>/
    const dateRegex = /<pubDate>([^<]+)<\/pubDate>|<published>([^<]+)<\/published>/
    
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]
      
      const titleMatch = itemXml.match(titleRegex)
      const linkMatch = itemXml.match(linkRegex)
      const descMatch = itemXml.match(descRegex)
      const dateMatch = itemXml.match(dateRegex)
      
      if (titleMatch && linkMatch) {
        items.push({
          title: this.cleanText(titleMatch[1] || titleMatch[2] || 'Sin título'),
          link: linkMatch[1],
          description: this.cleanText(descMatch ? (descMatch[1] || descMatch[2]) : ''),
          date: dateMatch ? new Date(dateMatch[1] || dateMatch[2]) : new Date()
        })
      }
    }
    
    return items
  }

  cleanText(text) {
    return text
      .replace(/<[^>]+>/g, '') // Eliminar HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }

  getCategoryName(cat) {
    const names = {
      general: '📰 Noticias Generales',
      espectaculo: '🎬 Espectáculos & Celebridades',
      deportes: '⚽ Deportes',
      tecnologia: '📱 Tecnología',
      seguridad: '🚨 Seguridad & Política',
      economia: '💰 Economía & Finanzas',
      internacional: '🌎 Internacional'
    }
    return names[cat] || cat
  }

  getTimeAgo(date) {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffMins > 0) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    return 'Hace un momento'
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'categoria',
          description: 'Categoría de noticias',
          required: false,
          choices: [
            { name: '📰 Noticias Generales', value: 'general' },
            { name: '🎬 Espectáculos', value: 'espectaculo' },
            { name: '⚽ Deportes', value: 'deportes' },
            { name: '📱 Tecnología', value: 'tecnologia' },
            { name: '🚨 Seguridad', value: 'seguridad' },
            { name: '💰 Economía', value: 'economia' },
            { name: '🌎 Internacional', value: 'internacional' }
          ]
        },
        {
          type: 4,
          name: 'cantidad',
          description: 'Número de noticias a mostrar (1-10)',
          required: false,
          min_value: 1,
          max_value: 10
        }
      ]
    }
  }
}
