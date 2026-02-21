// src/commands/help.js
const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

const CATEGORIES = [
  {
    key: 'MUSIC',
    name: '🎵 Música',
    emoji: '🎵',
    description: 'Comandos de reproducción musical',
    commands: [
      { name: '/play', desc: 'Reproduce una canción desde YouTube, Spotify, etc.' },
      { name: '/music', desc: 'Panel de control de música' },
      { name: '/queue', desc: 'Muestra la cola de reproducción' },
      { name: '/skip', desc: 'Salta a la siguiente canción' },
      { name: '/stop', desc: 'Detiene la reproducción y limpia la cola' },
      { name: '/lyrics', desc: 'Muestra la letra de la canción actual' }
    ]
  },
  {
    key: 'RADIO',
    name: '📻 Radio',
    emoji: '📻',
    description: '200,000+ estaciones de todo el mundo',
    commands: [
      { name: '/radio', desc: 'Busca y reproduce estaciones de radio (iHeart, TuneIn, MyTuner)' },
      { name: '/radioinfo', desc: 'Información de la estación actual' }
    ]
  },
  {
    key: 'STREAM',
    name: '📺 Streamers',
    emoji: '📺',
    description: 'Herramientas para creadores de contenido',
    commands: [
      { name: '/stream configurar', desc: 'Configura anuncios de Twitch/Kick/YouTube' },
      { name: '/stream live', desc: 'Anuncia que estás en vivo' },
      { name: '/stream info', desc: 'Ver configuración actual' }
    ]
  },
  {
    key: 'FUN',
    name: '🎮 Diversión',
    emoji: '🎮',
    description: 'Juegos y entretenimiento',
    commands: [
      { name: '/duelo', desc: 'Piedra, papel o tijeras con botones interactivos' },
      { name: '/tictactoe', desc: 'Juego de tres en raya' },
      { name: '/connect4', desc: 'Juego de conecta 4' },
      { name: '/8ball', desc: 'Pregunta a la bola mágica' },
      { name: '/coinflip', desc: 'Lanza una moneda' },
      { name: '/dice', desc: 'Lanza un dado' },
      { name: '/meme', desc: 'Meme aleatorio' },
      { name: '/gif', desc: 'Busca un GIF' },
      { name: '/loteria', desc: 'Sistema de lotería del servidor' }
    ]
  },
  {
    key: 'MODERATION',
    name: '🛡️ Moderación',
    emoji: '🛡️',
    description: 'Herramientas para moderadores',
    commands: [
      { name: '/ban', desc: 'Banea a un usuario' },
      { name: '/kick', desc: 'Expulsa a un usuario' },
      { name: '/timeout', desc: 'Silencia temporalmente a un usuario' },
      { name: '/warn', desc: 'Advierte a un usuario' },
      { name: '/clear', desc: 'Elimina mensajes en masa' },
      { name: '/lock', desc: 'Bloquea un canal' },
      { name: '/unlock', desc: 'Desbloquea un canal' },
      { name: '/slowmode', desc: 'Configura modo lento' },
      { name: '/unban', desc: 'Desbanea a un usuario' }
    ]
  },
  {
    key: 'UTILITY',
    name: '🔧 Utilidad',
    emoji: '🔧',
    description: 'Comandos útiles',
    commands: [
      { name: '/ping', desc: 'Muestra la latencia del bot' },
      { name: '/serverinfo', desc: 'Información del servidor' },
      { name: '/userinfo', desc: 'Información de un usuario' },
      { name: '/avatar', desc: 'Muestra el avatar de un usuario' },
      { name: '/botinfo', desc: 'Información del bot' },
      { name: '/uptime', desc: 'Tiempo activo del bot' },
      { name: '/wikipedia', desc: 'Busca en Wikipedia' },
      { name: '/commands', desc: 'Lista de comandos disponibles' }
    ]
  },
  {
    key: 'ADMIN',
    name: '⚙️ Administración',
    emoji: '⚙️',
    description: 'Gestión del servidor',
    commands: [
      { name: '/announce', desc: 'Envía un anuncio' },
      { name: '/giveaway', desc: 'Crea un sorteo' },
      { name: '/poll', desc: 'Crea una encuesta' },
      { name: '/ticket', desc: 'Sistema de tickets' },
      { name: '/portal', desc: 'Crea un portal entre canales' },
      { name: '/moderation', desc: 'Panel de moderación' },
      { name: '/entretenimiento', desc: 'Panel de entretenimiento' }
    ]
  },
  {
    key: 'GAMER',
    name: '🎮 Gamer',
    emoji: '🎮',
    description: 'Perfiles y comunidad gamer',
    commands: [
      { name: '/perfil-gamer', desc: 'Crea/edita tu perfil gamer' },
      { name: '/alter-ego', desc: 'Define tu alter-ego/therian/fursona' }
    ]
  },
  {
    key: 'PREMIUM',
    name: '⭐ Premium',
    emoji: '⭐',
    description: 'Funciones premium y especiales',
    commands: [
      { name: '/premium', desc: 'Información de funciones premium' },
      { name: '/credits', desc: 'Sistema de créditos del bot' }
    ]
  },
  {
    key: 'DEVELOPER',
    name: '👨‍💻 Desarrollador',
    emoji: '👨‍💻',
    description: 'Comandos para el dueño del bot',
    commands: [
      { name: '/eval', desc: 'Ejecuta código JavaScript (solo owner)' },
      { name: '/debug', desc: 'Información de debug' }
    ]
  }
]

