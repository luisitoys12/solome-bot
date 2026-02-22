const Client = require('./src/client.js')
const { GatewayIntentBits, Partials } = require('discord.js')
const { startWebServer } = require('./src/web/server')

// Dashboard import
let dashboard = null
if (process.env.DASHBOARD_ENABLED === 'true') {
  try {
    dashboard = require('./dashboard/server')
    console.log('🌐 Dashboard habilitado')
  } catch (error) {
    console.warn('⚠️ Dashboard no disponible:', error.message)
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel, Partials.Message]
})

// Iniciar servidor web existente
startWebServer()

if (process.env.DASHBOARD_ONLY === 'true') {
  console.log('🧪 Dashboard-only mode enabled; skipping Discord login.')
  if (dashboard) {
    dashboard.startDashboard()
  }
  return
}

if (!process.env.TOKEN) {
  console.error('Missing TOKEN. Set DISCORD TOKEN in .env to connect the bot.')
  process.exit(1)
}

client.login(process.env.TOKEN).then(() => {
  console.log('✅ Bot conectado exitosamente')
  
  // Iniciar dashboard después de que el bot esté listo
  if (dashboard) {
    dashboard.setBotClient(client)
    dashboard.startDashboard()
  }
}).catch(e => {
  console.error('Failed to login:', e)
  process.exit(1)
})

// Manejo de errores global
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error)
})

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error)
  process.exit(1)
})
