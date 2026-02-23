const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Ruleta extends Command {
  constructor (client) {
    super(client, {
      name: 'ruleta',
      aliases: ['roulette'],
      description: '🎰 Juega a la ruleta y apuesta tus monedas'
    })
  }

  async runSlash (interaction) {
    const economy = load('economy', {})
    const userId = interaction.user.id
    const apuesta = interaction.options.getInteger('apuesta')
    const color = interaction.options.getString('color')

    if (!economy[userId] || economy[userId] < apuesta) {
      return interaction.reply({ content: '❌ No tienes suficientes monedas', ephemeral: true })
    }

    const numeros = {
      rojo: [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],
      negro: [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35],
      verde: [0]
    }

    const resultado = Math.floor(Math.random() * 37)
    let colorGanador = 'verde'
    if (numeros.rojo.includes(resultado)) colorGanador = 'rojo'
    if (numeros.negro.includes(resultado)) colorGanador = 'negro'

    const multiplicadores = { rojo: 2, negro: 2, verde: 35 }
    const gano = color === colorGanador
    const ganancia = gano ? apuesta * multiplicadores[color] : -apuesta

    economy[userId] += ganancia
    save('economy', economy)

    const embed = new EmbedBuilder()
      .setColor(gano ? 0x00ff00 : 0xff0000)
      .setTitle('🎰 Ruleta')
      .setDescription(
        `Número: **${resultado}** (${colorGanador})\n` +
        `Apostaste: **${apuesta}** a ${color}\n\n` +
        (gano ? `✅ ¡Ganaste **${ganancia}** monedas!` : `❌ Perdiste **${apuesta}** monedas`) +
        `\n\nBalance: **${economy[userId]}** monedas`
      )

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 4, name: 'apuesta', description: 'Cantidad a apostar', required: true, min_value: 10, max_value: 10000 },
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
