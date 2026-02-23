const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Traducir extends Command {
  constructor (client) {
    super(client, {
      name: 'traducir',
      aliases: ['translate', 'tr'],
      description: '🌎 Traduce texto entre múltiples idiomas'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const texto = interaction.options.getString('texto')
    const idioma = interaction.options.getString('idioma') || 'en'

    try {
      // Usar API gratuita de traducción (MyMemory)
      const response = await axios.get('https://api.mymemory.translated.net/get', {
        params: {
          q: texto,
          langpair: `auto|${idioma}`
        }
      })

      const traduccion = response.data.responseData.translatedText

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🌎 Traducción')
        .addFields(
          { name: '📝 Original', value: texto.substring(0, 1024) },
          { name: '💬 Traducido', value: traduccion.substring(0, 1024) }
        )
        .setFooter({ text: `Idioma destino: ${idioma}` })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al traducir')
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 3, name: 'texto', description: 'Texto a traducir', required: true },
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
