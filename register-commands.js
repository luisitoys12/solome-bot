require('dotenv').config()
const { REST, Routes } = require('discord.js')
const fs = require('fs')
const path = require('path')

console.log('🔄 Cargando comandos desde src/commands/...')

const commands = []
const commandsPath = path.join(__dirname, 'src', 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

console.log(`📂 Encontrados ${commandFiles.length} archivos de comandos`)

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  
  try {
    // Clear cache para asegurar que se cargue la versión más reciente
    delete require.cache[require.resolve(filePath)]
    
    const CommandClass = require(filePath)
    
    // Si el archivo exporta una clase
    if (typeof CommandClass === 'function') {
      const commandInstance = new CommandClass({ user: { id: 'temp' } })
      
      // Verifica si tiene el método getSlashCommandData
      if (typeof commandInstance.getSlashCommandData === 'function') {
        const commandData = commandInstance.getSlashCommandData()
        commands.push(commandData)
        console.log(`  ✅ ${file} - /${commandData.name}`)
      } else {
        console.log(`  ⚠️ ${file} - No tiene getSlashCommandData(), saltando...`)
      }
    } else {
      console.log(`  ⚠️ ${file} - No es una clase Command válida`)
    }
  } catch (error) {
    console.error(`  ❌ Error cargando ${file}:`, error.message)
  }
}

console.log(`\n📦 Total de comandos a registrar: ${commands.length}`)

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || process.env.DISCORD_TOKEN)
const clientId = process.env.CLIENT_ID || '1199449712827318312'

;(async () => {
  try {
    console.log('\n🚀 Registrando comandos slash...')

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    )

    console.log(`\n✅ ¡${data.length} comandos registrados exitosamente!`)
    console.log('\n🌟 Comandos disponibles:')
    
    // Agrupar por categorías aproximadas
    const commandsByType = {
      music: [],
      radio: [],
      games: [],
      moderation: [],
      utility: [],
      other: []
    }
    
    data.forEach(cmd => {
      const name = cmd.name
      if (['play', 'music', 'queue', 'skip', 'stop', 'lyrics'].includes(name)) {
        commandsByType.music.push(name)
      } else if (['radio', 'radioinfo'].includes(name)) {
        commandsByType.radio.push(name)
      } else if (['duelo', 'tictactoe', 'connect4', '8ball', 'coinflip', 'dice', 'meme', 'gif', 'loteria'].includes(name)) {
        commandsByType.games.push(name)
      } else if (['ban', 'kick', 'timeout', 'warn', 'clear', 'lock', 'unlock', 'slowmode', 'unban'].includes(name)) {
        commandsByType.moderation.push(name)
      } else if (['help', 'ping', 'serverinfo', 'userinfo', 'avatar', 'botinfo', 'uptime', 'wikipedia', 'commands'].includes(name)) {
        commandsByType.utility.push(name)
      } else {
        commandsByType.other.push(name)
      }
    })
    
    if (commandsByType.music.length > 0) {
      console.log(`  🎵 Música (${commandsByType.music.length}): ${commandsByType.music.map(c => `/${c}`).join(', ')}`)
    }
    if (commandsByType.radio.length > 0) {
      console.log(`  📻 Radio (${commandsByType.radio.length}): ${commandsByType.radio.map(c => `/${c}`).join(', ')}`)
    }
    if (commandsByType.games.length > 0) {
      console.log(`  🎮 Juegos (${commandsByType.games.length}): ${commandsByType.games.map(c => `/${c}`).join(', ')}`)
    }
    if (commandsByType.moderation.length > 0) {
      console.log(`  🛡️ Moderación (${commandsByType.moderation.length}): ${commandsByType.moderation.map(c => `/${c}`).join(', ')}`)
    }
    if (commandsByType.utility.length > 0) {
      console.log(`  🔧 Utilidad (${commandsByType.utility.length}): ${commandsByType.utility.map(c => `/${c}`).join(', ')}`)
    }
    if (commandsByType.other.length > 0) {
      console.log(`  ✨ Otros (${commandsByType.other.length}): ${commandsByType.other.map(c => `/${c}`).join(', ')}`)
    }
    
    // Destacar comandos nuevos
    const newCommands = ['stream', 'duelo']
    const registeredNewCommands = data.filter(cmd => newCommands.includes(cmd.name))
    
    if (registeredNewCommands.length > 0) {
      console.log(`\n🎉 Comandos NUEVOS registrados:`)
      registeredNewCommands.forEach(cmd => {
        console.log(`  ✨ /${cmd.name} - ${cmd.description}`)
      })
    }
    
    console.log('\n✅ Comandos listos para usar en Discord!')
    console.log('👉 Espera 1-2 minutos para que Discord los sincronice globalmente.')
    
  } catch (error) {
    console.error('\n❌ Error al registrar comandos:', error)
    if (error.code === 'TOKEN_INVALID') {
      console.error('🔑 Token inválido. Verifica tu .env')
    } else if (error.code === 50001) {
      console.error('🚫 El bot no tiene permisos. Verifica el CLIENT_ID en .env')
    }
  }
})()
