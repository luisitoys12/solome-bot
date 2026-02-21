// src/commands/perfil-gamer.js
// Gaming Profile System for BabaRadio Bot
// Let users showcase their gaming identity!

const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

const PLATFORMS = {
  steam: '🖥️ Steam',
  xbox: '🎮 Xbox',
  psn: '🎮 PlayStation',
  switch: '🎮 Nintendo Switch',
  epic: '💎 Epic Games',
  mobile: '📱 Mobile'
}

const GENRES = {
  fps: '🔫 FPS',
  rpg: '⚔️ RPG',
  moba: '🏆 MOBA',
  battle_royale: '🎯 Battle Royale',
  sports: '⚽ Deportes',
  racing: '🏎️ Carreras',
  survival: '🌲 Supervivencia',
  sandbox: '🧱 Sandbox',
  strategy: '🧠 Estrategia',
  horror: '👻 Terror',
  casual: '🎲 Casual'
}

/**
 * Get gamer profile
 */
function getProfile (userId) {
  const profiles = load('gamer-profiles', {})
  return profiles[userId] || null
}

/**
 * Save gamer profile
 */
function saveProfile (userId, profile) {
  const profiles = load('gamer-profiles', {})
  profiles[userId] = profile
  save('gamer-profiles', profiles)
}

module.exports = class PerfilGamer extends Command {
  constructor (client) {
    super(client, {
      name: 'perfil-gamer',
      aliases: ['gamer', 'gaming-profile'],
      description: '🎮 Sistema de perfiles para gamers - Muestra tu identidad gaming!'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()

    // Subcommand: configurar (setup profile)
    if (sub === 'configurar') {
      await interaction.deferReply({ ephemeral: true })

      const platform = interaction.options.getString('plataforma')
      const gamertag = interaction.options.getString('gamertag')
      const mainGame = interaction.options.getString('juego_principal') || 'No especificado'
      const genre = interaction.options.getString('genero_favorito') || 'casual'

      const profile = {
        platform,
        gamertag,
        mainGame,
        genre,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      saveProfile(interaction.user.id, profile)

      const embed = new EmbedBuilder()
        .setColor(0x9c27b0)
        .setTitle('🎮 Perfil Gamer Configurado')
        .setDescription(`¡Tu perfil de gamer ha sido actualizado!`)
        .addFields(
          { name: '🎮 Plataforma Principal', value: PLATFORMS[platform], inline: true },
          { name: '👤 Gamertag', value: gamertag, inline: true },
          { name: '🎯 Juego Principal', value: mainGame, inline: false },
          { name: '🏆 Género Favorito', value: GENRES[genre], inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: 'Usa /perfil-gamer ver para mostrar tu perfil' })
        .setTimestamp()

      return interaction.editReply({ embeds: [embed] })
    }

    // Subcommand: ver (view profile)
    if (sub === 'ver') {
      const targetUser = interaction.options.getUser('usuario') || interaction.user
      const profile = getProfile(targetUser.id)

      if (!profile) {
        return interaction.reply({
          content: targetUser.id === interaction.user.id
            ? '❌ No tienes un perfil de gamer configurado. Usa `/perfil-gamer configurar` para crear uno.'
            : `❌ ${targetUser.username} no tiene un perfil de gamer configurado.`,
          ephemeral: true
        })
      }

      const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null)
      const createdDate = new Date(profile.createdAt).toLocaleDateString('es-ES')

      const embed = new EmbedBuilder()
        .setColor(0xff5722)
        .setTitle(`🎮 Perfil Gamer de ${targetUser.username}`)
        .setDescription(`Información gaming de este jugador`)
        .addFields(
          { name: '🎮 Plataforma', value: PLATFORMS[profile.platform], inline: true },
          { name: '👤 Gamertag', value: profile.gamertag, inline: true },
          { name: '🎯 Juego Principal', value: profile.mainGame, inline: false },
          { name: '🏆 Género Favorito', value: GENRES[profile.genre], inline: true },
          { name: '📅 Perfil creado', value: createdDate, inline: true }
        )
        .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
        .setFooter({ text: 'BabaRadio Gaming Community' })
        .setTimestamp()

      if (member) {
        embed.setAuthor({ 
          name: member.displayName, 
          iconURL: member.user.displayAvatarURL() 
        })
      }

      return interaction.reply({ embeds: [embed] })
    }

    // Subcommand: buscar-squad (find gaming squad)
    if (sub === 'buscar-squad') {
      await interaction.deferReply()

      const game = interaction.options.getString('juego')
      const platform = interaction.options.getString('plataforma')
      const squadSize = interaction.options.getInteger('tamaño') || 4

      const profiles = load('gamer-profiles', {})
      const matches = []

      // Find players with matching game/platform
      for (const [userId, profile] of Object.entries(profiles)) {
        if (userId === interaction.user.id) continue
        
        const gameMatch = profile.mainGame.toLowerCase().includes(game.toLowerCase())
        const platformMatch = !platform || profile.platform === platform
        
        if (gameMatch && platformMatch) {
          matches.push({ userId, profile })
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0x673ab7)
        .setTitle('🔍 Búsqueda de Squad')
        .setDescription(`Buscando jugadores para **${game}**`)
        .addFields(
          { name: '🎮 Plataforma', value: platform ? PLATFORMS[platform] : 'Todas', inline: true },
          { name: '👥 Tamaño del Squad', value: `${squadSize} jugadores`, inline: true }
        )

      if (matches.length === 0) {
        embed.addFields(
          { name: '❌ Sin resultados', value: 'No se encontraron jugadores con ese juego. ¡Sé el primero en configurar tu perfil!' }
        )
      } else {
        let playerList = ''
        const limit = Math.min(matches.length, squadSize - 1)
        
        for (let i = 0; i < limit; i++) {
          const match = matches[i]
          playerList += `<@${match.userId}> - ${match.profile.gamertag}\n`
        }
        
        embed.addFields(
          { name: `✅ ${matches.length} jugadores encontrados`, value: playerList || 'Nadie disponible', inline: false },
          { name: '💡 Tip', value: 'Menciόnalos para armar tu squad!', inline: false }
        )
      }

      embed.setFooter({ text: 'BabaRadio Gaming - ¡Encuentra tu equipo!' })
      embed.setTimestamp()

      return interaction.editReply({ embeds: [embed] })
    }
  }
}
