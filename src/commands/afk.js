const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

// Map para almacenar usuarios AFK (en producción usar base de datos)
const afkUsers = new Map()

module.exports = class AFK extends Command {
  constructor (client) {
    super(client, {
      name: 'afk',
      aliases: [],
      description: 'Marca que estás AFK (Away From Keyboard)'
    })
  }

  async runSlash (interaction) {
    const razon = interaction.options.getString('razon') || 'AFK'
    
    afkUsers.set(interaction.user.id, {
      razon: razon,
      timestamp: Date.now()
    })
    
    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setDescription(`💤 **${interaction.user.username}** ahora está AFK: *${razon}*`)
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'razon',
          description: 'Razón de tu ausencia',
          required: false
        }
      ]
    }
  }
}

// Exportar el Map para usarlo en el message handler
module.exports.afkUsers = afkUsers
