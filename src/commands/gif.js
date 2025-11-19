const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Gif extends Command {
  constructor (client) {
    super(client, {
      name: 'gif',
      description: 'Busca un GIF'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()

    const query = interaction.options.getString('busqueda')

    try {
      // Usando Tenor API (requiere API key en producción)
      const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
        params: {
          api_key: 'dc6zaTOxFJmzC', // API key pública de demo
          q: query,
          limit: 1,
          rating: 'pg-13'
        }
      })

      if (!response.data.data || response.data.data.length === 0) {
        return interaction.editReply('❌ No se encontraron GIFs.')
      }

      const gif = response.data.data[0]

      const embed = new EmbedBuilder()
        .setColor(0x00ff99)
        .setTitle(`GIF: ${query}`)
        .setImage(gif.images.original.url)
        .setFooter({ text: 'Powered by Giphy' })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al buscar el GIF.')
    }
  }
}
