const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class PerfilGamer extends Command {
  constructor (client) {
    super(client, {
      name: 'perfil-gamer',
      aliases: ['gamer', 'gaming'],
      description: '🎮 Crea y gestiona tu perfil de jugador con plataformas y juegos'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()
    
    if (sub === 'configurar') await this.configurar(interaction)
    else if (sub === 'ver') await this.ver(interaction)
    else if (sub === 'editar') await this.editar(interaction)
    else if (sub === 'buscar-squad') await this.buscarSquad(interaction)
    else if (sub === 'estadisticas') await this.estadisticas(interaction)
  }

  async configurar(interaction) {
    const perfiles = load('gamer-profiles', {})
    const userId = interaction.user.id

    perfiles[userId] = {
      plataforma: interaction.options.getString('plataforma'),
      gamertag: interaction.options.getString('gamertag'),
      juego_principal: interaction.options.getString('juego_principal') || 'No especificado',
      genero_favorito: interaction.options.getString('genero_favorito') || 'Varios'
    }

    save('gamer-profiles', perfiles)
    await interaction.reply({ content: '✅ Perfil gamer creado', ephemeral: true })
  }

  async ver(interaction) {
    const perfiles = load('gamer-profiles', {})
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    const perfil = perfiles[targetUser.id]

    if (!perfil) {
      return interaction.reply({ content: '❌ Este usuario no tiene perfil gamer', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`🎮 Perfil Gamer de ${targetUser.username}`)
      .addFields(
        { name: '🕹️ Plataforma', value: perfil.plataforma, inline: true },
        { name: '🎮 Gamertag', value: perfil.gamertag, inline: true },
        { name: '🎮 Juego', value: perfil.juego_principal },
        { name: '🎯 Género', value: perfil.genero_favorito }
      )
      .setThumbnail(targetUser.displayAvatarURL())

    await interaction.reply({ embeds: [embed] })
  }

  async editar(interaction) {
    const perfiles = load('gamer-profiles', {})
    const perfil = perfiles[interaction.user.id]

    if (!perfil) {
      return interaction.reply({ content: '❌ No tienes perfil. Usa `/perfil-gamer configurar`', ephemeral: true })
    }

    const campo = interaction.options.getString('campo')
    const valor = interaction.options.getString('valor')
    perfil[campo] = valor

    save('gamer-profiles', perfiles)
    await interaction.reply({ content: `✅ ${campo} actualizado`, ephemeral: true })
  }

  async buscarSquad(interaction) {
    await interaction.reply('🔍 Buscando jugadores... (próximamente)')
  }

  async estadisticas(interaction) {
    await interaction.reply('📊 Estadísticas (próximamente)')
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
                { name: '⚽ Deportes', value: 'sports' }
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
                { name: 'Juego Principal', value: 'juego_principal' }
              ]
            },
            { type: 3, name: 'valor', description: 'Nuevo valor', required: true }
          ]
        },
        {
          type: 1,
          name: 'buscar-squad',
          description: 'Busca compañeros de juego',
          options: [
            { type: 3, name: 'juego', description: 'Juego para buscar squad', required: true }
          ]
        },
        {
          type: 1,
          name: 'estadisticas',
          description: 'Ver estadísticas de gaming'
        }
      ]
    }
  }
}
