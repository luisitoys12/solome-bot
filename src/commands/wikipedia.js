const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Wikipedia extends Command {
  constructor (client) {
    super(client, {
      name: 'wikipedia',
      aliases: ['wiki'],
      description: 'Search Wikipedia for information'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const query = interaction.options.getString('query')
    const lang = interaction.options.getString('language') || 'es'

    try {
      // Search Wikipedia
      const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=1`
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'BabaRadioBot/3.0 (Discord Bot; https://github.com/perronosaurio/baba-radio)'
        }
      })
      
      if (!searchResponse.data.query.search.length) {
        return interaction.editReply('❌ No se encontraron resultados en Wikipedia.')
      }

      const pageTitle = searchResponse.data.query.search[0].title
      const pageId = searchResponse.data.query.search[0].pageid

      // Get page content
      const contentUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro&explaintext&pageids=${pageId}&format=json&pithumbsize=500`
      const contentResponse = await axios.get(contentUrl, {
        headers: {
          'User-Agent': 'BabaRadioBot/3.0 (Discord Bot; https://github.com/perronosaurio/baba-radio)'
        }
      })
      
      const page = contentResponse.data.query.pages[pageId]
      let extract = page.extract || 'No hay descripción disponible.'
      
      // Limit extract to 500 characters
      if (extract.length > 500) {
        extract = extract.substring(0, 497) + '...'
      }

      const pageUrl = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`

      const embed = new EmbedBuilder()
        .setColor(0xffffff)
        .setTitle(`📖 ${pageTitle}`)
        .setDescription(extract)
        .setURL(pageUrl)
        .setFooter({ text: `Wikipedia (${lang.toUpperCase()})` })
        .setTimestamp()

      if (page.thumbnail) {
        embed.setThumbnail(page.thumbnail.source)
      }

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al buscar en Wikipedia.')
    }
  }
}
