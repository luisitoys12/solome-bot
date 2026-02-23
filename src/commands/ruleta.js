const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Ruleta extends Command {
  constructor (client) {
    super(client, {
      name: 'ruleta',
      aliases: ['roulette'],
      description: '🎰 Juega a la ruleta y apuesta por rojo, negro o verde'
    })
  }

  async runSlash (interaction) {
    const apuesta = interaction.options.getInteger('apuesta')
    const color = interaction.options.getString('color')

    const economy = load('economy', {})
    const userData = economy[interaction.user.id] || { balance: 0 }

    if (userData.balance < apuesta) {
      return interaction.reply({ content: '❌ No tienes suficiente dinero!', ephemeral: true })
    }

    const numero = Math.floor(Math.random() * 37)
    let resultado
    
    if (numero === 0) {
      resultado = 'verde'
    } else if (numero % 2 === 0) {
      resultado = 'rojo'
    } else {
      resultado = 'negro'
    }

    let ganancia = 0
    
    if (color === resultado) {
      if (color === 'verde') {
        ganancia = apuesta * 35
      } else {
        ganancia = apuesta * 2
      }
    } else {
      ganancia = -apuesta
    }

    userData.balance += ganancia
    economy[interaction.user.id] = userData
    save('economy', economy)

    const colorEmoji = { rojo: '🔴', negro: '⚫', verde: '🟢' }

    const embed = new EmbedBuilder()
      .setColor(ganancia > 0 ? 0x00ff00 : 0xff0000)
      .setTitle('🎰 Ruleta')
      .addFields(
        { name: 'Número', value: `${numero} ${colorEmoji[resultado]}`, inline: true },
        { name: 'Resultado', value: ganancia > 0 ? '✅ ¡Ganaste!' : '❌ Perdiste', inline: true },
        { name: 'Balance', value: `$${userData.balance}`, inline: false }
      )

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
