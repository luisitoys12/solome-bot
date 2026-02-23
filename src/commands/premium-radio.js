const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class PremiumRadio extends Command {
  constructor (client) {
    super(client, {
      name: 'premium-radio',
      aliases: ['pradio'],
      description: '📻 Radio premium con estaciones exclusivas y sin anuncios'
    })
  }

  async runSlash (interaction) {
    const busqueda = interaction.options.getString('busqueda')
    
    const premium = false
    
    if (!premium) {
      return interaction.reply({ 
        content: '❌ Esta función requiere **Premium**.',
        ephemeral: true 
      })
    }

    await interaction.reply({ content: `📻 Buscando: ${busqueda} (En desarrollo)`, ephemeral: true })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'busqueda',
          description: 'Buscar en estaciones premium',
          required: true
        }
      ]
    }
  }
}
