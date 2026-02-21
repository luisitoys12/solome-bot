// src/commands/loteria.js
// BabaRadio Lottery System - Multifunctional and Fun!
// Buy tickets, check status, and win prizes!

const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

const TICKET_COST = 10          // Cost per ticket in BabaCoins
const DEFAULT_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Get lottery state for a guild
 */
function getState (guildId) {
  const all = load('loteria', {})
  if (!all[guildId]) {
    all[guildId] = {
      pot: 0,
      tickets: {},   // userId -> ticket count
      endsAt: Date.now() + DEFAULT_DURATION,
      drawNumber: 1
    }
    save('loteria', all)
  }
  return { all, state: all[guildId] }
}

/**
 * Save lottery state for a guild
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
      aliases: ['lottery', 'lotto'],
      description: '🎰 Sistema de lotería del servidor - Compra boletos y gana premios!'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()
    const guildId = interaction.guild.id

    // Subcommand: jugar (buy tickets)
    if (sub === 'jugar') {
      await interaction.deferReply({ ephemeral: true })

      const boletos = interaction.options.getInteger('boletos') || 1
      if (boletos <= 0 || boletos > 100) {
        return interaction.editReply('❌ La cantidad de boletos debe estar entre 1 y 100.')
      }

      const { all, state } = getState(guildId)

      // Add tickets and increase pot
      const totalCost = boletos * TICKET_COST
      state.pot += totalCost
      state.tickets[interaction.user.id] = (state.tickets[interaction.user.id] || 0) + boletos
      setState(guildId, state, all)

      const userTickets = state.tickets[interaction.user.id]
      const totalTickets = Object.values(state.tickets).reduce((a, b) => a + b, 0)
      const winChance = ((userTickets / totalTickets) * 100).toFixed(2)

      const embed = new EmbedBuilder()
        .setColor(0xffc107)
        .setTitle('🎫 Lotería Baba Radio')
        .setDescription(`¡Has comprado **${boletos}** boleto(s)!\n\nCosto total: **${totalCost}** BabaCoins`)
        .addFields(
          { name: '💰 Bote actual', value: `${state.pot} BabaCoins`, inline: true },
          { name: '🎫 Tus boletos', value: `${userTickets}`, inline: true },
          { name: '🎯 Probabilidad', value: `${winChance}%`, inline: true }
        )
        .setFooter({ text: `Sorteo #${state.drawNumber} • ¡Buena suerte!` })
        .setTimestamp()

      return interaction.editReply({ embeds: [embed] })
    }

    // Subcommand: info (check lottery status)
    if (sub === 'info') {
      const { state } = getState(guildId)

      const totalTickets = Object.values(state.tickets).reduce((a, b) => a + b, 0)
      const participants = Object.keys(state.tickets).length
      const timeLeft = Math.max(0, state.endsAt - Date.now())
      const hours = Math.floor(timeLeft / 3600000)
      const minutes = Math.floor((timeLeft % 3600000) / 60000)

      let topPlayers = ''
      if (participants > 0) {
        const sorted = Object.entries(state.tickets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
        
        for (let i = 0; i < sorted.length; i++) {
          const [userId, count] = sorted[i]
          const medal = ['🥇', '🥈', '🥉', '🏅', '🏅'][i]
          topPlayers += `${medal} <@${userId}>: ${count} boletos\n`
        }
      } else {
        topPlayers = 'Nadie ha comprado boletos aún'
      }

      const embed = new EmbedBuilder()
        .setColor(0x00bcd4)
        .setTitle('📊 Información de la Lotería')
        .setDescription(`**Sorteo #${state.drawNumber}** está activo`)
        .addFields(
          { name: '💰 Bote acumulado', value: `${state.pot} BabaCoins`, inline: true },
          { name: '🎫 Boletos vendidos', value: `${totalTickets}`, inline: true },
          { name: '👥 Participantes', value: `${participants}`, inline: true },
          { name: '⏰ Tiempo restante', value: hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes} minuto(s)` : 'Por terminar', inline: true },
          { name: '🏆 Top Participantes', value: topPlayers, inline: false }
        )
        .setFooter({ text: 'Usa /loteria jugar para participar' })
        .setTimestamp()

      return interaction.reply({ embeds: [embed] })
    }

    // Subcommand: sortear (draw winner - admin only)
    if (sub === 'sortear') {
      // Check permissions
      if (!interaction.member.permissions.has('ManageGuild')) {
        return interaction.reply({ 
          content: '❌ Solo administradores del servidor pueden realizar el sorteo.', 
          ephemeral: true 
        })
      }

      await interaction.deferReply()

      const { all, state } = getState(guildId)
      
      // Create entries array (each ticket = 1 entry)
      const entries = []
      for (const [userId, count] of Object.entries(state.tickets)) {
        for (let i = 0; i < count; i++) {
          entries.push(userId)
        }
      }

      if (!entries.length) {
        return interaction.editReply('❌ No hay boletos vendidos en esta ronda.')
      }

      // Pick random winner
      const winnerId = entries[Math.floor(Math.random() * entries.length)]
      const winner = await interaction.guild.members.fetch(winnerId).catch(() => null)
      const winnerTickets = state.tickets[winnerId]

      const embed = new EmbedBuilder()
        .setColor(0x4caf50)
        .setTitle('🎉 ¡TENEMOS GANADOR!')
        .setDescription(
          winner 
            ? `🏆 **${winner}** ha ganado el sorteo #${state.drawNumber}!\n\n💰 Premio: **${state.pot} BabaCoins**`
            : `🏆 El ganador es <@${winnerId}>\n\n💰 Premio: **${state.pot} BabaCoins**`
        )
        .addFields(
          { name: '🎫 Boletos del ganador', value: `${winnerTickets}`, inline: true },
          { name: '📊 Total de boletos', value: `${entries.length}`, inline: true },
          { name: '👥 Participantes', value: `${Object.keys(state.tickets).length}`, inline: true }
        )
        .setThumbnail(winner?.user.displayAvatarURL() || null)
        .setFooter({ text: '¡Felicidades! La próxima ronda comienza ahora.' })
        .setTimestamp()

      // Reset lottery for new round
      all[guildId] = {
        pot: 0,
        tickets: {},
        endsAt: Date.now() + DEFAULT_DURATION,
        drawNumber: state.drawNumber + 1
      }
      save('loteria', all)

      return interaction.editReply({ embeds: [embed] })
    }
  }
}
