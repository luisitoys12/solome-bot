const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class VIP extends Command {
  constructor (client) {
    super(client, {
      name: 'vip',
      aliases: [],
      description: '👑 [VIP] Comandos exclusivos para usuarios VIP del servidor'
    })
  }

  async runSlash (interaction) {
    // Verificar si tiene rol VIP
    const hasVIPRole = interaction.member.roles.cache.some(r => 
      r.name.toLowerCase().includes('vip') || 
      r.name.toLowerCase().includes('premium')
    )
    
    if (!hasVIPRole) {
      return interaction.reply({ 
        content: '🔒 Este comando es solo para miembros **VIP** del servidor.',
        ephemeral: true 
      })
    }
    
    const accion = interaction.options.getString('accion')
    
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('👑 Panel VIP')
      .setDescription(`Acción: **${accion}**`)
      .addFields(
        { name: '✨ Privilegios VIP Activos', value: '• Acceso a canales VIP\n• Prioridad en cola de música\n• Comandos exclusivos\n• Recompensas diarias dobles\n• XP multiplicado x2' }
      )
      .setFooter({ text: 'Gracias por ser VIP!' })
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
          name: 'accion',
          description: 'Acción VIP a realizar',
          required: true,
          choices: [
            { name: '🎵 Solicitar canción prioritaria', value: 'request' },
            { name: '🎁 Reclamar recompensa VIP', value: 'reward' },
            { name: '👑 Ver beneficios VIP', value: 'benefits' },
            { name: '⭐ Activar modo VIP en canal', value: 'activate' }
          ]
        }
      ]
    }
  }
}
