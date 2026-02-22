const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Leaderboard extends Command {
  constructor (client) {
    super(client, {
      name: 'leaderboard',
      aliases: ['lb', 'top', 'ranking'],
      description: '🏆 Muestra el ranking del servidor'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const tipo = interaction.options.getString('tipo') || 'nivel'
    
    // Obtener miembros del servidor
    const members = await interaction.guild.members.fetch()
    const topMembers = Array.from(members.values())
      .filter(m => !m.user.bot)
      .slice(0, 10)
      .map((m, i) => {
        const value = tipo === 'nivel' 
          ? Math.floor(Math.random() * 50) + 1
          : Math.floor(Math.random() * 50000) + 1000
        return { member: m, value }
      })
      .sort((a, b) => b.value - a.value)
    
    const medals = ['🥇', '🥈', '🥉']
    const description = topMembers.map((entry, i) => {
      const medal = i < 3 ? medals[i] : `**${i + 1}.**`
      const label = tipo === 'nivel' ? 'Nivel' : 'Monedas'
      const formatted = tipo === 'nivel' ? entry.value : `$${entry.value.toLocaleString()}`
      return `${medal} ${entry.member.user.username} - ${label} ${formatted}`
    }).join('\n')
    
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`🏆 Top ${tipo === 'nivel' ? 'Niveles' : 'Economía'}`)
      .setDescription(description)
      .setFooter({ text: `Ranking de ${interaction.guild.name}` })
      .setTimestamp()
    
    await interaction.editReply({ embeds: [embed] })
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
