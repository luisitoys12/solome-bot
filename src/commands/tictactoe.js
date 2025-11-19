const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = class TicTacToe extends Command {
  constructor (client) {
    super(client, {
      name: 'tictactoe',
      aliases: ['gato'],
      description: 'Play Tic-Tac-Toe with another user'
    })
  }

  async runSlash (interaction) {
    const opponent = interaction.options.getUser('opponent')
    
    if (opponent.bot) {
      return interaction.reply({ content: '❌ You cannot play with a bot!', ephemeral: true })
    }
    
    if (opponent.id === interaction.user.id) {
      return interaction.reply({ content: '❌ You cannot play with yourself!', ephemeral: true })
    }

    // Game state
    const board = ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜']
    let currentPlayer = interaction.user.id
    const players = {
      [interaction.user.id]: '❌',
      [opponent.id]: '⭕'
    }

    const createBoard = () => {
      const rows = []
      for (let i = 0; i < 3; i++) {
        const row = new ActionRowBuilder()
        for (let j = 0; j < 3; j++) {
          const index = i * 3 + j
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`ttt_${index}`)
              .setLabel(board[index])
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(board[index] !== '⬜')
          )
        }
        rows.push(row)
      }
      return rows
    }

    const checkWinner = () => {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
      ]

      for (const pattern of winPatterns) {
        const [a, b, c] = pattern
        if (board[a] !== '⬜' && board[a] === board[b] && board[a] === board[c]) {
          return board[a]
        }
      }

      return board.includes('⬜') ? null : 'tie'
    }

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🎮 Tic-Tac-Toe')
      .setDescription(`${interaction.user} (❌) vs ${opponent} (⭕)\n\nTurno de: <@${currentPlayer}>`)
      .setFooter({ text: 'Haz clic en un botón para jugar' })

    const message = await interaction.reply({ embeds: [embed], components: createBoard(), fetchReply: true })

    const collector = message.createMessageComponentCollector({ time: 300000 })

    collector.on('collect', async i => {
      if (i.user.id !== currentPlayer) {
        return i.reply({ content: '❌ No es tu turno!', ephemeral: true })
      }

      const index = parseInt(i.customId.split('_')[1])
      board[index] = players[currentPlayer]

      const winner = checkWinner()

      if (winner) {
        collector.stop()
        let resultEmbed

        if (winner === 'tie') {
          resultEmbed = new EmbedBuilder()
            .setColor(0x95a5a6)
            .setTitle('🎮 Tic-Tac-Toe - Empate!')
            .setDescription(`${interaction.user} (❌) vs ${opponent} (⭕)\n\n¡Es un empate!`)
        } else {
          const winnerId = Object.keys(players).find(key => players[key] === winner)
          resultEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('🎮 Tic-Tac-Toe - Victoria!')
            .setDescription(`${interaction.user} (❌) vs ${opponent} (⭕)\n\n🏆 Ganador: <@${winnerId}>`)
        }

        // Disable all buttons
        const disabledRows = createBoard().map(row => {
          row.components.forEach(button => button.setDisabled(true))
          return row
        })

        await i.update({ embeds: [resultEmbed], components: disabledRows })
      } else {
        currentPlayer = currentPlayer === interaction.user.id ? opponent.id : interaction.user.id
        
        const updateEmbed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle('🎮 Tic-Tac-Toe')
          .setDescription(`${interaction.user} (❌) vs ${opponent} (⭕)\n\nTurno de: <@${currentPlayer}>`)
          .setFooter({ text: 'Haz clic en un botón para jugar' })

        await i.update({ embeds: [updateEmbed], components: createBoard() })
      }
    })

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle('🎮 Tic-Tac-Toe - Tiempo agotado')
          .setDescription('El juego ha terminado por inactividad.')

        interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {})
      }
    })
  }
}
