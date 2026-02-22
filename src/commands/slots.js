const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💰', '7️⃣']
const MULTIPLIERS = {
  '🍒': 2,
  '🍋': 3,
  '🍊': 4,
  '🍇': 5,
  '⭐': 10,
  '💰': 20,
  '7️⃣': 77
}

module.exports = class Slots extends Command {
  constructor (client) {
    super(client, {
      name: 'slots',
      aliases: ['slot', 'tragamonedas'],
      description: '🎰 Juega a las tragamonedas'
    })
  }

  async runSlash (interaction) {
    const apuesta = interaction.options.getInteger('apuesta')
    
    // Generar 3 símbolos aleatorios
    const results = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ]
    
    // Verificar si ganó
    const todosIguales = results[0] === results[1] && results[1] === results[2]
    const dosIguales = results[0] === results[1] || results[1] === results[2] || results[0] === results[2]
    
    let ganancia = 0
    let mensaje = ''
    
    if (todosIguales) {
      const multiplicador = MULTIPLIERS[results[0]]
      ganancia = apuesta * multiplicador
      mensaje = `🎉 ¡JACKPOT! x${multiplicador}`
    } else if (dosIguales) {
      ganancia = Math.floor(apuesta * 0.5)
      mensaje = '😊 ¡Par! Recuperaste algo'
    } else {
      ganancia = -apuesta
      mensaje = '😢 Sin suerte esta vez'
    }
    
    const embed = new EmbedBuilder()
      .setColor(todosIguales ? 0xffd700 : dosIguales ? 0x00ff00 : 0xff0000)
      .setTitle('🎰 Tragamonedas')
      .setDescription(`\n\n🟦🟦🟦🟦🟦\n🟦 ${results[0]} ${results[1]} ${results[2]} 🟦\n🟦🟦🟦🟦🟦\n\n${mensaje}`)
      .addFields(
        { name: '💵 Apuesta', value: `$${apuesta}`, inline: true },
        { name: ganancia > 0 ? '🎉 Ganancia' : '😢 Pérdida', value: ganancia > 0 ? `+$${ganancia}` : `$${ganancia}`, inline: true },
        { name: '📊 Balance', value: ganancia > 0 ? `+$${ganancia - apuesta}` : `-$${Math.abs(ganancia)}`, inline: true }
      )
      .setFooter({ text: '🍊=x4 | ⭐=x10 | 💰=x20 | 7️⃣=x77' })
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
          max_value: 5000
        }
      ]
    }
  }
}
