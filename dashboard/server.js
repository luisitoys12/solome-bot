const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = process.env.DASHBOARD_PORT || 3000

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// API para obtener estadísticas del bot
app.get('/api/stats', (req, res) => {
  try {
    const client = global.botClient
    
    if (!client || !client.user) {
      return res.json({
        online: false,
        message: 'Bot no conectado'
      })
    }

    const stats = {
      online: true,
      username: client.user.tag,
      avatar: client.user.displayAvatarURL(),
      servers: client.guilds.cache.size,
      users: client.users.cache.size,
      channels: client.channels.cache.size,
      commands: client.slashCommands ? client.slashCommands.size : 0,
      uptime: process.uptime(),
      ping: client.ws.ping,
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      version: '4.0.0'
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API para obtener lista de servidores
app.get('/api/guilds', (req, res) => {
  try {
    const client = global.botClient
    
    if (!client) {
      return res.status(503).json({ error: 'Bot no disponible' })
    }

    const guilds = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 128 }),
      members: guild.memberCount,
      owner: guild.ownerId
    }))

    res.json(guilds)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API para obtener comandos
app.get('/api/commands', (req, res) => {
  try {
    const client = global.botClient
    
    if (!client || !client.slashCommands) {
      return res.status(503).json({ error: 'Bot no disponible' })
    }

    const commands = Array.from(client.slashCommands.values()).map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      aliases: cmd.aliases || []
    }))

    res.json(commands)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API para obtener logs recientes
app.get('/api/logs', (req, res) => {
  try {
    const logsPath = path.join(__dirname, '../logs/bot.log')
    
    if (fs.existsSync(logsPath)) {
      const logs = fs.readFileSync(logsPath, 'utf-8')
      const lines = logs.split('\n').filter(l => l.trim()).slice(-50)
      res.json({ logs: lines })
    } else {
      res.json({ logs: ['No hay logs disponibles'] })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Iniciar servidor
function startDashboard(botClient) {
  global.botClient = botClient
  
  app.listen(PORT, () => {
    console.log(`✅ 🌐 Dashboard disponible en http://localhost:${PORT}`)
    console.log(`✅ 🔗 Acceso público: https://solome-panel.duckdns.org`)
  })
}

module.exports = { startDashboard, app }
