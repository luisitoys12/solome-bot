const express = require('express')
const path = require('path')
const fs = require('fs')
const { load, save } = require('../src/utils/database.js')

const app = express()
const PORT = process.env.DASHBOARD_PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// API: Obtener estadísticas del bot
app.get('/api/stats', (req, res) => {
  try {
    const client = global.botClient
    
    if (!client || !client.user) {
      return res.json({ online: false, message: 'Bot no conectado' })
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

// API: Obtener servidores
app.get('/api/guilds', (req, res) => {
  try {
    const client = global.botClient
    if (!client) return res.status(503).json({ error: 'Bot no disponible' })

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

// API: Obtener comandos
app.get('/api/commands', (req, res) => {
  try {
    const client = global.botClient
    if (!client || !client.slashCommands) {
      return res.status(503).json({ error: 'Bot no disponible' })
    }

    const commands = Array.from(client.slashCommands.values()).map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      aliases: cmd.aliases || [],
      category: cmd.category || 'general'
    }))

    res.json(commands)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: Comandos custom - Listar
app.get('/api/custom-commands', (req, res) => {
  try {
    const customCommands = load('custom-commands', {})
    res.json(customCommands)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: Comandos custom - Crear/Actualizar
app.post('/api/custom-commands', (req, res) => {
  try {
    const { name, response, enabled = true } = req.body
    
    if (!name || !response) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    const customCommands = load('custom-commands', {})
    customCommands[name] = { response, enabled, createdAt: Date.now() }
    save('custom-commands', customCommands)

    res.json({ success: true, command: customCommands[name] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: Comandos custom - Eliminar
app.delete('/api/custom-commands/:name', (req, res) => {
  try {
    const customCommands = load('custom-commands', {})
    delete customCommands[req.params.name]
    save('custom-commands', customCommands)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: Configuración de módulos
app.get('/api/modules', (req, res) => {
  try {
    const modules = load('modules-config', {
      music: { enabled: true },
      radio: { enabled: true },
      economy: { enabled: true },
      leveling: { enabled: true },
      moderation: { enabled: false },
      ai: { enabled: true },
      games: { enabled: true }
    })
    res.json(modules)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: Actualizar módulo
app.post('/api/modules/:module', (req, res) => {
  try {
    const modules = load('modules-config', {})
    modules[req.params.module] = req.body
    save('modules-config', modules)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Rutas de vistas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/commands', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'commands.html'))
})

app.get('/modules', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'modules.html'))
})

app.get('/custom-commands', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'custom-commands.html'))
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
