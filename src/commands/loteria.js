// src/commands/loteria.js
// Server Lottery System for Solome Bot 4.0
// Players buy tickets, admins draw winners

const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

const TICKET_COST = 10          // Cost per ticket in BabaCoins
const DEFAULT_DURATION = 60 * 60 * 1000 // 1 hour in ms

/**
 * Gets lottery state for a guild
 */
function getState (guildId) {
  const all = load('loteria', {})
  if (!all[guildId]) {
    all[guildId] = {
      pot: 0,
      tickets: {},   // userId -> count
      endsAt: Date.now() + DEFAULT_DURATION
    }
    save('loteria', all)
  }
  return { all, state: all[guildId] }
}

/**
 * Saves lottery state for a guild
 */
function setState (guildId, state, all) {
  const data = all || load('loteria', {})
  data[guildId] = state
  save('loteria', data)
}

module.exports = class Loteria extends Command {
  constructor (client) {
    super(client, {
      name: 'loteria',
      description: 'Sistema de lotería del servidor (compra boletos y participa en sorteos)'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()
    const guildId = interaction.guild.id

    if (sub === 'jugar') {
      await interaction.deferReply({ ephemeral: true })

      const boletos = interaction.options.getInteger('boletos') || 1
      if (boletos <= 0) {
        return interaction.editReply('❌ La cantidad de boletos debe ser mayor a 0.')
      }

      const { all, state } = getState(guildId)

      const totalCost = boletos * TICKET_COST
      state.pot += totalCost
      state.tickets[interaction.user.id] = (state.tickets[interaction.user.id] || 0) + boletos
      setState(guildId, state, all)

      const embed = new EmbedBuilder()
        .setColor(0xffc107)
        .setTitle('🎫 Lotería Baba Radio')
        .setDescription(`Has comprado **${boletos}** boleto(s).\n\nCosto: **${totalCost}** BabaCoins (ficticios por ahora).`)
        .addFields(
          { name: 'Bote actual', value: `${state.pot} BabaCoins`, inline: true },
          { name: 'Tus boletos', value: `${state.tickets[interaction.user.id]}`, inline: true }
        )
        .setFooter({ text: 'La suerte está echada…' })
        .setTimestamp()

      return interaction.editReply({ embeds: [embed] })
    }

    if (sub === 'info') {
      const { state } = getState(guildId)

      const totalTickets = Object.values(state.tickets).reduce((a, b) => a + b, 0)
      const timeLeft = Math.max(0, state.endsAt - Date.now())
      const minutes = Math.floor(timeLeft / 60000)

      const embed = new EmbedBuilder()
        .setColor(0x00bcd4)
        .setTitle('📊 Información de la Lotería')
        .addFields(
          { name: 'Bote', value: `${state.pot} BabaCoins`, inline: true },
          { name: 'Boletos vendidos', value: `${totalTickets}`, inline: true },
          { name: 'Termina en', value: minutes > 0 ? `${minutes} minuto(s)` : 'En cualquier momento', inline: true }
        )
        .setFooter({ text: 'Usa /loteria jugar para participar.' })
        .setTimestamp()

      return interaction.reply({ embeds: [embed], ephemeral: true })
    }

    if (sub === 'sortear') {
      if (!interaction.member.permissions.has('ManageGuild')) {
        return interaction.reply({ content: '❌ Solo admins pueden sortear la lotería.', ephemeral: true })
      }

      await interaction.deferReply()

      const { all, state } = getState(guildId)
      const entries = []

      for (const [userId, count] of Object.entries(state.tickets)) {
        for (let i = 0; i < count; i++) entries.push(userId)
      }

      if (!entries.length) {
        return interaction.editReply('❌ No hay boletos vendidos en esta ronda.')
      }

      const winnerId = entries[Math.floor(Math.random() * entries.length)]
      const winner = await interaction.guild.members.fetch(winnerId).catch(() => null)

      const embed = new EmbedBuilder()
        .setColor(0x4caf50)
        .setTitle('🎉 ¡Tenemos ganador de la Lotería!')
        .setDescription(winner
          ? `Felicidades, ${winner}! Te llevas **${state.pot}** BabaCoins (virtuales).`
          : `El ganador es <@${winnerId}> (no pude obtener el miembro, quizás salió del server).`)
        .addFields(
          { name: 'Bote sorteado', value: `${state.pot} BabaCoins`, inline: true },
          { name: 'Boletos totales', value: `${entries.length}`, inline: true }
        )
        .setTimestamp()

      // Reset round
      all[guildId] = {
        pot: 0,
        tickets: {},
        endsAt: Date.now() + DEFAULT_DURATION
      }
      save('loteria', all)

      return interaction.editReply({ embeds: [embed] })
    }
  }

  getSlashCommandData () {
    return {
      name: this.name,
      description: 'Sistema de lotería del servidor',
      options: [
        {
          type: 1,
          name: 'jugar',
          description: 'Compra boletos para la lotería',
          options: [
            {
              type: 4,
              name: 'boletos',
              description: 'Número de boletos a comprar',
              required: false,
              min_value: 1,
              max_value: 100
            }
          ]
        },
        {
          type: 1,
          name: 'info',
          description: 'Muestra el estado actual de la lotería'
        },
        {
          type: 1,
          name: 'sortear',
          description: 'Realiza el sorteo actual (solo admins)'
        }
      ]
    }
  }
}
