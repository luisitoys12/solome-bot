const Command = require('../structures/command.js')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const axios = require('axios')

const NEWS_API_KEY = process.env.NEWS_API_KEY || null

const RSS_FEEDS = {
  general: [
    { name: 'CNN Español', url: 'https://cnnespanol.cnn.com/feed/', emoji: '🌎' },
    { name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml', emoji: '🌍' },
    { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', emoji: '📰' }
  ],
  tecnologia: [
    { name: 'Xataka', url: 'https://www.xataka.com/index.xml', emoji: '📱' },
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', emoji: '💻' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', emoji: '🔌' }
  ],
  deportes: [
    { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', emoji: '⚽' },
    { name: 'Marca', url: 'https://e00-marca.uecdn.es/rss/portada.xml', emoji: '🏆' }
  ],
  entretenimiento: [
    { name: 'Variety', url: 'https://variety.com/feed/', emoji: '🎬' },
    { name: 'Billboard', url: 'https://www.billboard.com/feed/', emoji: '🎵' }
  ]
}

module.exports = class Noticias extends Command {
  constructor (client) {
    super(client, {
      name: 'noticias',
      aliases: ['news', 'rss'],
      description: '📰 Obtén las últimas noticias de fuentes confiables'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const categoria = interaction.options.getString('categoria') || 'general'
    const cantidad = interaction.options.getInteger('cantidad') || 5
    
    try {
      let noticias = []
      
      if (NEWS_API_KEY) {
        noticias = await this.fetchNewsAPI(categoria, cantidad)
      }
      
      if (noticias.length === 0) {
        noticias = await this.fetchRSS(categoria, cantidad)
      }
      
      if (noticias.length === 0) {
        // ❌ Mensaje amigable sin detalles técnicos
        return interaction.editReply(
          '❌ No pudimos obtener noticias en este momento.\n\n' +
          '🔄 **Intenta de nuevo en unos minutos.**\n' +
          'Las fuentes de noticias pueden estar temporalmente no disponibles.'
        )
      }

      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle(`📰 Noticias - ${this.getCategoryName(categoria)}`)
        .setDescription(
          `📅 ${noticias.length} noticias encontradas\n` +
          `🕐 Actualización: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`
        )
        .setFooter({ text: 'EstacionKusTV • SOLOME Bot' })
        .setTimestamp()

      noticias.forEach((noticia, index) => {
        const numero = index + 1
        embed.addFields({
          name: `${noticia.emoji} ${numero}. ${noticia.title.substring(0, 100)}`,
          value: (
            `${noticia.description.substring(0, 150)}...\n` +
            `📝 **${noticia.source}** • 🕗 ${noticia.timeAgo}\n` +
            `[Leer más](${noticia.url})`
          ),
          inline: false
        })
      })

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      this.client.log('error', 'Error en noticias:', error)
      
      // ❌ Mensaje amigable sin stack trace
      await interaction.editReply(
        '❌ Error al cargar noticias.\n\n' +
        '🔄 Inténtalo de nuevo en unos momentos.'
      )
    }
  }

  async fetchNewsAPI(categoria, cantidad) {
    try {
      const categoryMap = {
        general: 'general',
        tecnologia: 'technology',
        deportes: 'sports',
        entretenimiento: 'entertainment'
      }
      
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          apiKey: NEWS_API_KEY,
          category: categoryMap[categoria] || 'general',
          language: 'es',
          pageSize: cantidad
        },
        timeout: 10000
      })
      
      return response.data.articles.map(article => ({
        title: article.title,
        description: article.description || 'Sin descripción',
        url: article.url,
        source: article.source.name,
        date: new Date(article.publishedAt),
        timeAgo: this.getTimeAgo(new Date(article.publishedAt)),
        emoji: this.getEmoji(categoria)
      }))
    } catch (error) {
      this.client.log('warn', 'NewsAPI falló, usando RSS')
      return []
    }
  }

  async fetchRSS(categoria, cantidad) {
    const feeds = RSS_FEEDS[categoria] || RSS_FEEDS.general
    const allNews = []
    
    for (const feed of feeds) {
      try {
        const response = await axios.get(feed.url, {
          timeout: 8000,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SolomeBot/4.0)' }
        })
        
        const items = this.parseRSS(response.data)
        
        items.slice(0, 3).forEach(item => {
          allNews.push({
            ...item,
            source: feed.name,
            emoji: feed.emoji,
            timeAgo: this.getTimeAgo(item.date)
          })
        })
        
        if (allNews.length >= cantidad) break
        
      } catch (error) {
        this.client.log('warn', `❌ ${feed.name} falló: ${error.message}`)
        continue
      }
    }
    
    return allNews
      .sort((a, b) => b.date - a.date)
      .slice(0, cantidad)
  }

  parseRSS(xml) {
    const items = []
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/g
    const titleRegex = /<title><!\[CDATA\[([^\]]+)\]\]><\/title>|<title>([^<]+)<\/title>/
    const linkRegex = /<link[^>]*>([^<]+)<\/link>|<link[^>]*href=["']([^"']+)["']/
    const descRegex = /<description><!\[CDATA\[([^\]]+)\]\]><\/description>|<description>([^<]+)<\/description>|<summary>([^<]+)<\/summary>/
    const dateRegex = /<pubDate>([^<]+)<\/pubDate>|<published>([^<]+)<\/published>|<updated>([^<]+)<\/updated>/
    
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1] || match[2]
      
      const titleMatch = itemXml.match(titleRegex)
      const linkMatch = itemXml.match(linkRegex)
      const descMatch = itemXml.match(descRegex)
      const dateMatch = itemXml.match(dateRegex)
      
      if (titleMatch && linkMatch) {
        const title = this.cleanText(titleMatch[1] || titleMatch[2] || 'Sin título')
        const url = linkMatch[1] || linkMatch[2]
        const description = this.cleanText(descMatch ? (descMatch[1] || descMatch[2] || descMatch[3] || '') : '')
        const date = dateMatch ? new Date(dateMatch[1] || dateMatch[2] || dateMatch[3]) : new Date()
        
        if (title && title.length > 5 && url) {
          items.push({ title, url, description, date })
        }
      }
    }
    
    return items
  }

  cleanText(text) {
    if (!text) return ''
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  getCategoryName(cat) {
    const names = {
      general: '📰 Noticias Generales',
      tecnologia: '📱 Tecnología',
      deportes: '⚽ Deportes',
      entretenimiento: '🎬 Entretenimiento'
    }
    return names[cat] || cat
  }

  getEmoji(cat) {
    const emojis = {
      general: '📰',
      tecnologia: '📱',
      deportes: '⚽',
      entretenimiento: '🎬'
    }
    return emojis[cat] || '📰'
  }

  getTimeAgo(date) {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `Hace ${diffDays}d`
    if (diffHours > 0) return `Hace ${diffHours}h`
    if (diffMins > 0) return `Hace ${diffMins}m`
    return 'Ahora'
  }

  getSlashCommandData() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(opt =>
        opt
          .setName('categoria')
          .setDescription('Categoría de noticias')
          .setRequired(false)
          .addChoices(
            { name: '📰 Generales', value: 'general' },
            { name: '📱 Tecnología', value: 'tecnologia' },
            { name: '⚽ Deportes', value: 'deportes' },
            { name: '🎬 Entretenimiento', value: 'entretenimiento' }
          )
      )
      .addIntegerOption(opt =>
        opt
          .setName('cantidad')
          .setDescription('Número de noticias (1-10)')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(10)
      )
  }
}
