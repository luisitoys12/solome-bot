const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load } = require('../utils/database.js')

module.exports = class Leaderboard extends Command {
  constructor (client) {
    super(client, {
      name: 'leaderboard',
      aliases: ['top', 'ranking'],
      description: '🏆 Muestra el ranking de niveles y economía del servidor'
    })
  }

  async runSlash (interaction) {
    const tipo = interaction.options.getString('tipo') || 'nivel'
    
    if (tipo === 'nivel') {
      await this.rankingNiveles(interaction)
    } else if (tipo === 'dinero') {
      await this.rankingEconomia(interaction)
    }
  }

  async rankingNiveles(interaction) {
    const levels = load('levels', {})
    const guildMembers = await interaction.guild.members.fetch()
    
    const ranking = Object.entries(levels)
      .filter(([userId]) => guildMembers.has(userId))
      .sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0))
      .slice(0, 10)

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('🏆 Top 10 - Niveles')
      .setDescription(ranking.length === 0 ? 'No hay datos aún' : '')

    ranking.forEach(([userId, data], index) => {
      const user = guildMembers.get(userId)
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      embed.addFields({
        name: `${medal} ${user?.user.username || 'Usuario'}`,
        value: `Nivel ${data.level || 0} - ${data.xp || 0} XP`,
        inline: false
      })
    })

    await interaction.reply({ embeds: [embed] })
  }

  async rankingEconomia(interaction) {
    const economy = load('economy', {})
    const guildMembers = await interaction.guild.members.fetch()
    
    const ranking = Object.entries(economy)
      .filter(([userId]) => guildMembers.has(userId))
      .sort((a, b) => (b[1].balance || 0) - (a[1].balance || 0))
      .slice(0, 10)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('💰 Top 10 - Economía')
      .setDescription(ranking.length === 0 ? 'No hay datos aún' : '')

    ranking.forEach(([userId, data], index) => {
      const user = guildMembers.get(userId)
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      embed.addFields({
        name: `${medal} ${user?.user.username || 'Usuario'}`,
        value: `$${data.balance || 0}`,
        inline: false
      })
    })

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
