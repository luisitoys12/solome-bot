const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = class Clima extends Command {
  constructor (client) {
    super(client, {
      name: 'clima',
      aliases: ['weather', 'tiempo'],
      description: '🌤️ Consulta el clima actual de cualquier ciudad'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    const ciudad = interaction.options.getString('ciudad')

    try {
      // Usar API gratuita de Open-Meteo (no requiere API key)
      const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es`)
      
      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        return interaction.editReply('❌ Ciudad no encontrada')
      }

      const location = geoResponse.data.results[0]
      const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&timezone=auto`)
      
      const weather = weatherResponse.data.current_weather

      const embed = new EmbedBuilder()
        .setColor(0x00bfff)
        .setTitle(`🌤️ Clima en ${location.name}`)
        .addFields(
          { name: '🌡️ Temperatura', value: `${weather.temperature}°C`, inline: true },
          { name: '💨 Viento', value: `${weather.windspeed} km/h`, inline: true },
          { name: '📍 Ubicación', value: `${location.country || 'N/A'}`, inline: true }
        )
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al obtener el clima')
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 3, name: 'ciudad', description: 'Nombre de la ciudad', required: true }
      ]
    }
  }
}
