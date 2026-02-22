const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const ms = require('ms')

module.exports = class Recordatorio extends Command {
  constructor (client) {
    super(client, {
      name: 'recordatorio',
      aliases: ['reminder', 'remindme'],
      description: 'Crea un recordatorio que te enviará un DM'
    })
  }

  async runSlash (interaction) {
    const tiempo = interaction.options.getString('tiempo')
    const mensaje = interaction.options.getString('mensaje')
    
    const duration = ms(tiempo)
    
    if (!duration || duration < 1000 || duration > 31536000000) {
      return interaction.reply({ 
        content: '❌ Tiempo inválido. Usa formato: 10s, 5m, 1h, 2d\nMáximo: 1 año',
        ephemeral: true 
      })
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('⏰ Recordatorio creado')
      .setDescription(`Te recordaré en **${ms(duration, { long: true })}**`)
      .addFields({ name: '📝 Mensaje', value: mensaje })
      .setTimestamp(Date.now() + duration)
    
    await interaction.reply({ embeds: [embed] })
    
    setTimeout(async () => {
      try {
        const reminderEmbed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('⏰ ¡Recordatorio!')
          .setDescription(mensaje)
          .addFields({ name: '📅 Creado en', value: interaction.guild.name })
          .setTimestamp()
        
        await interaction.user.send({ embeds: [reminderEmbed] })
      } catch (error) {
        this.client.log('error', 'No se pudo enviar recordatorio:', error)
      }
    }, duration)
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'tiempo',
          description: 'Cuándo recordarte (ej: 10m, 1h, 2d)',
          required: true
        },
        {
          type: 3,
          name: 'mensaje',
          description: 'Qué recordarte',
          required: true
        }
      ]
    }
  }
}