function getCategoryEmbed(categoryKey, client) {
  const category = CATEGORIES.find(c => c.key === categoryKey)
  if (!category) return null

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`${category.emoji} ${category.name}`)
    .setDescription(`**${category.description}**\n\n${category.commands.map(cmd => `• **${cmd.name}** - ${cmd.desc}`).join('\n')}`)
    .setFooter({ text: 'Solome Bot 4.0 • Baba Radio' })
    .setTimestamp()

  if (client && client.user) {
    embed.setThumbnail(client.user.displayAvatarURL())
  }

  return embed
}

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      description: 'Muestra todos los comandos disponibles organizados por categoría'
    })
  }

  async runSlash(interaction) {
    const categoryKey = interaction.options.getString('categoria')

    // Si se pidió una categoría específica
    if (categoryKey) {
      const embed = getCategoryEmbed(categoryKey, this.client)
      if (embed) {
        return interaction.reply({ embeds: [embed] })
      }
      return interaction.reply({ content: '❌ Categoría no encontrada.', ephemeral: true })
    }

    // Mostrar todas las categorías
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📚 Solome Bot 4.0 - Centro de Ayuda')
      .setDescription(
        '**🎵 Bot de Música y Radio con 200,000+ Estaciones**\n\n'
        + 'Selecciona una categoría del menú abajo para ver los comandos disponibles.'
      )
      .addFields(
        {
          name: '🎵 Música',
          value: '`/play` `/queue` `/skip` `/stop`\nReproducción musical ilimitada',
          inline: true
        },
        {
          name: '📻 Radio',
          value: '`/radio` `/radioinfo`\n**200,000+ estaciones** mundiales',
          inline: true
        },
        {
          name: '📺 Streamers',
          value: '`/stream` anuncios\nTwitch, Kick, YouTube',
          inline: true
        },
        {
          name: '🎮 Diversión',
          value: '`/duelo` `/tictactoe` `/loteria`\nJuegos interactivos',
          inline: true
        },
        {
          name: '🛡️ Moderación',
          value: '`/ban` `/kick` `/timeout`\nHerramientas de moderación',
          inline: true
        },
        {
          name: '🔧 Utilidad',
          value: '`/ping` `/serverinfo` `/avatar`\nComandos útiles',
          inline: true
        }
      )
      .addFields({
        name: '📊 Estadísticas del Bot',
        value: '**50+ Comandos** • **10 Categorías** • **200,000+ Estaciones**\n**Lavalink v4** • **Calidad hasta 320kbps** • **Uptime 24/7**',
        inline: false
      })
      .addFields({
        name: '🎧 APIs de Música',
        value: '• YouTube (oficial)\n• Spotify Web API\n• Apple Music\n• Deezer\n• SoundCloud',
        inline: true
      })
      .addFields({
        name: '📡 APIs de Radio',
        value: '• iHeartRadio (320kbps)\n• TuneIn (100,000+)\n• MyTuner\n• Radio Browser\n• Zeno.FM',
        inline: true
      })
      .addFields({
        name: '🌟 Novedades v4.0',
        value: '• Sistema de streams\n• Juego /duelo\n• Plugins Lavalink\n• Mejoras de estabilidad',
        inline: true
      })
      .addFields({
        name: '👉 Enlaces Útiles',
        value: '[GitHub](https://github.com/luisitoys12/solome-bot) • [Documentación](https://github.com/luisitoys12/solome-bot#readme) • EstacionKusTV',
        inline: false
      })
      .setThumbnail(this.client.user.displayAvatarURL())
      .setFooter({ text: 'Solome Bot 4.0 • Usa el menú para ver comandos por categoría' })
      .setTimestamp()

    // Menú de selección de categorías
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category_select')
      .setPlaceholder('📂 Selecciona una categoría para ver sus comandos')
      .addOptions(
        CATEGORIES.map(cat => ({
          label: cat.name,
          description: cat.description,
          value: cat.key,
          emoji: cat.emoji
        }))
      )

    const row = new ActionRowBuilder().addComponents(selectMenu)

    await interaction.reply({ embeds: [embed], components: [row] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3, // STRING
          name: 'categoria',
          description: 'Selecciona una categoría específica',
          required: false,
          choices: CATEGORIES.map(cat => ({
            name: cat.name,
            value: cat.key
          }))
        }
      ]
    }
  }
}
