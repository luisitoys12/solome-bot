const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const ms = require('ms')

class Kick extends Command {
  constructor (client) {
    super(client, {
      name: 'kick',
      description: 'Expulsa a un usuario del servidor'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ No tienes permisos para expulsar miembros.', ephemeral: true })
    }

    const user = interaction.options.getUser('usuario')
    const reason = interaction.options.getString('razon') || 'No especificada'
    const member = interaction.guild.members.cache.get(user.id)

    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado.', ephemeral: true })
    }

    if (!member.kickable) {
      return interaction.reply({ content: '❌ No puedo expulsar a este usuario.', ephemeral: true })
    }

    try {
      await member.kick(reason)
      
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('👢 Usuario Expulsado')
        .addFields(
          { name: 'Usuario', value: `${user.tag}`, inline: true },
          { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
          { name: 'Razón', value: reason }
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al expulsar al usuario.', ephemeral: true })
    }
  }
}

class Ban extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      description: 'Banea a un usuario del servidor'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ No tienes permisos para banear miembros.', ephemeral: true })
    }

    const user = interaction.options.getUser('usuario')
    const reason = interaction.options.getString('razon') || 'No especificada'
    const member = interaction.guild.members.cache.get(user.id)

    if (member && !member.bannable) {
      return interaction.reply({ content: '❌ No puedo banear a este usuario.', ephemeral: true })
    }

    try {
      await interaction.guild.members.ban(user, { reason })
      
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('🔨 Usuario Baneado')
        .addFields(
          { name: 'Usuario', value: `${user.tag}`, inline: true },
          { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
          { name: 'Razón', value: reason }
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al banear al usuario.', ephemeral: true })
    }
  }
}

class Timeout extends Command {
  constructor (client) {
    super(client, {
      name: 'timeout',
      description: 'Silencia temporalmente a un usuario'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ No tienes permisos para silenciar miembros.', ephemeral: true })
    }

    const user = interaction.options.getUser('usuario')
    const duration = interaction.options.getString('duracion')
    const reason = interaction.options.getString('razon') || 'No especificada'
    const member = interaction.guild.members.cache.get(user.id)

    if (!member) {
      return interaction.reply({ content: '❌ Usuario no encontrado.', ephemeral: true })
    }

    if (!member.moderatable) {
      return interaction.reply({ content: '❌ No puedo silenciar a este usuario.', ephemeral: true })
    }

    try {
      const time = ms(duration)
      if (!time || time > ms('28d')) {
        return interaction.reply({ content: '❌ Duración inválida. Usa formato como: 10m, 1h, 1d (máximo 28 días)', ephemeral: true })
      }

      await member.timeout(time, reason)
      
      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle('🔇 Usuario Silenciado')
        .addFields(
          { name: 'Usuario', value: `${user.tag}`, inline: true },
          { name: 'Duración', value: duration, inline: true },
          { name: 'Moderador', value: `${interaction.user.tag}`, inline: true },
          { name: 'Razón', value: reason }
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al silenciar al usuario.', ephemeral: true })
    }
  }
}

class Clear extends Command {
  constructor (client) {
    super(client, {
      name: 'clear',
      description: 'Elimina mensajes del canal'
    })
  }

  async runSlash (interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ No tienes permisos para gestionar mensajes.', ephemeral: true })
    }

    const amount = interaction.options.getInteger('cantidad')

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ Debes especificar un número entre 1 y 100.', ephemeral: true })
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true)
      
      await interaction.reply({ content: `🗑️ Se eliminaron ${deleted.size} mensajes.`, ephemeral: true })
    } catch (error) {
      this.client.log('error', error)
      await interaction.reply({ content: '❌ Error al eliminar mensajes.', ephemeral: true })
    }
  }
}

module.exports = { Kick, Ban, Timeout, Clear }
