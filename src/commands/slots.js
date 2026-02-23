const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Slots extends Command {
  constructor (client) {
    super(client, {
      name: 'slots',
      aliases: ['slot'],
      description: '🎰 Máquina tragamonedas - Apuesta y gana premios'
    })
  }

  async runSlash (interaction) {
    const apuesta = interaction.options.getInteger('apuesta')

    const economy = load('economy', {})
    const userData = economy[interaction.user.id] || { balance: 0 }

    if (userData.balance < apuesta) {
      return interaction.reply({ content: '❌ No tienes suficiente dinero!', ephemeral: true })
    }

    const simbolos = ['🍒', '🍋', '🍊', '💎', '👑', '⭐']
    const resultado = [
      simbolos[Math.floor(Math.random() * simbolos.length)],
      simbolos[Math.floor(Math.random() * simbolos.length)],
      simbolos[Math.floor(Math.random() * simbolos.length)]
    ]

    let ganancia = -apuesta
    
    if (resultado[0] === resultado[1] && resultado[1] === resultado[2]) {
      ganancia = apuesta * 10
    } else if (resultado[0] === resultado[1] || resultado[1] === resultado[2]) {
      ganancia = apuesta * 2
    }

    userData.balance += ganancia
    economy[interaction.user.id] = userData
    save('economy', economy)

    const embed = new EmbedBuilder()
      .setColor(ganancia > 0 ? 0x00ff00 : 0xff0000)
      .setTitle('🎰 Slots')
      .setDescription(`${resultado.join(' | ')}`)
      .addFields(
        { name: 'Resultado', value: ganancia > 0 ? `✅ +$${ganancia}` : `❌ -$${Math.abs(ganancia)}`, inline: true },
        { name: 'Balance', value: `$${userData.balance}`, inline: true }
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
          max_value: 5000
        }
      ]
    }
  }
}
