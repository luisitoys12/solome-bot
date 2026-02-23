const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = class Help extends Command {
  constructor (client) {
    super(client, {
      name: 'help',
      aliases: ['ayuda', 'comandos'],
      description: '📚 Muestra todos los comandos disponibles del bot'
    })
  }

  async runSlash (interaction) {
    const categories = this.getCategories()
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🤖 SOLOME Bot - Comandos')
      .setDescription(
        '**Bot multifuncional para BabaRadio y EstacionKusTV**\n\n' +
        'Selecciona una categoría para ver sus comandos.'
      )
      .setThumbnail(this.client.user.displayAvatarURL())
    
    // Agregar resumen por categoría
    Object.entries(categories).forEach(([name, cmds]) => {
      const icon = this.getCategoryIcon(name)
      embed.addFields({
        name: `${icon} ${name}`,
        value: `${cmds.length} comandos`,
        inline: true
      })
    })
    
    embed.setFooter({ 
      text: `Total: ${this.client.slashCommands.size} comandos • Usa el menú para explorar` 
    })
    
    // Select menu
    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_menu')
      .setPlaceholder('📝 Selecciona una categoría')
      .addOptions(
        Object.keys(categories).map(cat => ({
          label: cat,
          value: `help_${cat.toLowerCase()}`,
          description: `Ver comandos de ${cat}`,
          emoji: this.getCategoryIcon(cat)
        }))
      )
    
    const row = new ActionRowBuilder().addComponents(menu)
    
    // Botones de enlaces
    const linkRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Invitar Bot')
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot%20applications.commands`)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel('Servidor de Soporte')
          .setURL('https://discord.gg/tu_servidor')
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel('GitHub')
          .setURL('https://github.com/luisitoys12/solome-bot')
          .setStyle(ButtonStyle.Link)
      )
    
    await interaction.reply({ 
      embeds: [embed], 
      components: [row, linkRow]
    })
  }

  async handleMenu(interaction) {
    const category = interaction.values[0].replace('help_', '')
    const categories = this.getCategories()
    
    const commands = categories[category.charAt(0).toUpperCase() + category.slice(1)] || []
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`${this.getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`)
      .setDescription(`Lista de comandos de ${category}`)
    
    commands.forEach(cmd => {
      embed.addFields({
        name: `/${cmd.name}`,
        value: cmd.description || 'Sin descripción',
        inline: false
      })
    })
    
    embed.setFooter({ text: `${commands.length} comandos en esta categoría` })
    
    await interaction.update({ embeds: [embed] })
  }

  getCategories() {
    const categories = {
      'Música': [],
      'Radio': [],
      'Moderación': [],
      'Diversión': [],
      'Utilidad': [],
      'Economía': [],
      'Configuración': [],
      'Otros': []
    }
    
    this.client.slashCommands.forEach(cmd => {
      const name = cmd.name.toLowerCase()
      
      if (['music', 'play', 'skip', 'stop', 'queue', 'lyrics'].includes(name)) {
        categories['Música'].push(cmd)
      } else if (['radio', 'radioinfo', 'stream'].includes(name)) {
        categories['Radio'].push(cmd)
      } else if (['ban', 'kick', 'warn', 'timeout', 'clear', 'lock', 'unlock', 'slowmode', 'moderar', 'moderation'].includes(name)) {
        categories['Moderación'].push(cmd)
      } else if (['8ball', 'meme', 'coinflip', 'dice', 'tictactoe', 'connect4', 'duelo', 'slots', 'ruleta', 'loteria'].includes(name)) {
        categories['Diversión'].push(cmd)
      } else if (['avatar', 'userinfo', 'serverinfo', 'botinfo', 'ping', 'uptime', 'clima', 'traducir', 'wikipedia', 'download'].includes(name)) {
        categories['Utilidad'].push(cmd)
      } else if (['balance', 'daily', 'work', 'tienda', 'transfer'].includes(name)) {
        categories['Economía'].push(cmd)
      } else if (['ai', 'noticias', 'ticket', 'customcommand', 'premium'].includes(name)) {
        categories['Configuración'].push(cmd)
      } else {
        categories['Otros'].push(cmd)
      }
    })
    
    // Remover categorías vacías
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key]
      }
    })
    
    return categories
  }

  getCategoryIcon(category) {
    const icons = {
      'música': '🎵',
      'radio': '📻',
      'moderación': '🛡️',
      'diversión': '🎮',
      'utilidad': '🛠️',
      'economía': '💰',
      'configuración': '⚙️',
      'otros': '📚'
    }
    return icons[category.toLowerCase()] || '📝'
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
