const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class PerfilGamer extends Command {
  constructor (client) {
    super(client, {
      name: 'perfil-gamer',
      aliases: ['gamer', 'gaming'],
      description: '🎮 Sistema completo de perfiles gaming con stats, plataformas y búsqueda de squads'
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
    const plataforma = interaction.options.getString('plataforma')
    const gamertag = interaction.options.getString('gamertag')
    const juegoPrincipal = interaction.options.getString('juego_principal') || 'No especificado'
    const genero = interaction.options.getString('genero_favorito') || 'Variado'

    const data = { plataforma, gamertag, juegoPrincipal, genero, createdAt: Date.now() }
    
    const perfiles = load('gamer-profiles', {})
    perfiles[interaction.user.id] = data
    save('gamer-profiles', perfiles)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Perfil Gamer Configurado')
      .addFields(
        { name: '🎮 Plataforma', value: plataforma, inline: true },
        { name: '🎯 Gamertag', value: gamertag, inline: true },
        { name: '🎮 Juego Principal', value: juegoPrincipal, inline: false },
        { name: '🎯 Género Favorito', value: genero, inline: false }
      )

    await interaction.reply({ embeds: [embed] })
  }

  async ver(interaction) {
    const usuario = interaction.options.getUser('usuario') || interaction.user
    const perfiles = load('gamer-profiles', {})
    const data = perfiles[usuario.id]

    if (!data) {
      return interaction.reply({ content: '❌ Este usuario no tiene perfil gamer.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🎮 Perfil Gamer de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL())
      .addFields(
        { name: '🎮 Plataforma', value: data.plataforma, inline: true },
        { name: '🎯 Gamertag', value: data.gamertag, inline: true },
        { name: '🎮 Juego Principal', value: data.juegoPrincipal, inline: false },
        { name: '🎯 Género', value: data.genero, inline: false }
      )

    await interaction.reply({ embeds: [embed] })
  }

  async buscarSquad(interaction) {
    await interaction.reply({ content: '🔍 Buscando jugadores... (Función en desarrollo)', ephemeral: true })
  }

  async editar(interaction) {
    await interaction.reply({ content: '⚙️ Editar perfil... (Función en desarrollo)', ephemeral: true })
  }

  async estadisticas(interaction) {
    await interaction.reply({ content: '📊 Estadísticas... (Función en desarrollo)', ephemeral: true })
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
