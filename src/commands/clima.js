const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Clima extends Command {
  constructor (client) {
    super(client, {
      name: 'clima',
      aliases: ['weather', 'tiempo'],
      description: 'Muestra el clima actual de cualquier ciudad'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const ciudad = interaction.options.getString('ciudad')
    
    try {
      // Usar API gratuita de clima
      const response = await axios.get(`https://wttr.in/${encodeURIComponent(ciudad)}?format=j1`)
      const data = response.data
      
      const current = data.current_condition[0]
      const location = data.nearest_area[0]
      
      const embed = new EmbedBuilder()
        .setColor(0x00bcd4)
        .setTitle(`☀️ Clima en ${ciudad}`)
        .setDescription(
          `**${current.lang_es?.[0]?.value || current.weatherDesc[0].value}**\n` +
          `${location.areaName[0].value}, ${location.country[0].value}`
        )
        .addFields(
          { name: '🌡️ Temperatura', value: `${current.temp_C}°C / ${current.temp_F}°F`, inline: true },
          { name: '💧 Humedad', value: `${current.humidity}%`, inline: true },
          { name: '💨 Viento', value: `${current.windspeedKmph} km/h`, inline: true },
          { name: '🕶️ Sensación térmica', value: `${current.FeelsLikeC}°C`, inline: true },
          { name: '🌧️ Precipitación', value: `${current.precipMM} mm`, inline: true },
          { name: '👁️ Visibilidad', value: `${current.visibility} km`, inline: true }
        )
        .setThumbnail(`https:${current.weatherIconUrl[0].value}`)
        .setFooter({ text: 'Datos de wttr.in' })
        .setTimestamp()
      
      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ No se pudo obtener el clima de esa ciudad. Verifica el nombre.')
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'ciudad',
          description: 'Nombre de la ciudad',
          required: true
        }
      ]
    }
  }
}
