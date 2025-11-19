require('dotenv').config()
const { REST, Routes, SlashCommandBuilder } = require('discord.js')

const commands = [
  // Music commands
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce música de YouTube, Spotify, SoundCloud, MP3 y más con Lavalink')
    .addStringOption(option =>
      option.setName('cancion')
        .setDescription('Canción, URL de YouTube/Spotify/SoundCloud, o enlace MP3')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('music')
    .setDescription('Reproduce música de YouTube (comando clásico)')
    .addStringOption(option =>
      option.setName('cancion')
        .setDescription('Nombre de la canción o URL de YouTube')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('radio')
    .setDescription('Busca y reproduce estaciones de radio de iHeartRadio, TuneIn y MyTuner')
    .addStringOption(option =>
      option.setName('estacion')
        .setDescription('Nombre de la estación a buscar')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('fuente')
        .setDescription('Fuente de radio (por defecto: todas)')
        .setRequired(false)
        .addChoices(
          { name: 'Todas las fuentes', value: 'all' },
          { name: 'iHeartRadio', value: 'iheart' },
          { name: 'TuneIn', value: 'tunein' },
          { name: 'MyTuner', value: 'mytuner' }
        )
    ),
  
  // Game commands
  new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Pregunta a la bola mágica 8')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Tu pregunta para la bola 8')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Juega Gato (3 en raya) con otro usuario')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('El usuario con quien quieres jugar')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('connect4')
    .setDescription('Juega 4 en línea con otro usuario')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('El usuario con quien quieres jugar')
        .setRequired(true)
    ),
  
  // Info commands
  new SlashCommandBuilder()
    .setName('wikipedia')
    .setDescription('Busca información en Wikipedia')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Qué buscar')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Idioma de Wikipedia (por defecto: es)')
        .setRequired(false)
        .addChoices(
          { name: 'Español', value: 'es' },
          { name: 'English', value: 'en' },
          { name: 'Français', value: 'fr' },
          { name: 'Deutsch', value: 'de' },
          { name: 'Português', value: 'pt' }
        )
    ),
  new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Información sobre el bot'),
  
  // Moderation commands
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario del servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a expulsar')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón de la expulsión')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario del servidor')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a banear')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón del baneo')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('dias')
        .setDescription('Días de mensajes a eliminar (0-7)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7)
    ),
  new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Silencia temporalmente a un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a silenciar')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duracion')
        .setDescription('Duración (ej: 10m, 1h, 1d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón del silencio')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Advierte a un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a advertir')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón de la advertencia')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Elimina mensajes del canal')
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de mensajes a eliminar (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Bloquea el canal actual')
    .addStringOption(option =>
      option.setName('razon')
        .setDescription('Razón del bloqueo')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Desbloquea el canal actual'),
  
  // Utility commands
  new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Crea un sorteo en el servidor')
    .addStringOption(option =>
      option.setName('duracion')
        .setDescription('Duración del sorteo (ej: 10m, 1h, 1d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('premio')
        .setDescription('Premio del sorteo')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('ganadores')
        .setDescription('Número de ganadores (por defecto: 1)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20)
    ),
  new SlashCommandBuilder()
    .setName('portal')
    .setDescription('Accede al portal web de Baba Radio'),
  new SlashCommandBuilder()
    .setName('credits')
    .setDescription('Créditos y agradecimientos del bot'),
  
  // Ticket system
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Sistema de tickets de soporte')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Crear un nuevo ticket')
        .addStringOption(option =>
          option.setName('razon')
            .setDescription('Razón del ticket')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Cerrar el ticket actual')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Agregar usuario al ticket')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuario a agregar')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remover usuario del ticket')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuario a remover')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('panel')
        .setDescription('Crear panel de tickets')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('transcript')
        .setDescription('Guardar transcripción del ticket')
    ),
  
  // Premium
  new SlashCommandBuilder()
    .setName('premium')
    .setDescription('Información sobre Baba Radio Premium'),
  
  // Advanced music commands
  new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Muestra la letra de la canción')
    .addStringOption(option =>
      option.setName('cancion')
        .setDescription('Nombre de la canción (opcional, usa la actual si no se especifica)')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Muestra la cola de reproducción'),
  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Salta la canción actual'),
  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Detiene la música y limpia la cola'),
  
  // Utility commands
  new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Muestra el tiempo que el bot ha estado encendido'),
  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Envía un anuncio a un canal')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal donde enviar el anuncio')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('titulo')
        .setDescription('Título del anuncio')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('mensaje')
        .setDescription('Mensaje del anuncio')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Color del embed (hex)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('mencion')
        .setDescription('Mencionar a todos')
        .setRequired(false)
        .addChoices(
          { name: '@everyone', value: 'everyone' },
          { name: '@here', value: 'here' },
          { name: 'Sin mención', value: 'none' }
        )
    ),
  
  // Fun commands
  new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Muestra un meme aleatorio'),
  new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Busca un GIF')
    .addStringOption(option =>
      option.setName('busqueda')
        .setDescription('Qué buscar')
        .setRequired(true)
    )
].map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

;(async () => {
  try {
    console.log('🔄 Registering slash commands...')

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID || '1199449712827318312'),
      { body: commands }
    )

    console.log(`✅ Successfully registered ${data.length} slash commands globally!`)
    console.log('Commands:', data.map(cmd => `/${cmd.name}`).join(', '))
  } catch (error) {
    console.error('❌ Error registering commands:', error)
  }
})()
