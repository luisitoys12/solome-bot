const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const ms = require('ms')

module.exports = class Giveaway extends Command {
  constructor (client) {
    super(client, {
      name: 'giveaway',
      description: 'Crea un sorteo en el servidor'
    })
  }

  async runSlash (interaction) {
    const duration = interaction.options.getString('duracion')
    const winners = interaction.options.getInteger('ganadores') || 1
    const prize = interaction.options.getString('premio')

    const time = ms(duration)
    if (!time || time < 1000) {
      return interaction.reply({ content: '❌ Duración inválida. Usa formato como: 10m, 1h, 1d', ephemeral: true })
    }

    const endTime = Date.now() + time

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('🎉 SORTEO')
      .setDescription(`**Premio:** ${prize}\n\n**Ganadores:** ${winners}\n**Termina:** <t:${Math.floor(endTime / 1000)}:R>\n\n**Organizado por:** ${interaction.user}`)
      .setFooter({ text: `${winners} ganador(es) | Termina` })
      .setTimestamp(endTime)

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('giveaway_enter')
          .setLabel('🎉 Participar')
          .setStyle(ButtonStyle.Primary)
      )

    const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true })

    // Store giveaway data (in production, use database)
    const giveawayData = {
      messageId: message.id,
      channelId: interaction.channel.id,
      guildId: interaction.guild.id,
      prize,
      winners,
      endTime,
      participants: new Set(),
      hostId: interaction.user.id
    }

    // Simple in-memory storage (replace with database in production)
    if (!this.client.giveaways) this.client.giveaways = new Map()
    this.client.giveaways.set(message.id, giveawayData)

    // Set timeout to end giveaway
    setTimeout(async () => {
      await this.endGiveaway(this.client, giveawayData)
    }, time)
  }

  async endGiveaway(client, data) {
    try {
      const channel = await client.channels.fetch(data.channelId)
      const message = await channel.messages.fetch(data.messageId)

      if (data.participants.size === 0) {
        const embed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle('🎉 SORTEO TERMINADO')
          .setDescription(`**Premio:** ${data.prize}\n\n❌ No hubo participantes.`)
          .setFooter({ text: 'Sorteo terminado' })
          .setTimestamp()

        await message.edit({ embeds: [embed], components: [] })
        return
      }

      const participantsArray = Array.from(data.participants)
      const winnersArray = []

      for (let i = 0; i < Math.min(data.winners, participantsArray.length); i++) {
        const randomIndex = Math.floor(Math.random() * participantsArray.length)
        winnersArray.push(participantsArray.splice(randomIndex, 1)[0])
      }

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🎉 SORTEO TERMINADO')
        .setDescription(`**Premio:** ${data.prize}\n\n**Ganador(es):**\n${winnersArray.map(id => `<@${id}>`).join('\n')}`)
        .setFooter({ text: 'Sorteo terminado' })
        .setTimestamp()

      await message.edit({ embeds: [embed], components: [] })
      await message.reply(`🎉 ¡Felicidades ${winnersArray.map(id => `<@${id}>`).join(', ')}! Ganaste **${data.prize}**!`)

      client.giveaways.delete(data.messageId)
    } catch (error) {
      client.log('error', error)
    }
  }
}
