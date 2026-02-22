// fix-commands-v2.js - Reparador mejorado que NO salta ningún comando
const fs = require('fs')
const path = require('path')

const commandsPath = path.join(__dirname, 'src', 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

console.log('🔧 Reparador Mejorado v2 - NO SALTA COMANDOS\n')

let fixed = 0
let alreadyFixed = 0
let errors = []

// Definir opciones específicas para cada comando
const COMMAND_OPTIONS = {
  // Música
  play: [
    { type: 3, name: 'cancion', description: 'Nombre de la canción, URL de YouTube/Spotify/SoundCloud o enlace MP3', required: true }
  ],
  lyrics: [
    { type: 3, name: 'cancion', description: 'Nombre de la canción', required: false }
  ],
  
  // Radio
  radio: [
    { type: 3, name: 'estacion', description: 'Nombre de la estación de radio', required: true },
    { type: 3, name: 'fuente', description: 'Fuente de búsqueda', required: false, choices: [
      { name: 'Todas las fuentes', value: 'all' },
      { name: 'iHeartRadio', value: 'iheart' },
      { name: 'TuneIn', value: 'tunein' },
      { name: 'MyTuner', value: 'mytuner' }
    ]}
  ],
  
  // Moderación
  ban: [
    { type: 6, name: 'usuario', description: 'Usuario a banear', required: true },
    { type: 3, name: 'razon', description: 'Razón del baneo', required: false }
  ],
  kick: [
    { type: 6, name: 'usuario', description: 'Usuario a expulsar', required: true },
    { type: 3, name: 'razon', description: 'Razón de la expulsión', required: false }
  ],
  timeout: [
    { type: 6, name: 'usuario', description: 'Usuario a silenciar', required: true },
    { type: 4, name: 'duracion', description: 'Duración en minutos', required: true, min_value: 1, max_value: 40320 },
    { type: 3, name: 'razon', description: 'Razón del timeout', required: false }
  ],
  warn: [
    { type: 6, name: 'usuario', description: 'Usuario a advertir', required: true },
    { type: 3, name: 'razon', description: 'Razón de la advertencia', required: true }
  ],
  unban: [
    { type: 3, name: 'userid', description: 'ID del usuario a desbanear', required: true },
    { type: 3, name: 'razon', description: 'Razón del desbaneo', required: false }
  ],
  clear: [
    { type: 4, name: 'cantidad', description: 'Número de mensajes a eliminar', required: true, min_value: 1, max_value: 100 }
  ],
  lock: [
    { type: 7, name: 'canal', description: 'Canal a bloquear (opcional)', required: false }
  ],
  unlock: [
    { type: 7, name: 'canal', description: 'Canal a desbloquear (opcional)', required: false }
  ],
  slowmode: [
    { type: 4, name: 'segundos', description: 'Tiempo de slowmode en segundos (0 para desactivar)', required: true, min_value: 0, max_value: 21600 }
  ],
  
  // Utilidad
  avatar: [
    { type: 6, name: 'usuario', description: 'Usuario a consultar (opcional)', required: false }
  ],
  userinfo: [
    { type: 6, name: 'usuario', description: 'Usuario a consultar (opcional)', required: false }
  ],
  wikipedia: [
    { type: 3, name: 'busqueda', description: 'Término a buscar en Wikipedia', required: true }
  ],
  
  // Diversión
  '8ball': [
    { type: 3, name: 'pregunta', description: 'Tu pregunta para la bola mágica', required: true }
  ],
  gif: [
    { type: 3, name: 'busqueda', description: 'Término a buscar', required: true }
  ],
  meme: [
    { type: 3, name: 'categoria', description: 'Categoría del meme (opcional)', required: false }
  ],
  
  // Admin
  announce: [
    { type: 7, name: 'canal', description: 'Canal donde enviar el anuncio', required: true },
    { type: 3, name: 'mensaje', description: 'Mensaje del anuncio', required: true }
  ],
  poll: [
    { type: 3, name: 'pregunta', description: 'Pregunta de la encuesta', required: true },
    { type: 3, name: 'opciones', description: 'Opciones separadas por coma', required: true }
  ],
  giveaway: [
    { type: 3, name: 'premio', description: 'Premio del sorteo', required: true },
    { type: 3, name: 'duracion', description: 'Duración (ej: 1h, 30m, 1d)', required: true },
    { type: 4, name: 'ganadores', description: 'Número de ganadores', required: false, min_value: 1, max_value: 20 }
  ]
}

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  let content = fs.readFileSync(filePath, 'utf-8')
  
  // Saltar si ya tiene getSlashCommandData
  if (content.includes('getSlashCommandData')) {
    console.log(`✅ ${file} - Ya reparado`)
    alreadyFixed++
    continue
  }
  
  // Saltar moderation.js que no es un comando
  if (file === 'moderation.js') {
    console.log(`⚠️ ${file} - No es un comando (helper module)`)
    continue
  }
  
  try {
    // Extraer información del comando
    const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/)
    const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/)
    
    if (!nameMatch) {
      errors.push({ file, reason: 'No se pudo extraer name' })
      console.log(`❌ ${file} - No se encontró name en constructor`)
      continue
    }
    
    const cmdName = nameMatch[1]
    let cmdDesc = descMatch ? descMatch[1] : `Comando ${cmdName}`
    
    // Si no tiene description, usar una genérica
    if (!cmdDesc || cmdDesc.length === 0) {
      cmdDesc = `Ejecuta el comando ${cmdName}`
      console.log(`⚠️ ${file} - Sin description, usando genérica`)
    }
    
    // Obtener opciones específicas del comando
    const options = COMMAND_OPTIONS[cmdName] || []
    
    // Construir código de opciones
    let optionsCode = ''
    if (options.length > 0) {
      optionsCode = ',\n      options: ' + JSON.stringify(options, null, 8).replace(/^/gm, '      ')
    }
    
    // Construir método getSlashCommandData
    const methodCode = `\n  getSlashCommandData() {\n    return {\n      name: '${cmdName}',\n      description: '${cmdDesc.replace(/'/g, "\\'")}'${optionsCode}\n    }\n  }\n}`
    
    // Encontrar último }
    const lastBraceIndex = content.lastIndexOf('}')
    if (lastBraceIndex === -1) {
      errors.push({ file, reason: 'No se encontró cierre de clase' })
      console.log(`❌ ${file} - Estructura de clase inválida`)
      continue
    }
    
    // Reemplazar
    content = content.substring(0, lastBraceIndex) + methodCode
    
    // Guardar
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`✅ ${file} - /${cmdName} reparado exitosamente`)
    fixed++
    
  } catch (error) {
    errors.push({ file, reason: error.message })
    console.log(`❌ ${file} - Error: ${error.message}`)
  }
}

console.log('\n' + '='.repeat(50))
console.log('📊 RESUMEN FINAL:\n')
console.log(`   ✅ Reparados ahora: ${fixed}`)
console.log(`   ✅ Ya estaban OK: ${alreadyFixed}`)
console.log(`   ❌ Errores: ${errors.length}`)
console.log(`   📦 Total procesados: ${commandFiles.length}`)

if (errors.length > 0) {
  console.log('\n❌ ERRORES ENCONTRADOS:\n')
  errors.forEach(err => {
    console.log(`   • ${err.file}: ${err.reason}`)
  })
}

const totalOK = fixed + alreadyFixed
console.log(`\n🎉 Total de comandos funcionando: ${totalOK}/${commandFiles.length}`)
console.log('\n👉 Ahora ejecuta: npm run register\n')
