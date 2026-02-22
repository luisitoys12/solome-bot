const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Traducir extends Command {
  constructor (client) {
    super(client, {
      name: 'traducir',
      aliases: ['translate', 'tr'],
      description: 'Traduce texto entre diferentes idiomas'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const texto = interaction.options.getString('texto')
    const idioma = interaction.options.getString('idioma') || 'es'
    
    try {
      // Usar API de traducción gratuita
      const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
        params: {
          client: 'gtx',
          sl: 'auto',
          tl: idioma,
          dt: 't',
          q: texto
        }
      })
      
      const traduccion = response.data[0].map(item => item[0]).join('')
      const idiomaDetectado = response.data[2] || 'desconocido'
      
      const embed = new EmbedBuilder()
        .setColor(0x4285f4)
        .setTitle('🌍 Traducción')
        .addFields(
          { name: '📝 Original', value: texto.substring(0, 1024) },
          { name: '✅ Traducción', value: traduccion.substring(0, 1024) },
          { name: '🇲🇽 Idioma detectado', value: idiomaDetectado, inline: true },
          { name: '🎯 Idioma destino', value: idioma, inline: true }
        )
        .setFooter({ text: 'Powered by Google Translate' })
        .setTimestamp()
      
      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al traducir el texto.')
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
