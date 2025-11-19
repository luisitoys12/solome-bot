const Client = require('./src/client.js')
const { GatewayIntentBits, Partials } = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel, Partials.Message]
})

client.login(process.env.TOKEN).catch(e => {
  console.error('Failed to login:', e)
  process.exit(1)
})
