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
  new SlashCommandBuilder()
    .setName('radioinfo')
    .setDescription('Información sobre las fuentes de radio disponibles'),
  
  // NEW: Lottery system
  new SlashCommandBuilder()
    .setName('loteria')
    .setDescription('🎰 Sistema de lotería del servidor - ¡Compra boletos y gana premios!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('jugar')
        .setDescription('Compra boletos para la lotería')
        .addIntegerOption(option =>
          option.setName('boletos')
            .setDescription('Número de boletos a comprar (1-100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Muestra el estado actual de la lotería')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('sortear')
        .setDescription('Realiza el sorteo actual (solo admins)')
    ),
  
  // NEW: Gamer profile system
  new SlashCommandBuilder()
    .setName('perfil-gamer')
    .setDescription('🎮 Sistema de perfiles para gamers - ¡Muestra tu identidad gaming!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('configurar')
        .setDescription('Configura tu perfil de gamer')
        .addStringOption(option =>
          option.setName('plataforma')
            .setDescription('Tu plataforma principal')
            .setRequired(true)
            .addChoices(
              { name: '🖥️ Steam', value: 'steam' },
              { name: '🎮 Xbox', value: 'xbox' },
              { name: '🎮 PlayStation', value: 'psn' },
              { name: '🎮 Nintendo Switch', value: 'switch' },
              { name: '💎 Epic Games', value: 'epic' },
              { name: '📱 Mobile', value: 'mobile' }
            )
        )
        .addStringOption(option =>
          option.setName('gamertag')
            .setDescription('Tu gamertag/username')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('juego_principal')
            .setDescription('Tu juego principal')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('genero_favorito')
            .setDescription('Tu género favorito')
            .setRequired(false)
            .addChoices(
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
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ver')
        .setDescription('Ve el perfil de un gamer')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuario a ver (deja vacío para ver el tuyo)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('buscar-squad')
        .setDescription('Encuentra jugadores para tu squad')
        .addStringOption(option =>
          option.setName('juego')
            .setDescription('Juego para buscar compañeros')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('plataforma')
            .setDescription('Plataforma (opcional)')
            .setRequired(false)
            .addChoices(
              { name: '🖥️ Steam', value: 'steam' },
              { name: '🎮 Xbox', value: 'xbox' },
              { name: '🎮 PlayStation', value: 'psn' },
              { name: '🎮 Nintendo Switch', value: 'switch' },
              { name: '💎 Epic Games', value: 'epic' },
              { name: '📱 Mobile', value: 'mobile' }
            )
        )
        .addIntegerOption(option =>
          option.setName('tamaño')
            .setDescription('Tamaño del squad (2-10 jugadores)')
            .setRequired(false)
            .setMinValue(2)
            .setMaxValue(10)
        )
    ),
  
  // NEW: Alter-ego/Therian system
  new SlashCommandBuilder()
    .setName('alter-ego')
    .setDescription('🐾 Sistema de alter-ego para therians, furries y otherkin')
    .addSubcommand(subcommand =>
      subcommand
        .setName('configurar')
        .setDescription('Configura tu alter-ego/therian identity')
        .addStringOption(option =>
          option.setName('especie')
            .setDescription('Tu especie/kintype')
            .setRequired(true)
            .addChoices(
              { name: '🐺 Lobo', value: 'lobo' },
              { name: '🦊 Zorro', value: 'zorro' },
              { name: '🐱 Gato', value: 'gato' },
              { name: '🐶 Perro', value: 'perro' },
              { name: '🦁 León', value: 'leon' },
              { name: '🐅 Tigre', value: 'tigre' },
              { name: '🐻 Oso', value: 'oso' },
              { name: '🐰 Conejo', value: 'conejo' },
              { name: '🐉 Dragón', value: 'dragon' },
              { name: '🦅 Águila', value: 'aguila' },
              { name: '🦤 Cuervo', value: 'cuervo' },
              { name: '🦉 Búho', value: 'buho' },
              { name: '🦝 Mapache', value: 'mapache' },
              { name: '🦌 Venado', value: 'venado' },
              { name: '✨ Otro', value: 'otro' }
            )
        )
        .addStringOption(option =>
          option.setName('nombre')
            .setDescription('Nombre de tu alter-ego (opcional)')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('pronombres')
            .setDescription('Tus pronombres preferidos')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('descripcion')
            .setDescription('Descripción breve de tu identidad')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('ver')
        .setDescription('Ve el alter-ego de alguien')
        .addUserOption(option =>
          option.setName('usuario')
            .setDescription('Usuario a ver (deja vacío para ver el tuyo)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('howl')
        .setDescription('Expresa tu identidad therian/furry')
        .addStringOption(option =>
          option.setName('mensaje')
            .setDescription('Mensaje adicional (opcional)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('comunidad')
        .setDescription('Estadísticas de la comunidad therian/furry del servidor')
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
    ),
  
  // New moderation commands
  new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbanea a un usuario')
    .addStringOption(option =>
      option.setName('usuario')
        .setDescription('ID del usuario a desbanear')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Establece modo lento')
    .addIntegerOption(option =>
      option.setName('segundos')
        .setDescription('Segundos de espera (0-21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    ),
  
  // New info commands
  new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Información del servidor'),
  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Información de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario a consultar')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Muestra el avatar de un usuario')
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('Usuario')
        .setRequired(false)
    ),
  
  // New utility commands
  new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Crea una encuesta')
    .addStringOption(option =>
      option.setName('pregunta')
        .setDescription('Pregunta de la encuesta')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Muestra la latencia del bot'),
  new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Invita el bot a tu servidor'),
  
  // New fun commands
  new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Lanza una moneda'),
  new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Tira un dado')
    .addIntegerOption(option =>
      option.setName('lados')
        .setDescription('Número de lados del dado')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(100)
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
    console.log('📋 New commands added:')
    console.log('  🎰 /loteria - Sistema de lotería con premios')
    console.log('  🎮 /perfil-gamer - Perfiles gaming y buscar squad')
    console.log('  🐾 /alter-ego - Identidad therian/furry')
    console.log('\nAll commands:', data.map(cmd => `/${cmd.name}`).join(', '))
  } catch (error) {
    console.error('❌ Error registering commands:', error)
  }
})()
