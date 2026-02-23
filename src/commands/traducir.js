const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Traducir extends Command {
  constructor (client) {
    super(client, {
      name: 'traducir',
      aliases: ['translate'],
      description: '🌍 Traduce texto a múltiples idiomas usando Google Translate'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const texto = interaction.options.getString('texto')
    const idioma = interaction.options.getString('idioma') || 'es'

    try {
      // API de traducción libre (alternativa a Google)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${idioma}&dt=t&q=${encodeURIComponent(texto)}`
      
      const response = await axios.get(url)
      const traduccion = response.data[0][0][0]

      const embed = new EmbedBuilder()
        .setColor(0x4285f4)
        .setTitle('🌍 Traducción')
        .addFields(
          { name: '📝 Original', value: texto.substring(0, 1024), inline: false },
          { name: '✅ Traducción', value: traduccion.substring(0, 1024), inline: false },
          { name: '🌐 Idioma', value: idioma.toUpperCase(), inline: true }
        )

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al traducir. Intenta nuevamente.')
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'texto',
          description: 'Texto a traducir',
          required: true
        },
        {
          type: 3,
          name: 'idioma',
          description: 'Idioma destino',
          required: false,
          choices: [
            { name: 'Español', value: 'es' },
            { name: 'English', value: 'en' },
            { name: 'Français', value: 'fr' },
            { name: 'Deutsch', value: 'de' },
            { name: 'Italiano', value: 'it' },
            { name: 'Português', value: 'pt' },
            { name: '日本語', value: 'ja' },
            { name: '한국어', value: 'ko' },
            { name: '中文', value: 'zh' },
            { name: 'Русский', value: 'ru' }
          ]
        }
      ]
    }
  }
}
