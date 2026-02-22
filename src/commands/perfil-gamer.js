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

function getProfile (userId) {
  const profiles = load('gamer-profiles', {})
  return profiles[userId] || null
}

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

    if (sub === 'configurar') {
      await this.configurar(interaction)
    } else if (sub === 'ver') {
      await this.ver(interaction)
    } else if (sub === 'buscar-squad') {
      await this.buscarSquad(interaction)
    } else if (sub === 'editar') {
      await this.editar(interaction)
    } else if (sub === 'estadisticas') {
      await this.estadisticas(interaction)
    }
  }

  async configurar(interaction) {
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
      wins: 0,
      kills: 0,
      playTime: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    saveProfile(interaction.user.id, profile)

    const embed = new EmbedBuilder()
      .setColor(0x9c27b0)
      .setTitle('🎮 Perfil Gamer Configurado')
      .setDescription('¡Tu perfil de gamer ha sido actualizado!')
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

  async ver(interaction) {
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
      .setDescription('Información gaming de este jugador')
      .addFields(
        { name: '🎮 Plataforma', value: PLATFORMS[profile.platform], inline: true },
        { name: '👤 Gamertag', value: profile.gamertag, inline: true },
        { name: '🎯 Juego Principal', value: profile.mainGame, inline: false },
        { name: '🏆 Género Favorito', value: GENRES[profile.genre], inline: true },
        { name: '📅 Perfil creado', value: createdDate, inline: true },
        { name: '📊 Estadísticas', value: `🏆 ${profile.wins || 0} Victorias | 💀 ${profile.kills || 0} Kills | ⏱️ ${profile.playTime || 0}h`, inline: false }
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

  async buscarSquad(interaction) {
    await interaction.deferReply()

    const game = interaction.options.getString('juego')
    const platform = interaction.options.getString('plataforma')
    const squadSize = interaction.options.getInteger('tamaño') || 4

    const profiles = load('gamer-profiles', {})
    const matches = []

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
        { name: '💡 Tip', value: '¡Menciόnalos para armar tu squad!', inline: false }
      )
    }

    embed.setFooter({ text: 'BabaRadio Gaming - ¡Encuentra tu equipo!' })
    embed.setTimestamp()

    return interaction.editReply({ embeds: [embed] })
  }

  async editar(interaction) {
    const profile = getProfile(interaction.user.id)
    
    if (!profile) {
      return interaction.reply({
        content: '❌ No tienes un perfil configurado. Usa `/perfil-gamer configurar` primero.',
        ephemeral: true
      })
    }

    const campo = interaction.options.getString('campo')
    const valor = interaction.options.getString('valor')

    if (campo === 'gamertag') {
      profile.gamertag = valor
    } else if (campo === 'juego') {
      profile.mainGame = valor
    } else if (campo === 'plataforma') {
      profile.platform = valor
    } else if (campo === 'genero') {
      profile.genre = valor
    }

    profile.updatedAt = Date.now()
    saveProfile(interaction.user.id, profile)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Perfil Actualizado')
      .setDescription(`**${campo}** ha sido actualizado a: ${valor}`)
      .setFooter({ text: 'Cambios guardados' })
      .setTimestamp()

    return interaction.reply({ embeds: [embed], ephemeral: true })
  }

  async estadisticas(interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    const profile = getProfile(targetUser.id)

    if (!profile) {
      return interaction.reply({
        content: '❌ Este usuario no tiene perfil configurado.',
        ephemeral: true
      })
    }

    const kd = profile.kills && profile.wins ? (profile.kills / Math.max(profile.wins, 1)).toFixed(2) : '0.00'
    const winRate = profile.wins ? ((profile.wins / Math.max(profile.wins + 10, 1)) * 100).toFixed(1) : '0.0'

    const embed = new EmbedBuilder()
      .setColor(0xffc107)
      .setTitle(`📊 Estadísticas Gaming de ${targetUser.username}`)
      .addFields(
        { name: '🏆 Victorias', value: `${profile.wins || 0}`, inline: true },
        { name: '💀 Kills', value: `${profile.kills || 0}`, inline: true },
        { name: '⏱️ Tiempo Jugado', value: `${profile.playTime || 0}h`, inline: true },
        { name: '📈 K/D Ratio', value: kd, inline: true },
        { name: '🎯 Win Rate', value: `${winRate}%`, inline: true },
        { name: '🎮 Juego Principal', value: profile.mainGame, inline: true }
      )
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: 'Estadísticas actualizadas' })
      .setTimestamp()

    return interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 1,
          name: 'configurar',
          description: 'Configura tu perfil de gamer',
          options: [
            {
              type: 3,
              name: 'plataforma',
              description: 'Tu plataforma principal',
              required: true,
              choices: Object.keys(PLATFORMS).map(key => ({ name: PLATFORMS[key], value: key }))
            },
            { type: 3, name: 'gamertag', description: 'Tu gamertag/nickname', required: true },
            { type: 3, name: 'juego_principal', description: 'Tu juego principal', required: false },
            {
              type: 3,
              name: 'genero_favorito',
              description: 'Tu género favorito',
              required: false,
              choices: Object.keys(GENRES).map(key => ({ name: GENRES[key], value: key }))
            }
          ]
        },
        {
          type: 1,
          name: 'ver',
          description: 'Ver perfil de gamer',
          options: [
            { type: 6, name: 'usuario', description: 'Usuario a consultar (opcional)', required: false }
          ]
        },
        {
          type: 1,
          name: 'buscar-squad',
          description: 'Busca compañeros de juego',
          options: [
            { type: 3, name: 'juego', description: 'Juego para buscar squad', required: true },
            {
              type: 3,
              name: 'plataforma',
              description: 'Plataforma (opcional)',
              required: false,
              choices: Object.keys(PLATFORMS).map(key => ({ name: PLATFORMS[key], value: key }))
            },
            { type: 4, name: 'tamaño', description: 'Tamaño del squad (2-10)', required: false }
          ]
        },
        {
          type: 1,
          name: 'editar',
          description: 'Edita tu perfil existente',
          options: [
            {
              type: 3,
              name: 'campo',
              description: 'Campo a editar',
              required: true,
              choices: [
                { name: 'Gamertag', value: 'gamertag' },
                { name: 'Juego Principal', value: 'juego' },
                { name: 'Plataforma', value: 'plataforma' },
                { name: 'Género', value: 'genero' }
              ]
            },
            { type: 3, name: 'valor', description: 'Nuevo valor', required: true }
          ]
        },
        {
          type: 1,
          name: 'estadisticas',
          description: 'Ver estadísticas de gaming',
          options: [
            { type: 6, name: 'usuario', description: 'Usuario a consultar (opcional)', required: false }
          ]
        }
      ]
    }
  }
}
