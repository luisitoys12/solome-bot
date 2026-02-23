const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Slots extends Command {
  constructor (client) {
    super(client, {
      name: 'slots',
      aliases: ['slot', 'tragamonedas'],
      description: '🎰 Juega a la máquina tragamonedas'
    })
  }

  async runSlash (interaction) {
    const economy = load('economy', {})
    const userId = interaction.user.id
    const apuesta = interaction.options.getInteger('apuesta')

    if (!economy[userId] || economy[userId] < apuesta) {
      return interaction.reply({ content: '❌ No tienes suficientes monedas', ephemeral: true })
    }

    const simbolos = ['🍒', '🍋', '🔔', '💎', '⭐', '💰']
    const slot1 = simbolos[Math.floor(Math.random() * simbolos.length)]
    const slot2 = simbolos[Math.floor(Math.random() * simbolos.length)]
    const slot3 = simbolos[Math.floor(Math.random() * simbolos.length)]

    let multiplicador = 0
    if (slot1 === slot2 && slot2 === slot3) multiplicador = 5
    else if (slot1 === slot2 || slot2 === slot3) multiplicador = 2

    const ganancia = multiplicador > 0 ? apuesta * multiplicador - apuesta : -apuesta
    economy[userId] += ganancia
    save('economy', economy)

    const embed = new EmbedBuilder()
      .setColor(ganancia > 0 ? 0x00ff00 : 0xff0000)
      .setTitle('🎰 Tragamonedas')
      .setDescription(
        `${slot1} | ${slot2} | ${slot3}\n\n` +
        (ganancia > 0 ? `✅ ¡Ganaste **${ganancia}** monedas!` : `❌ Perdiste **${apuesta}** monedas`) +
        `\n\nBalance: **${economy[userId]}** monedas`
      )

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 4, name: 'apuesta', description: 'Cantidad a apostar', required: true, min_value: 10, max_value: 5000 }
      ]
    }
  }
}
