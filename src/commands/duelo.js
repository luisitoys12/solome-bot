// src/commands/duelo.js
const Command = require('../structures/command.js')
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js')

const CHOICES = {
  rock: { emoji: '🪨', name: 'Piedra', beats: 'scissors' },
  paper: { emoji: '📄', name: 'Papel', beats: 'rock' },
  scissors: { emoji: '✂️', name: 'Tijeras', beats: 'paper' }
}

function getRandomChoice () {
  const keys = Object.keys(CHOICES)
  return keys[Math.floor(Math.random() * keys.length)]
}

function determineWinner (choice1, choice2) {
  if (choice1 === choice2) return 'draw'
  return CHOICES[choice1].beats === choice2 ? 'player1' : 'player2'
}

module.exports = class Duelo extends Command {
  constructor (client) {
    super(client, {
      name: 'duelo',
      description: 'Juega piedra, papel o tijeras contra otro usuario o contra el bot'
    })
  }

  async runSlash (interaction) {
    const opponent = interaction.options.getUser('oponente')
    const challenger = interaction.user

    // Crear botones
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('rock')
        .setLabel('Piedra')
        .setEmoji('🪨')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('paper')
        .setLabel('Papel')
        .setEmoji('📄')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('scissors')
        .setLabel('Tijeras')
        .setEmoji('✂️')
        .setStyle(ButtonStyle.Primary)
    )

    // Modo: contra el bot
    if (!opponent || opponent.id === this.client.user.id) {
      const embed = new EmbedBuilder()
        .setColor(0xff9800)
        .setTitle('🎮 Duelo: Piedra, Papel o Tijeras')
        .setDescription(`${challenger}, elige tu jugada contra el bot!`)
        .setFooter({ text: 'Tienes 30 segundos para elegir' })
        .setTimestamp()

      const msg = await interaction.reply({ embeds: [embed], components: [buttons], fetchReply: true })

      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
        filter: i => i.user.id === challenger.id
      })

      collector.on('collect', async i => {
        const playerChoice = i.customId
        const botChoice = getRandomChoice()
        const result = determineWinner(playerChoice, botChoice)

        let resultText = ''
        let color = 0x607d8b

        if (result === 'draw') {
          resultText = '🤝 Empate!'
          color = 0xffeb3b
        } else if (result === 'player1') {
          resultText = `🏆 ${challenger} ganó!`
          color = 0x4caf50
        } else {
          resultText = `🤖 El bot ganó!`
          color = 0xf44336
        }

        const resultEmbed = new EmbedBuilder()
          .setColor(color)
          .setTitle('🎮 Resultado del Duelo')
          .setDescription(resultText)
          .addFields(
            { name: `${challenger.username}`, value: `${CHOICES[playerChoice].emoji} ${CHOICES[playerChoice].name}`, inline: true },
            { name: 'Bot', value: `${CHOICES[botChoice].emoji} ${CHOICES[botChoice].name}`, inline: true }
          )
          .setTimestamp()

        await i.update({ embeds: [resultEmbed], components: [] })
        collector.stop()
      })

      collector.on('end', (collected, reason) => {
        if (reason === 'time' && collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setColor(0x9e9e9e)
            .setTitle('⏱️ Tiempo agotado')
            .setDescription(`${challenger} no eligió a tiempo.`)

          msg.edit({ embeds: [timeoutEmbed], components: [] })
        }
      })

      return
    }

    // Modo: contra otro usuario
    if (opponent.bot) {
      return interaction.reply({ content: '❌ No puedes retar a un bot.', ephemeral: true })
    }

    if (opponent.id === challenger.id) {
      return interaction.reply({ content: '❌ No puedes retarte a ti mismo.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0xff9800)
      .setTitle('🎮 Duelo: Piedra, Papel o Tijeras')
      .setDescription(`${challenger} retó a ${opponent}!\n\nAmbos jugadores deben elegir en secreto.`)
      .setFooter({ text: 'Tienen 30 segundos para elegir' })
      .setTimestamp()

    const msg = await interaction.reply({ embeds: [embed], components: [buttons], fetchReply: true })

    const choices = {}
    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
      filter: i => [challenger.id, opponent.id].includes(i.user.id)
    })

    collector.on('collect', async i => {
      choices[i.user.id] = i.customId

      await i.reply({ content: `✅ Elegiste: ${CHOICES[i.customId].emoji} ${CHOICES[i.customId].name}`, ephemeral: true })

      // Si ambos eligieron, terminar
      if (choices[challenger.id] && choices[opponent.id]) {
        const result = determineWinner(choices[challenger.id], choices[opponent.id])

        let resultText = ''
        let color = 0x607d8b

        if (result === 'draw') {
          resultText = '🤝 Empate!'
          color = 0xffeb3b
        } else if (result === 'player1') {
          resultText = `🏆 ${challenger} ganó!`
          color = 0x4caf50
        } else {
          resultText = `🏆 ${opponent} ganó!`
          color = 0x4caf50
        }

        const resultEmbed = new EmbedBuilder()
          .setColor(color)
          .setTitle('🎮 Resultado del Duelo')
          .setDescription(resultText)
          .addFields(
            { name: challenger.username, value: `${CHOICES[choices[challenger.id]].emoji} ${CHOICES[choices[challenger.id]].name}`, inline: true },
            { name: opponent.username, value: `${CHOICES[choices[opponent.id]].emoji} ${CHOICES[choices[opponent.id]].name}`, inline: true }
          )
          .setTimestamp()

        await msg.edit({ embeds: [resultEmbed], components: [] })
        collector.stop()
      }
    })

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        const p1Choice = choices[challenger.id]
        const p2Choice = choices[opponent.id]

        if (!p1Choice || !p2Choice) {
          const timeoutEmbed = new EmbedBuilder()
            .setColor(0x9e9e9e)
            .setTitle('⏱️ Tiempo agotado')
            .setDescription('Uno o ambos jugadores no eligieron a tiempo.')

          msg.edit({ embeds: [timeoutEmbed], components: [] })
        }
      }
    })
  }

  getSlashCommandData () {
    return {
      name: this.name,
      description: 'Juega piedra, papel o tijeras',
      options: [
        {
          type: 6,
          name: 'oponente',
          description: 'Usuario a retar (deja vacío para jugar contra el bot)',
          required: false
        }
      ]
    }
  }
}
