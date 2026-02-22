const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Ruleta extends Command {
  constructor (client) {
    super(client, {
      name: 'ruleta',
      aliases: ['roulette'],
      description: '🎰 Juega a la ruleta y apuesta tus monedas'
    })
  }

  async runSlash (interaction) {
    const apuesta = interaction.options.getInteger('apuesta')
    const color = interaction.options.getString('color')
    
    // Simular ruleta
    const numeros = Array.from({ length: 37 }, (_, i) => i)
    const resultado = numeros[Math.floor(Math.random() * numeros.length)]
    
    let colorResultado = 'verde'
    if (resultado !== 0) {
      const rojos = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
      colorResultado = rojos.includes(resultado) ? 'rojo' : 'negro'
    }
    
    const gano = (color === 'verde' && resultado === 0) ||
                 (color === 'rojo' && colorResultado === 'rojo') ||
                 (color === 'negro' && colorResultado === 'negro')
    
    const multiplicador = color === 'verde' ? 35 : 2
    const ganancia = gano ? apuesta * multiplicador : -apuesta
    
    const embed = new EmbedBuilder()
      .setColor(gano ? 0x00ff00 : 0xff0000)
      .setTitle('🎰 Ruleta')
      .setDescription(`La ruleta ha caído en:\n\n**${resultado}** ${colorResultado.toUpperCase()}`)
      .addFields(
        { name: '🎲 Tu apuesta', value: `${color} - $${apuesta}`, inline: true },
        { name: gano ? '🎉 Ganaste' : '😢 Perdiste', value: gano ? `$${ganancia}` : `-$${Math.abs(ganancia)}`, inline: true },
        { name: '📊 Multiplicador', value: `x${multiplicador}`, inline: true }
      )
      .setFooter({ text: gano ? '¡Felicidades!' : 'Buena suerte la próxima vez' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 4,
          name: 'apuesta',
          description: 'Cantidad a apostar',
          required: true,
          min_value: 10,
          max_value: 10000
        },
        {
          type: 3,
          name: 'color',
          description: 'Color al que apostar',
          required: true,
          choices: [
            { name: '🔴 Rojo (x2)', value: 'rojo' },
            { name: '⚫ Negro (x2)', value: 'negro' },
            { name: '🟢 Verde/0 (x35)', value: 'verde' }
          ]
        }
      ]
    }
  }
}
