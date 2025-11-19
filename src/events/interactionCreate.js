const Event = require('../structures/event.js')

module.exports = class InteractionCreate extends Event {
  constructor (client) {
    super(client, {
      name: 'interactionCreate'
    })
  }

  async run (interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      // Check maintenance mode
      if (this.client.maintenanceMode && interaction.commandName !== 'uptime') {
        const { EmbedBuilder } = require('discord.js')
        const fs = require('fs')
        
        try {
          const maintenance = JSON.parse(fs.readFileSync('./maintenance.json', 'utf8'))
          
          const embed = new EmbedBuilder()
            .setColor(0xf39c12)
            .setTitle('🔧 Bot en Mantenimiento')
            .setDescription('Estoy en mantenimiento en este momento. Por favor, espera un momento.')
            .addFields(
              { name: '⏰ Tiempo Estimado', value: maintenance.estimatedEnd || 'Desconocido' },
              { name: '📝 Razón', value: maintenance.reason || 'Actualizaciones del sistema' }
            )
            .setFooter({ text: 'Gracias por tu paciencia' })
            .setTimestamp()

          return interaction.reply({ embeds: [embed], ephemeral: true })
        } catch (e) {
          return interaction.reply({ 
            content: '🔧 Estoy en mantenimiento. Por favor, espera un momento.', 
            ephemeral: true 
          })
        }
      }

      const command = this.client.commands.find(c => c.name === interaction.commandName)

      if (command) {
        try {
          await command.runSlash(interaction)
          this.client.log('info', `${interaction.user.tag} used slash command: /${interaction.commandName}`)
        } catch (e) {
          this.client.log('error', e)
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Error executing command.', ephemeral: true })
          } else {
            await interaction.reply({ content: '❌ Error executing command.', ephemeral: true })
          }
        }
      }
      return
    }

    // Handle button interactions
    if (interaction.isButton()) {
      // Giveaway buttons
      if (interaction.customId === 'giveaway_enter') {
        const giveaway = this.client.giveaways?.get(interaction.message.id)
        
        if (!giveaway) {
          return interaction.reply({ content: '❌ Este sorteo ya no está activo.', ephemeral: true })
        }

        if (giveaway.participants.has(interaction.user.id)) {
          giveaway.participants.delete(interaction.user.id)
          return interaction.reply({ content: '❌ Has salido del sorteo.', ephemeral: true })
        }

        giveaway.participants.add(interaction.user.id)
        return interaction.reply({ content: '✅ ¡Estás participando en el sorteo!', ephemeral: true })
      }

      // Ticket buttons
      if (interaction.customId === 'ticket_create_panel') {
        const ticketCommand = this.client.commands.find(c => c.name === 'ticket')
        if (ticketCommand) {
          // Simular comando /ticket create
          interaction.options = {
            getSubcommand: () => 'create',
            getString: () => 'Creado desde panel'
          }
          await ticketCommand.createTicket(interaction)
        }
      }

      if (interaction.customId === 'ticket_close') {
        const ticketCommand = this.client.commands.find(c => c.name === 'ticket')
        if (ticketCommand) {
          interaction.options = {
            getSubcommand: () => 'close'
          }
          await ticketCommand.closeTicket(interaction)
        }
      }

      if (interaction.customId === 'ticket_transcript') {
        const ticketCommand = this.client.commands.find(c => c.name === 'ticket')
        if (ticketCommand) {
          interaction.options = {
            getSubcommand: () => 'transcript'
          }
          await ticketCommand.saveTranscript(interaction)
        }
      }

      // Report crash button
      if (interaction.customId === 'report_crash') {
        await interaction.deferReply({ ephemeral: true })
        
        try {
          // Enviar DM a djluisalegre
          const developer = await this.client.users.fetch('TU_USER_ID_AQUI') // Reemplazar con ID real
          
          const reportEmbed = new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle('🚨 Reporte de Problema')
            .setDescription('Un usuario ha reportado un problema con el bot')
            .addFields(
              { name: 'Usuario', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
              { name: 'Servidor', value: `${interaction.guild.name} (${interaction.guild.id})`, inline: true },
              { name: 'Canal', value: `${interaction.channel.name}`, inline: true },
              { name: 'Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
            )
            .setTimestamp()

          await developer.send({ embeds: [reportEmbed] }).catch(() => {})
          
          await interaction.editReply({ 
            content: '✅ Reporte enviado al desarrollador. Gracias por tu feedback!' 
          })
        } catch (error) {
          this.client.log('error', error)
          await interaction.editReply({ 
            content: '❌ Error al enviar el reporte. Por favor, contacta al desarrollador directamente.' 
          })
        }
      }
    }
  }
}
