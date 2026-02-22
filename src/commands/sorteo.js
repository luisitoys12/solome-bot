const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Sorteo extends Command {
  constructor (client) {
    super(client, {
      name: 'sorteo',
      aliases: ['raffle'],
      description: 'Realiza un sorteo instantáneo entre miembros activos'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const premio = interaction.options.getString('premio')
    const ganadores = interaction.options.getInteger('ganadores') || 1
    
    // Obtener miembros del servidor
    const members = await interaction.guild.members.fetch()
    const eligibleMembers = members.filter(m => !m.user.bot && m.presence?.status !== 'offline')
    
    if (eligibleMembers.size < ganadores) {
      return interaction.editReply('❌ No hay suficientes miembros elegibles para este sorteo.')
    }
    
    // Seleccionar ganadores aleatorios
    const winnersArray = []
    const membersArray = Array.from(eligibleMembers.values())
    
    for (let i = 0; i < ganadores; i++) {
      const randomIndex = Math.floor(Math.random() * membersArray.length)
      winnersArray.push(membersArray[randomIndex])
      membersArray.splice(randomIndex, 1)
    }
    
    const embed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle('🎉 ¡Resultados del Sorteo!')
      .setDescription(`**Premio:** ${premio}`)
      .addFields(
        { 
          name: ganadores === 1 ? '🏆 Ganador' : '🏆 Ganadores', 
          value: winnersArray.map(w => `<@${w.user.id}>`).join('\n') 
        },
        { name: '👥 Participantes elegibles', value: `${eligibleMembers.size}`, inline: true },
        { name: '🎯 Total ganadores', value: `${ganadores}`, inline: true }
      )
      .setFooter({ text: `Sorteo realizado por ${interaction.user.tag}` })
      .setTimestamp()
    
    await interaction.editReply({ 
      content: winnersArray.map(w => `<@${w.user.id}>`).join(' '),
      embeds: [embed] 
    })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'premio',
          description: 'Premio del sorteo',
          required: true
        },
        {
          type: 4,
          name: 'ganadores',
          description: 'Número de ganadores',
          required: false,
          min_value: 1,
          max_value: 20
        }
      ]
    }
  }
}
