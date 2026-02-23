const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class PerfilGamer extends Command {
  constructor (client) {
    super(client, {
      name: 'perfil-gamer',
      aliases: ['gamer', 'gaming'],
      description: '🎮 Sistema completo de perfiles gaming con stats y búsqueda de squad'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()

    if (sub === 'configurar') await this.configurar(interaction)
    else if (sub === 'ver') await this.ver(interaction)
    else if (sub === 'buscar-squad') await this.buscarSquad(interaction)
    else if (sub === 'editar') await this.editar(interaction)
    else if (sub === 'estadisticas') await this.estadisticas(interaction)
  }

  async configurar(interaction) {
    const perfiles = load('perfiles-gamer', {})
    
    const perfil = {
      plataforma: interaction.options.getString('plataforma'),
      gamertag: interaction.options.getString('gamertag'),
      juegoPrincipal: interaction.options.getString('juego_principal') || 'No especificado',
      generoFavorito: interaction.options.getString('genero_favorito') || 'Variado',
      createdAt: Date.now()
    }

    perfiles[interaction.user.id] = perfil
    save('perfiles-gamer', perfiles)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Perfil Gamer Creado')
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '🎮 Plataforma', value: perfil.plataforma, inline: true },
        { name: '🎮 Gamertag', value: perfil.gamertag, inline: true },
        { name: '🎮 Juego Principal', value: perfil.juegoPrincipal, inline: true },
        { name: '🎮 Género Favorito', value: perfil.generoFavorito, inline: true }
      )
      .setFooter({ text: 'Usa /perfil-gamer ver para mostrar tu perfil' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  async ver(interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    const perfiles = load('perfiles-gamer', {})
    const perfil = perfiles[targetUser.id]

    if (!perfil) {
      return interaction.reply({ content: '❌ Este usuario no tiene perfil gamer.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🎮 Perfil Gamer de ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '🎮 Plataforma', value: perfil.plataforma, inline: true },
        { name: '🏷️ Gamertag', value: perfil.gamertag, inline: true },
        { name: '🎮 Juego Principal', value: perfil.juegoPrincipal, inline: true },
        { name: '🎭 Género', value: perfil.generoFavorito, inline: true }
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  async buscarSquad(interaction) {
    const juego = interaction.options.getString('juego')
    const plataforma = interaction.options.getString('plataforma')
    const tamaño = interaction.options.getInteger('tamaño') || 4

    const perfiles = load('perfiles-gamer', {})
    const matches = []

    for (const [userId, perfil] of Object.entries(perfiles)) {
      if (perfil.juegoPrincipal.toLowerCase().includes(juego.toLowerCase())) {
        if (!plataforma || perfil.plataforma === plataforma) {
          matches.push({ userId, ...perfil })
        }
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle(`🔍 Búsqueda de Squad: ${juego}`)
      .setDescription(`Buscando ${tamaño} jugadores${plataforma ? ` en ${plataforma}` : ''}`)

    if (matches.length === 0) {
      embed.addFields({ name: '❌ Sin resultados', value: 'No se encontraron jugadores para este juego.' })
    } else {
      matches.slice(0, tamaño).forEach(match => {
        embed.addFields({
          name: `${match.gamertag} (${match.plataforma})`,
          value: `<@${match.userId}> - ${match.generoFavorito}`,
          inline: true
        })
      })
    }

    await interaction.reply({ embeds: [embed] })
  }

  async editar(interaction) {
    const perfiles = load('perfiles-gamer', {})
    const perfil = perfiles[interaction.user.id]

    if (!perfil) {
      return interaction.reply({ content: '❌ No tienes perfil. Usa `/perfil-gamer configurar`.', ephemeral: true })
    }

    const campo = interaction.options.getString('campo')
    const valor = interaction.options.getString('valor')

    const campos = {
      'gamertag': 'gamertag',
      'juego': 'juegoPrincipal',
      'plataforma': 'plataforma',
      'genero': 'generoFavorito'
    }

    perfil[campos[campo]] = valor
    perfiles[interaction.user.id] = perfil
    save('perfiles-gamer', perfiles)

    await interaction.reply({ content: `✅ **${campo}** actualizado a: ${valor}`, ephemeral: true })
  }

  async estadisticas(interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    const perfiles = load('perfiles-gamer', {})
    const perfil = perfiles[targetUser.id]

    if (!perfil) {
      return interaction.reply({ content: '❌ Este usuario no tiene perfil gamer.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0xfaa61a)
      .setTitle(`📊 Estadísticas de ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '🎮 Perfil creado', value: `<t:${Math.floor(perfil.createdAt / 1000)}:R>`, inline: true },
        { name: '🎮 Plataforma', value: perfil.plataforma, inline: true },
        { name: '🎮 Juegos jugados', value: '1', inline: true }
      )
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
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
              choices: [
                { name: '🖥️ Steam', value: 'steam' },
                { name: '🎮 Xbox', value: 'xbox' },
                { name: '🎮 PlayStation', value: 'psn' },
                { name: '🎮 Nintendo Switch', value: 'switch' },
                { name: '💎 Epic Games', value: 'epic' },
                { name: '📱 Mobile', value: 'mobile' }
              ]
            },
            { type: 3, name: 'gamertag', description: 'Tu gamertag/nickname', required: true },
            { type: 3, name: 'juego_principal', description: 'Tu juego principal', required: false },
            {
              type: 3,
              name: 'genero_favorito',
              description: 'Tu género favorito',
              required: false,
              choices: [
                { name: '🔫 FPS', value: 'fps' },
                { name: '⚔️ RPG', value: 'rpg' },
                { name: '🏆 MOBA', value: 'moba' },
                { name: '🎯 Battle Royale', value: 'battle_royale' },
                { name: '⚽ Deportes', value: 'sports' },
                { name: '🏎️ Carreras', value: 'racing' },
                { name: '🌲 Supervivencia', value: 'survival' },
                { name: '🧱 Sandbox', value: 'sandbox' },
                { name: '🧠 Estrategia', value: 'strategy' },
                { name: '👻 Terror', value: 'horror' },
                { name: '🎲 Casual', value: 'casual' }
              ]
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
              choices: [
                { name: '🖥️ Steam', value: 'steam' },
                { name: '🎮 Xbox', value: 'xbox' },
                { name: '🎮 PlayStation', value: 'psn' },
                { name: '🎮 Nintendo Switch', value: 'switch' },
                { name: '💎 Epic Games', value: 'epic' },
                { name: '📱 Mobile', value: 'mobile' }
              ]
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
