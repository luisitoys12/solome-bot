const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

module.exports = class Help extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      aliases: ['ayuda', 'comandos'],
      description: '📚 Menú de ayuda con todos los comandos disponibles'
    })
  }

  async runSlash (interaction) {
    const categoria = interaction.options.getString('categoria')

    if (categoria) {
      return this.showCategory(interaction, categoria)
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📚 Menú de Ayuda - SOLOME Bot')
      .setDescription('Selecciona una categoría para ver los comandos disponibles')
      .addFields(
        { name: '🎵 Música', value: 'Reproduce música de YouTube, Spotify y más', inline: true },
        { name: '📻 Radio', value: 'Escucha estaciones de radio en vivo', inline: true },
        { name: '🎮 Diversión', value: 'Juegos, entretenimiento y mini-juegos', inline: true },
        { name: '🛡️ Moderación', value: 'Herramientas de moderación', inline: true },
        { name: '🔧 Utilidad', value: 'Comandos útiles variados', inline: true },
        { name: '⚙️ Administración', value: 'Configuración del servidor', inline: true },
        { name: '🎮 Gamer', value: 'Perfiles gaming y LFG', inline: true },
        { name: '⭐ Premium', value: 'Funciones premium exclusivas', inline: true }
      )
      .setFooter({ text: 'Usa /help categoria:NOMBRE para ver comandos específicos' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  async showCategory(interaction, cat) {
    const categories = {
      MUSIC: {
        name: '🎵 Música',
        commands: '/play, /skip, /stop, /queue, /premium-music'
      },
      RADIO: {
        name: '📻 Radio',
        commands: '/radio, /radioinfo, /premium-radio'
      },
      FUN: {
        name: '🎮 Diversión',
        commands: '/duelo, /loteria, /ruleta, /slots, /entretenimiento'
      },
      MODERATION: {
        name: '🛡️ Moderación',
        commands: '/moderar, /ban, /kick, /clear, /warn'
      },
      UTILITY: {
        name: '🔧 Utilidad',
        commands: '/clima, /traducir, /recordatorio, /download, /noticias'
      },
      ADMIN: {
        name: '⚙️ Administración',
        commands: '/setup, /config, /announce'
      },
      GAMER: {
        name: '🎮 Gamer',
        commands: '/perfil-gamer, /alter-ego, /stream'
      },
      PREMIUM: {
        name: '⭐ Premium',
        commands: '/vip, /premium-music, /premium-radio'
      }
    }

    const category = categories[cat]
    if (!category) {
      return interaction.reply({ content: '❌ Categoría no encontrada', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(category.name)
      .setDescription(`**Comandos disponibles:**\n${category.commands}`)
      .setFooter({ text: 'Usa /help para ver todas las categorías' })

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'categoria',
          description: 'Selecciona una categoría específica',
          required: false,
          choices: [
            { name: '🎵 Música', value: 'MUSIC' },
            { name: '📻 Radio', value: 'RADIO' },
            { name: '🎮 Diversión', value: 'FUN' },
            { name: '🛡️ Moderación', value: 'MODERATION' },
            { name: '🔧 Utilidad', value: 'UTILITY' },
            { name: '⚙️ Administración', value: 'ADMIN' },
            { name: '🎮 Gamer', value: 'GAMER' },
            { name: '⭐ Premium', value: 'PREMIUM' }
          ]
        }
      ]
    }
  }
}
