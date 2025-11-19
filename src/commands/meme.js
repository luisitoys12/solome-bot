const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Meme extends Command {
  constructor (client) {
    super(client, {
      name: 'meme',
      description: 'Muestra un meme aleatorio'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()

    try {
      const response = await axios.get('https://meme-api.com/gimme')
      const meme = response.data

      const embed = new EmbedBuilder()
        .setColor(0xff6b6b)
        .setTitle(meme.title)
        .setImage(meme.url)
        .setFooter({ text: `👍 ${meme.ups} | r/${meme.subreddit}` })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al obtener el meme.')
    }
  }
}
