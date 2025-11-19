const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = class Connect4 extends Command {
  constructor (client) {
    super(client, {
      name: 'connect4',
      aliases: ['4enlinea'],
      description: 'Play Connect 4 (4 in a row) with another user'
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

    // Game state - 6 rows x 7 columns
    const board = Array(6).fill(null).map(() => Array(7).fill('⚪'))
    let currentPlayer = interaction.user.id
    const players = {
      [interaction.user.id]: '🔴',
      [opponent.id]: '🟡'
    }

    const createBoard = () => {
      const rows = []
      
      // Column buttons
      const buttonRow = new ActionRowBuilder()
      for (let col = 0; col < 7; col++) {
        buttonRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`c4_${col}`)
            .setLabel(`${col + 1}`)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(board[0][col] !== '⚪')
        )
      }
      rows.push(buttonRow)

      return rows
    }

    const getBoardDisplay = () => {
      let display = ''
      for (let row = 0; row < 6; row++) {
        display += board[row].join('') + '\n'
      }
      display += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣'
      return display
    }

    const dropPiece = (col) => {
      for (let row = 5; row >= 0; row--) {
        if (board[row][col] === '⚪') {
          board[row][col] = players[currentPlayer]
          return row
        }
      }
      return -1
    }

    const checkWinner = () => {
      // Check horizontal
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
          if (board[row][col] !== '⚪' &&
              board[row][col] === board[row][col + 1] &&
              board[row][col] === board[row][col + 2] &&
              board[row][col] === board[row][col + 3]) {
            return board[row][col]
          }
        }
      }

      // Check vertical
      for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 3; row++) {
          if (board[row][col] !== '⚪' &&
              board[row][col] === board[row + 1][col] &&
              board[row][col] === board[row + 2][col] &&
              board[row][col] === board[row + 3][col]) {
            return board[row][col]
          }
        }
      }

      // Check diagonal (down-right)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          if (board[row][col] !== '⚪' &&
              board[row][col] === board[row + 1][col + 1] &&
              board[row][col] === board[row + 2][col + 2] &&
              board[row][col] === board[row + 3][col + 3]) {
            return board[row][col]
          }
        }
      }

      // Check diagonal (down-left)
      for (let row = 0; row < 3; row++) {
        for (let col = 3; col < 7; col++) {
          if (board[row][col] !== '⚪' &&
              board[row][col] === board[row + 1][col - 1] &&
              board[row][col] === board[row + 2][col - 2] &&
              board[row][col] === board[row + 3][col - 3]) {
            return board[row][col]
          }
        }
      }

      // Check for tie
      if (board[0].every(cell => cell !== '⚪')) {
        return 'tie'
      }

      return null
    }

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('🎮 Connect 4 (4 en Línea)')
      .setDescription(`${interaction.user} (🔴) vs ${opponent} (🟡)\n\n${getBoardDisplay()}\n\nTurno de: <@${currentPlayer}>`)
      .setFooter({ text: 'Haz clic en un número para colocar tu ficha' })

    const message = await interaction.reply({ embeds: [embed], components: createBoard(), fetchReply: true })

    const collector = message.createMessageComponentCollector({ time: 600000 })

    collector.on('collect', async i => {
      if (i.user.id !== currentPlayer) {
        return i.reply({ content: '❌ No es tu turno!', ephemeral: true })
      }

      const col = parseInt(i.customId.split('_')[1])
      const row = dropPiece(col)

      if (row === -1) {
        return i.reply({ content: '❌ Esa columna está llena!', ephemeral: true })
      }

      const winner = checkWinner()

      if (winner) {
        collector.stop()
        let resultEmbed

        if (winner === 'tie') {
          resultEmbed = new EmbedBuilder()
            .setColor(0x95a5a6)
            .setTitle('🎮 Connect 4 - Empate!')
            .setDescription(`${interaction.user} (🔴) vs ${opponent} (🟡)\n\n${getBoardDisplay()}\n\n¡Es un empate!`)
        } else {
          const winnerId = Object.keys(players).find(key => players[key] === winner)
          resultEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('🎮 Connect 4 - Victoria!')
            .setDescription(`${interaction.user} (🔴) vs ${opponent} (🟡)\n\n${getBoardDisplay()}\n\n🏆 Ganador: <@${winnerId}>`)
        }

        await i.update({ embeds: [resultEmbed], components: [] })
      } else {
        currentPlayer = currentPlayer === interaction.user.id ? opponent.id : interaction.user.id
        
        const updateEmbed = new EmbedBuilder()
          .setColor(0xe67e22)
          .setTitle('🎮 Connect 4 (4 en Línea)')
          .setDescription(`${interaction.user} (🔴) vs ${opponent} (🟡)\n\n${getBoardDisplay()}\n\nTurno de: <@${currentPlayer}>`)
          .setFooter({ text: 'Haz clic en un número para colocar tu ficha' })

        await i.update({ embeds: [updateEmbed], components: createBoard() })
      }
    })

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle('🎮 Connect 4 - Tiempo agotado')
          .setDescription('El juego ha terminado por inactividad.')

        interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {})
      }
    })
  }
}
