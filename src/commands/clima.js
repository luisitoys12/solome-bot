const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Clima extends Command {
  constructor (client) {
    super(client, {
      name: 'clima',
      aliases: ['weather', 'tiempo'],
      description: '⛅ Consulta el clima actual de cualquier ciudad'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const ciudad = interaction.options.getString('ciudad')
    const apiKey = process.env.WEATHER_API_KEY

    if (!apiKey) {
      return interaction.editReply('❌ No se ha configurado API key del clima. Contacta al administrador.')
    }

    try {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: ciudad,
          appid: apiKey,
          units: 'metric',
          lang: 'es'
        }
      })

      const data = response.data
      const temp = Math.round(data.main.temp)
      const feelsLike = Math.round(data.main.feels_like)
      const description = data.weather[0].description
      const icon = data.weather[0].icon

      const embed = new EmbedBuilder()
        .setColor(0x00aaff)
        .setTitle(`⛅ Clima en ${data.name}, ${data.sys.country}`)
        .setThumbnail(`https://openweathermap.org/img/wn/${icon}@2x.png`)
        .addFields(
          { name: '🌡️ Temperatura', value: `${temp}°C`, inline: true },
          { name: '🤔 Sensación', value: `${feelsLike}°C`, inline: true },
          { name: '💧 Humedad', value: `${data.main.humidity}%`, inline: true },
          { name: '🌬️ Viento', value: `${data.wind.speed} km/h`, inline: true },
          { name: '☁️ Condición', value: description, inline: true }
        )
        .setFooter({ text: 'Datos de OpenWeatherMap' })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      if (error.response?.status === 404) {
        await interaction.editReply(`❌ No se encontró la ciudad "${ciudad}". Verifica el nombre.`)
      } else {
        await interaction.editReply('❌ Error al obtener el clima. Intenta nuevamente.')
      }
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
