// fix-commands.js - Script para añadir getSlashCommandData() a comandos
const fs = require('fs')
const path = require('path')

const commandsPath = path.join(__dirname, 'src', 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

console.log('🔧 Reparando comandos sin getSlashCommandData()...\n')

let fixed = 0
let skipped = 0

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  let content = fs.readFileSync(filePath, 'utf-8')
  
  // Saltar si ya tiene getSlashCommandData
  if (content.includes('getSlashCommandData')) {
    console.log(`✅ ${file} - Ya tiene getSlashCommandData()`)
    skipped++
    continue
  }
  
  // Saltar si no es una clase Command válida
  if (!content.includes('extends Command') || !content.includes('constructor')) {
    console.log(`⚠️ ${file} - No es una clase Command válida`)
    skipped++
    continue
  }
  
  try {
    // Extraer nombre y description del constructor
    const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/)
    const descMatch = content.match(/description:\s*['"]([^'"]+)['"]/)
    
    if (!nameMatch || !descMatch) {
      console.log(`❌ ${file} - No se pudo extraer name/description`)
      skipped++
      continue
    }
    
    const cmdName = nameMatch[1]
    const cmdDesc = descMatch[1]
    
    // Determinar opciones basadas en el comando
    let optionsCode = ''
    
    // Comandos de moderación con usuario y razón
    if (['ban', 'kick', 'timeout', 'warn', 'unban'].includes(cmdName)) {
      optionsCode = `,
      options: [
        {
          type: 6, // USER
          name: 'usuario',
          description: 'Usuario a ${cmdName}',
          required: true
        },
        {
          type: 3, // STRING
          name: 'razon',
          description: 'Razón de la acción',
          required: false
        }
      ]`
    }
    // Comando clear
    else if (cmdName === 'clear') {
      optionsCode = `,
      options: [
        {
          type: 4, // INTEGER
          name: 'cantidad',
          description: 'Número de mensajes a eliminar',
          required: true,
          min_value: 1,
          max_value: 100
        }
      ]`
    }
    // Comando slowmode
    else if (cmdName === 'slowmode') {
      optionsCode = `,
      options: [
        {
          type: 4, // INTEGER
          name: 'segundos',
          description: 'Tiempo de slowmode en segundos (0 para desactivar)',
          required: true,
          min_value: 0,
          max_value: 21600
        }
      ]`
    }
    // Comandos que requieren texto/query
    else if (['lyrics', 'wikipedia', 'gif', 'meme'].includes(cmdName)) {
      optionsCode = `,
      options: [
        {
          type: 3, // STRING
          name: cmdName === 'lyrics' ? 'cancion' : 'busqueda',
          description: cmdName === 'lyrics' ? 'Nombre de la canción' : 'Término de búsqueda',
          required: true
        }
      ]`
    }
    // Comando avatar/userinfo con usuario opcional
    else if (['avatar', 'userinfo'].includes(cmdName)) {
      optionsCode = `,
      options: [
        {
          type: 6, // USER
          name: 'usuario',
          description: 'Usuario a consultar (opcional)',
          required: false
        }
      ]`
    }
    // Lock/unlock con canal opcional
    else if (['lock', 'unlock'].includes(cmdName)) {
      optionsCode = `,
      options: [
        {
          type: 7, // CHANNEL
          name: 'canal',
          description: 'Canal a ${cmdName} (opcional)',
          required: false
        }
      ]`
    }
    
    // Añadir método getSlashCommandData antes del último }
    const methodCode = `
  getSlashCommandData() {
    return {
      name: '${cmdName}',
      description: '${cmdDesc}'${optionsCode}
    }
  }
}`
    
    // Reemplazar el último } con el nuevo método
    const lastBraceIndex = content.lastIndexOf('}')
    content = content.substring(0, lastBraceIndex) + methodCode
    
    // Guardar archivo
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`✅ ${file} - Reparado exitosamente`)
    fixed++
    
  } catch (error) {
    console.log(`❌ ${file} - Error: ${error.message}`)
    skipped++
  }
}

console.log(`\n🎉 Proceso completado:`)
console.log(`   ✅ Reparados: ${fixed}`)
console.log(`   ⚠️ Saltados: ${skipped}`)
console.log(`\n👉 Ahora ejecuta: npm run register`)
