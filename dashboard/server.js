// dashboard/server.js - Servidor Express para el Dashboard
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const DiscordStrategy = require('passport-discord').Strategy
const path = require('path')
const app = express()

// Configuración
const config = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL || 'http://localhost:3000/callback',
  scopes: ['identify', 'guilds'],
  port: process.env.DASHBOARD_PORT || 3000
}

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'solome-bot-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 } // 24 horas
}))

// Passport setup
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((obj, done) => done(null, obj))

passport.use(new DiscordStrategy({
  clientID: config.clientID,
  clientSecret: config.clientSecret,
  callbackURL: config.callbackURL,
  scope: config.scopes
}, (accessToken, refreshToken, profile, done) => {
  profile.accessToken = accessToken
  return done(null, profile)
}))

app.use(passport.initialize())
app.use(passport.session())

// Middleware de autenticación
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/login')
}

// Variables globales para el bot
let botClient = null

function setBotClient(client) {
  botClient = client
}

// Rutas públicas
app.get('/', (req, res) => {
  res.render('index', { user: req.user, bot: botClient })
})

app.get('/login', passport.authenticate('discord'))

app.get('/callback', 
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => res.redirect('/dashboard')
)

app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'))
})

// Rutas protegidas
app.get('/dashboard', checkAuth, async (req, res) => {
  try {
    const guilds = req.user.guilds.filter(g => 
      (parseInt(g.permissions) & 0x20) === 0x20 // MANAGE_GUILD
    )
    
    const botGuilds = botClient ? Array.from(botClient.guilds.cache.values()) : []
    const mutualGuilds = guilds.filter(g => botGuilds.find(bg => bg.id === g.id))
    
    res.render('dashboard', { 
      user: req.user, 
      guilds: mutualGuilds,
      bot: botClient
    })
  } catch (error) {
    console.error('Error en dashboard:', error)
    res.status(500).send('Error al cargar el dashboard')
  }
})

app.get('/dashboard/:guildId', checkAuth, async (req, res) => {
  const { guildId } = req.params
  
  if (!botClient) {
    return res.status(503).send('Bot no conectado')
  }
  
  const guild = botClient.guilds.cache.get(guildId)
  if (!guild) {
    return res.status(404).send('Servidor no encontrado')
  }
  
  // Verificar permisos del usuario
  const userGuilds = req.user.guilds
  const userGuild = userGuilds.find(g => g.id === guildId)
  
  if (!userGuild || (parseInt(userGuild.permissions) & 0x20) !== 0x20) {
    return res.status(403).send('No tienes permisos en este servidor')
  }
  
  res.render('server', { 
    user: req.user, 
    guild: guild,
    bot: botClient
  })
})

// API Endpoints
app.get('/api/stats', checkAuth, (req, res) => {
  if (!botClient) {
    return res.json({ error: 'Bot no conectado' })
  }
  
  res.json({
    guilds: botClient.guilds.cache.size,
    users: botClient.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
    channels: botClient.channels.cache.size,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    ping: botClient.ws.ping
  })
})

app.get('/api/guild/:guildId', checkAuth, async (req, res) => {
  const { guildId } = req.params
  
  if (!botClient) {
    return res.json({ error: 'Bot no conectado' })
  }
  
  const guild = botClient.guilds.cache.get(guildId)
  if (!guild) {
    return res.status(404).json({ error: 'Servidor no encontrado' })
  }
  
  res.json({
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({ dynamic: true }),
    memberCount: guild.memberCount,
    channels: guild.channels.cache.size,
    roles: guild.roles.cache.size,
    owner: guild.ownerId
  })
})

app.post('/api/guild/:guildId/config', checkAuth, async (req, res) => {
  const { guildId } = req.params
  const config = req.body
  
  // Aquí guardarías la configuración en una base de datos
  // Por ahora solo devolvemos éxito
  
  res.json({ success: true, message: 'Configuración guardada' })
})

// Manejo de errores
app.use((req, res) => {
  res.status(404).render('404', { user: req.user })
})

function startDashboard() {
  app.listen(config.port, () => {
    console.log(`\n🌐 Dashboard disponible en: http://localhost:${config.port}`)
    console.log(`📊 Panel de administración iniciado correctamente`)
  })
}

module.exports = { startDashboard, setBotClient, app }
