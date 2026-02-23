const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load } = require('../utils/database.js')

module.exports = class Leaderboard extends Command {
  constructor (client) {
    super(client, {
      name: 'leaderboard',
      aliases: ['lb', 'top', 'ranking'],
      description: '🏆 Muestra el ranking de niveles o dinero del servidor'
    })
  }

  async runSlash (interaction) {
    const tipo = interaction.options.getString('tipo') || 'nivel'
    
    const data = tipo === 'nivel' ? load('levels', {}) : load('economy', {})
    const sorted = Object.entries(data)
      .sort(([, a], [, b]) => {
        const aVal = tipo === 'nivel' ? (a.level || 0) : a
        const bVal = tipo === 'nivel' ? (b.level || 0) : b
        return bVal - aVal
      })
      .slice(0, 10)

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`🏆 Top 10 - ${tipo === 'nivel' ? 'Niveles' : 'Dinero'}`)
      .setDescription(
        sorted.map(([userId, val], i) => {
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
          const value = tipo === 'nivel' ? `Nivel ${val.level}` : `${val} monedas`
          return `${medal} <@${userId}> - ${value}`
        }).join('\n') || 'No hay datos'
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'tipo',
          description: 'Tipo de ranking',
          required: false,
          choices: [
            { name: '🎮 Niveles', value: 'nivel' },
            { name: '💰 Economía', value: 'dinero' }
          ]
        }
      ]
    }
  }
}
