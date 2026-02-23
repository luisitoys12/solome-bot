// Modern Dashboard JavaScript

let updateInterval;

// Initialize dashboard
function init() {
    console.log('%c🚀 SOLOME Dashboard Loaded', 'color: #5865F2; font-size: 16px; font-weight: bold');
    fetchAllData();
    updateInterval = setInterval(fetchAllData, 5000); // Update every 5 seconds
}

// Fetch all data
async function fetchAllData() {
    await fetchStats();
    await fetchCommands();
    await fetchServers();
    await fetchLogs();
}

// Fetch bot stats
async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.online) {
            updateStats(data);
            updateStatus(true);
        } else {
            updateStatus(false);
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        updateStatus(false);
    }
}

// Update stats display
function updateStats(data) {
    // Update counters
    animateValue('serversCount', 0, data.servers || 0, 1000);
    animateValue('usersCount', 0, data.users || 0, 1000);
    animateValue('commandsCount', 0, data.commands || 0, 1000);
    
    // Update ping
    const pingElement = document.getElementById('pingValue');
    if (pingElement) {
        pingElement.textContent = `${data.ping || 0}ms`;
    }
    
    // Update bot info
    document.getElementById('botName').textContent = data.username || 'SOLOME Bot';
    document.getElementById('uptime').textContent = formatUptime(data.uptime || 0);
    document.getElementById('memory').textContent = `${data.memory || 0} MB`;
    document.getElementById('version').textContent = data.version || '4.0.0';
}

// Animate number counting
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Update status indicator
function updateStatus(isOnline) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = statusIndicator.querySelector('.status-text');
    
    if (isOnline) {
        statusIndicator.classList.remove('offline');
        statusText.textContent = 'Conectado';
    } else {
        statusIndicator.classList.add('offline');
        statusText.textContent = 'Desconectado';
    }
}

// Format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

// Fetch commands
async function fetchCommands() {
    try {
        const response = await fetch('/api/commands');
        const commands = await response.json();
        
        const container = document.getElementById('commandsList');
        if (!commands || commands.length === 0) {
            container.innerHTML = '<div class="loading-state">No hay comandos disponibles</div>';
            return;
        }
        
        container.innerHTML = '';
        
        // Show first 20 commands
        commands.slice(0, 20).forEach(cmd => {
            const card = document.createElement('div');
            card.className = 'command-card';
            card.innerHTML = `
                <div class="command-name">/${cmd.name}</div>
                <div class="command-description">${cmd.description || 'Sin descripción'}</div>
            `;
            container.appendChild(card);
        });
        
        // Update badge count
        const badge = document.getElementById('commandsBadge');
        if (badge) {
            badge.textContent = `${commands.length}+`;
        }
    } catch (error) {
        console.error('Error fetching commands:', error);
        document.getElementById('commandsList').innerHTML = 
            '<div class="loading-state">Error al cargar comandos</div>';
    }
}

// Fetch servers
async function fetchServers() {
    try {
        const response = await fetch('/api/guilds');
        const servers = await response.json();
        
        const container = document.getElementById('serversList');
        if (!servers || servers.length === 0) {
            container.innerHTML = '<div class="loading-state">No hay servidores conectados</div>';
            return;
        }
        
        container.innerHTML = '';
        
        servers.forEach(server => {
            const card = document.createElement('div');
            card.className = 'server-card';
            card.innerHTML = `
                <div class="server-avatar">
                    ${server.icon ? 
                        `<img src="${server.icon}" alt="${server.name}">` : 
                        '🏠'
                    }
                </div>
                <div class="server-info">
                    <div class="server-name">${server.name}</div>
                    <div class="server-members">👥 ${server.members.toLocaleString()} miembros</div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching servers:', error);
        document.getElementById('serversList').innerHTML = 
            '<div class="loading-state">Error al cargar servidores</div>';
    }
}

// Fetch logs
async function fetchLogs() {
    try {
        const response = await fetch('/api/logs');
        const data = await response.json();
        
        const container = document.getElementById('logsContainer');
        if (!data.logs || data.logs.length === 0) {
            container.innerHTML = '<div class="loading-state">No hay logs disponibles</div>';
            return;
        }
        
        // Keep only last 50 logs
        const logs = data.logs.slice(-50);
        
        container.innerHTML = logs.map(log => 
            `<div class="log-entry">${escapeHtml(log)}</div>`
        ).join('');
        
        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R: Refresh data
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchAllData();
        console.log('%c🔄 Data refreshed', 'color: #3BA55D');
    }
    
    // Ctrl/Cmd + L: Clear logs
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        document.getElementById('logsContainer').innerHTML = '';
        console.log('%c🧹 Logs cleared', 'color: #FAA81A');
    }
});

// Console welcome message
console.log(
    '%c🤖 SOLOME Bot Dashboard',
    'color: #5865F2; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
);
console.log(
    '%cDashboard v4.0 | EstacionKusTV',
    'color: #EB459E; font-size: 14px;'
);
console.log(
    '%c⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯',
    'color: #73738C'
);
console.log('%cAtajos de teclado:', 'color: #B5B5B5; font-weight: bold');
console.log('%c  Ctrl+R: Actualizar datos', 'color: #B5B5B5');
console.log('%c  Ctrl+L: Limpiar logs', 'color: #B5B5B5');
