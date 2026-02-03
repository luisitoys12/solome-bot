const Client = require('./src/client.js')
const { GatewayIntentBits, Partials } = require('discord.js')
const { startWebServer } = require('./src/web/server')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel, Partials.Message]
})

startWebServer()

if (process.env.DASHBOARD_ONLY === 'true') {
  console.log('🧪 Dashboard-only mode enabled; skipping Discord login.')
  return
}

if (!process.env.TOKEN) {
  console.error('Missing TOKEN. Set DISCORD TOKEN in .env to connect the bot.')
  process.exit(1)
}

client.login(process.env.TOKEN).catch(e => {
  console.error('Failed to login:', e)
  process.exit(1)
})
