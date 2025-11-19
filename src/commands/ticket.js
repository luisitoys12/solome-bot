const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js')

module.exports = class Ticket extends Command {
  constructor (client) {
    super(client, {
      name: 'ticket',
      description: 'Sistema de tickets de soporte'
    })
  }

  async runSlash (interaction) {
    const subcommand = interaction.options.getSubcommand()

    switch (subcommand) {
      case 'create':
        await this.createTicket(interaction)
        break
      case 'close':
        await this.closeTicket(interaction)
        break
      case 'add':
        await this.addUser(interaction)
        break
      case 'remove':
        await this.removeUser(interaction)
        break
      case 'panel':
        await this.createPanel(interaction)
        break
      case 'transcript':
        await this.saveTranscript(interaction)
        break
    }
  }

  async createTicket(interaction) {
    const reason = interaction.options.getString('razon') || 'Sin razón especificada'
    
    // Verificar si ya tiene un ticket abierto
    if (!this.client.tickets) this.client.tickets = new Map()
    const userTickets = Array.from(this.client.tickets.values()).filter(t => 
      t.userId === interaction.user.id && t.guildId === interaction.guild.id && !t.closed
    )

    if (userTickets.length > 0) {
      return interaction.reply({ 
        content: `❌ Ya tienes un ticket abierto: <#${userTickets[0].channelId}>`, 
        ephemeral: true 
      })
    }

    await interaction.deferReply({ ephemeral: true })

    try {
      // Crear canal de ticket
      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: interaction.channel.parent,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          },
          {
            id: interaction.client.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
          }
        ]
      })

      // Guardar ticket
      this.client.tickets.set(ticketChannel.id, {
        channelId: ticketChannel.id,
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        reason,
        createdAt: Date.now(),
        closed: false
      })

      // Embed de bienvenida
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🎫 Ticket de Soporte')
        .setDescription(`Gracias por crear un ticket, ${interaction.user}!\n\nUn miembro del staff te atenderá pronto.`)
        .addFields(
          { name: '📝 Razón', value: reason },
          { name: '👤 Usuario', value: `${interaction.user.tag}`, inline: true },
          { name: '🕐 Creado', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: 'Usa los botones de abajo para gestionar el ticket' })
        .setTimestamp()

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('Cerrar Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒'),
          new ButtonBuilder()
            .setCustomId('ticket_transcript')
            .setLabel('Guardar Transcripción')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📄')
        )

      await ticketChannel.send({ embeds: [embed], components: [row] })

      await interaction.editReply({ 
        content: `✅ Ticket creado: ${ticketChannel}` 
      })

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply({ content: '❌ Error al crear el ticket.' })
    }
  }

  async closeTicket(interaction) {
    const ticket = this.client.tickets?.get(interaction.channel.id)

    if (!ticket) {
      return interaction.reply({ content: '❌ Este no es un canal de ticket.', ephemeral: true })
    }

    if (ticket.closed) {
      return interaction.reply({ content: '❌ Este ticket ya está cerrado.', ephemeral: true })
    }

    await interaction.deferReply()

    try {
      ticket.closed = true
      ticket.closedBy = interaction.user.id
      ticket.closedAt = Date.now()

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🔒 Ticket Cerrado')
        .setDescription('Este ticket ha sido cerrado.')
        .addFields(
          { name: 'Cerrado por', value: `${interaction.user.tag}`, inline: true },
          { name: 'Fecha', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
        )
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })

      // Eliminar canal después de 5 segundos
      setTimeout(async () => {
        try {
          await interaction.channel.delete()
          this.client.tickets.delete(interaction.channel.id)
        } catch (e) {
          this.client.log('error', e)
        }
      }, 5000)

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply({ content: '❌ Error al cerrar el ticket.' })
    }
  }

  async addUser(interaction) {
    const user = interaction.options.getUser('usuario')
    const ticket = this.client.tickets?.get(interaction.channel.id)

    if (!ticket) {
      return interaction.reply({ content: '❌ Este no es un canal de ticket.', ephemeral: true })
    }

    try {
      await interaction.channel.permissionOverwrites.create(user, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      })

      await interaction.reply({ content: `✅ ${user} ha sido agregado al ticket.` })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al agregar usuario.', ephemeral: true })
    }
  }

  async removeUser(interaction) {
    const user = interaction.options.getUser('usuario')
    const ticket = this.client.tickets?.get(interaction.channel.id)

    if (!ticket) {
      return interaction.reply({ content: '❌ Este no es un canal de ticket.', ephemeral: true })
    }

    if (user.id === ticket.userId) {
      return interaction.reply({ content: '❌ No puedes remover al creador del ticket.', ephemeral: true })
    }

    try {
      await interaction.channel.permissionOverwrites.delete(user)
      await interaction.reply({ content: `✅ ${user} ha sido removido del ticket.` })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al remover usuario.', ephemeral: true })
    }
  }

  async createPanel(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ Solo administradores pueden crear paneles.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎫 Sistema de Tickets')
      .setDescription('¿Necesitas ayuda? Crea un ticket haciendo clic en el botón de abajo.\n\nUn miembro del staff te atenderá lo antes posible.')
      .addFields(
        { name: '📝 ¿Cuándo crear un ticket?', value: '• Reportar un problema\n• Solicitar ayuda\n• Hacer una sugerencia\n• Reportar un usuario' },
        { name: '⚠️ Reglas', value: '• No spam\n• Sé respetuoso\n• Proporciona detalles\n• Ten paciencia' }
      )
      .setFooter({ text: 'Baba Radio - Sistema de Tickets' })
      .setTimestamp()

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_create_panel')
          .setLabel('Crear Ticket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫')
      )

    await interaction.reply({ embeds: [embed], components: [row] })
  }

  async saveTranscript(interaction) {
    const ticket = this.client.tickets?.get(interaction.channel.id)

    if (!ticket) {
      return interaction.reply({ content: '❌ Este no es un canal de ticket.', ephemeral: true })
    }

    await interaction.deferReply({ ephemeral: true })

    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 })
      const transcript = messages.reverse().map(m => 
        `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`
      ).join('\n')

      const buffer = Buffer.from(transcript, 'utf-8')

      await interaction.editReply({ 
        content: '✅ Transcripción guardada:',
        files: [{
          attachment: buffer,
          name: `ticket-${interaction.channel.name}-${Date.now()}.txt`
        }]
      })

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply({ content: '❌ Error al guardar transcripción.' })
    }
  }
}
