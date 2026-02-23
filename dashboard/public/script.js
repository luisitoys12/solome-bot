// Actualizar estadísticas cada 5 segundos
let refreshInterval;

async function fetchStats() {
    try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        
        if (data.online) {
            updateStats(data)
            document.getElementById('statusBadge').classList.remove('offline')
            document.querySelector('.status-badge span:last-child').textContent = 'Online'
        } else {
            document.getElementById('statusBadge').classList.add('offline')
            document.querySelector('.status-badge span:last-child').textContent = 'Offline'
        }
    } catch (error) {
        console.error('Error fetching stats:', error)
        document.getElementById('statusBadge').classList.add('offline')
        document.querySelector('.status-badge span:last-child').textContent = 'Error'
    }
}

function updateStats(data) {
    document.getElementById('servers').textContent = data.servers || 0
    document.getElementById('users').textContent = data.users || 0
    document.getElementById('commands').textContent = data.commands || 0
    document.getElementById('ping').textContent = `${data.ping || 0}ms`
    
    document.getElementById('botName').textContent = data.username || 'N/A'
    document.getElementById('uptime').textContent = formatUptime(data.uptime || 0)
    document.getElementById('memory').textContent = `${data.memory || 0} MB`
    document.getElementById('version').textContent = data.version || '4.0.0'
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

async function fetchCommands() {
    try {
        const response = await fetch('/api/commands')
        const commands = await response.json()
        
        const container = document.getElementById('commandsList')
        container.innerHTML = ''
        
        commands.slice(0, 10).forEach(cmd => {
            const div = document.createElement('div')
            div.className = 'command-item'
            div.innerHTML = `
                <div class="command-name">/${cmd.name}</div>
                <div class="command-description">${cmd.description}</div>
            `
            container.appendChild(div)
        })
        
        if (commands.length > 10) {
            const more = document.createElement('div')
            more.className = 'info-item'
            more.style.marginTop = '10px'
            more.textContent = `... y ${commands.length - 10} comandos más`
            container.appendChild(more)
        }
    } catch (error) {
        console.error('Error fetching commands:', error)
        document.getElementById('commandsList').innerHTML = '<div class="loading">Error cargando comandos</div>'
    }
}

async function fetchGuilds() {
    try {
        const response = await fetch('/api/guilds')
        const guilds = await response.json()
        
        const container = document.getElementById('serversList')
        container.innerHTML = ''
        
        guilds.forEach(guild => {
            const div = document.createElement('div')
            div.className = 'server-item'
            div.innerHTML = `
                <div class="server-icon">
                    ${guild.icon ? `<img src="${guild.icon}" alt="${guild.name}">` : '🏠'}
                </div>
                <div class="server-info">
                    <div class="server-name">${guild.name}</div>
                    <div class="server-members">👥 ${guild.members} miembros</div>
                </div>
            `
            container.appendChild(div)
        })
    } catch (error) {
        console.error('Error fetching guilds:', error)
        document.getElementById('serversList').innerHTML = '<div class="loading">Error cargando servidores</div>'
    }
}

async function fetchLogs() {
    try {
        const response = await fetch('/api/logs')
        const data = await response.json()
        
        const container = document.getElementById('logsContainer')
        container.innerHTML = ''
        
        data.logs.forEach(log => {
            const div = document.createElement('div')
            div.className = 'log-line'
            div.textContent = log
            container.appendChild(div)
        })
        
        // Auto-scroll
        container.scrollTop = container.scrollHeight
    } catch (error) {
        console.error('Error fetching logs:', error)
    }
}

// Inicializar
function init() {
    fetchStats()
    fetchCommands()
    fetchGuilds()
    fetchLogs()
    
    // Actualizar cada 5 segundos
    refreshInterval = setInterval(() => {
        fetchStats()
        fetchLogs()
    }, 5000)
}

// Limpiar interval al salir
window.addEventListener('beforeunload', () => {
    if (refreshInterval) clearInterval(refreshInterval)
})

// Iniciar cuando cargue la página
document.addEventListener('DOMContentLoaded', init)
