const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

module.exports = class Help extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      aliases: ['ayuda', 'comandos'],
      description: 'Muestra todos los comandos disponibles del bot organizados por categorías'
    })
  }

  async runSlash (interaction) {
    const categoria = interaction.options.getString('categoria')

    if (!categoria) {
      return this.showMainMenu(interaction)
    }

    return this.showCategory(interaction, categoria)
  }

  async showMainMenu(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('👋 Ayuda - BabaRadio Bot')
      .setDescription(
        'Selecciona una categoría para ver los comandos disponibles.\n\n' +
        '**Categorías Disponibles:**\n' +
        '🎵 Música - Comandos de reproducción\n' +
        '📻 Radio - Estaciones de radio\n' +
        '🎮 Diversión - Juegos y entretenimiento\n' +
        '🛡️ Moderación - Herramientas de moderación\n' +
        '🔧 Utilidad - Comandos útiles\n' +
        '⚙️ Administración - Comandos admin\n' +
        '🎮 Gamer - Perfiles gaming\n' +
        '⭐ Premium - Funciones premium'
      )
      .setFooter({ text: 'Usa /help [categoria] para ver comandos específicos' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  async showCategory(interaction, cat) {
    const categories = {
      MUSIC: {
        name: '🎵 Música',
        commands: ['/play', '/queue', '/skip', '/stop', '/music', '/lyrics']
      },
      RADIO: {
        name: '📻 Radio',
        commands: ['/radio', '/radioinfo']
      },
      FUN: {
        name: '🎮 Diversión',
        commands: ['/8ball', '/coinflip', '/dice', '/duelo', '/tictactoe', '/connect4', '/loteria']
      },
      MODERATION: {
        name: '🛡️ Moderación',
        commands: ['/ban', '/kick', '/timeout', '/warn', '/clear', '/lock', '/unlock', '/slowmode']
      },
      UTILITY: {
        name: '🔧 Utilidad',
        commands: ['/ping', '/help', '/userinfo', '/serverinfo', '/avatar', '/uptime']
      },
      ADMIN: {
        name: '⚙️ Administración',
        commands: ['/announce', '/poll', '/giveaway', '/portal', '/ticket']
      },
      GAMER: {
        name: '🎮 Gamer',
        commands: ['/perfil-gamer', '/alter-ego']
      },
      PREMIUM: {
        name: '⭐ Premium',
        commands: ['/premium', '/credits']
      }
    }

    const category = categories[cat]
    if (!category) {
      return interaction.reply({ content: '❌ Categoría no encontrada.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff88)
      .setTitle(`${category.name} - Comandos`)
      .setDescription(category.commands.map(cmd => `• **${cmd}**`).join('\n'))
      .setFooter({ text: `Total: ${category.commands.length} comandos` })
      .setTimestamp()

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
            { name: '📺 Streamers', value: 'STREAM' },
            { name: '🎮 Diversión', value: 'FUN' },
            { name: '🛡️ Moderación', value: 'MODERATION' },
            { name: '🔧 Utilidad', value: 'UTILITY' },
            { name: '⚙️ Administración', value: 'ADMIN' },
            { name: '🎮 Gamer', value: 'GAMER' },
            { name: '⭐ Premium', value: 'PREMIUM' },
            { name: '👨‍💻 Desarrollador', value: 'DEVELOPER' }
          ]
        }
      ]
    }
  }
}
