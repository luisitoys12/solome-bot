const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Dice extends Command {
  constructor (client) {
    super(client, {
      name: 'dice',
      aliases: ['dado', 'roll'],
      description: '🎲 Lanza un dado'
    })
  }

  async runSlash (interaction) {
    const lados = interaction.options.getInteger('lados') || 6
    const cantidad = interaction.options.getInteger('cantidad') || 1
    
    if (cantidad > 10) {
      return interaction.reply({ content: '❌ Máximo 10 dados', flags: 64 })
    }
    
    const resultados = []
    for (let i = 0; i < cantidad; i++) {
      resultados.push(Math.floor(Math.random() * lados) + 1)
    }
    
    const total = resultados.reduce((a, b) => a + b, 0)
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🎲 Lanzamiento de Dados')
      .addFields(
        { name: '🎯 Resultados', value: resultados.map((r, i) => `Dado ${i + 1}: **${r}**`).join('\n'), inline: false },
        { name: '📊 Total', value: `**${total}**`, inline: true },
        { name: '🎲 Dados', value: `${cantidad}d${lados}`, inline: true }
      )
      .setFooter({ text: `Lanzado por ${interaction.user.tag}` })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 4, // INTEGER
          name: 'lados',
          description: 'Número de lados del dado (por defecto 6)',
          required: false,
          minValue: 2,
          maxValue: 100
        },
        {
          type: 4, // INTEGER
          name: 'cantidad',
          description: 'Cantidad de dados a lanzar (por defecto 1, máx 10)',
          required: false,
          minValue: 1,
          maxValue: 10
        }
      ]
    }
  }
}
