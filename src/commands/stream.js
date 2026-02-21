// src/commands/stream.js
const Command = require('../structures/command.js')
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const { load, save } = require('../utils/database.js')

function getConfig (guildId) {
  const data = load('streams', {})
  return data[guildId] || null
}

function setConfig (guildId, config) {
  const data = load('streams', {})
  data[guildId] = config
  save('streams', data)
}

module.exports = class Stream extends Command {
  constructor (client) {
    super(client, {
      name: 'stream',
      description: 'Sistema de anuncios para streamers (Twitch, Kick, YouTube)'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()
    const guildId = interaction.guild.id

    if (sub === 'configurar') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ content: '❌ Solo admins pueden configurar el sistema de streams.', ephemeral: true })
      }

      const channel = interaction.options.getChannel('canal')
      const role = interaction.options.getRole('rol') || null
      const twitch = interaction.options.getString('twitch') || ''
      const kick = interaction.options.getString('kick') || ''
      const youtube = interaction.options.getString('youtube') || ''

      setConfig(guildId, {
        channelId: channel.id,
        roleId: role?.id || null,
        links: { twitch, kick, youtube }
      })

      const embed = new EmbedBuilder()
        .setColor(0x9146ff)
        .setTitle('✅ Configuración de Streams Actualizada')
        .addFields(
          { name: 'Canal de anuncios', value: `${channel}`, inline: true },
          { name: 'Rol a mencionar', value: role ? `${role}` : 'Ninguno', inline: true }
        )
        .setFooter({ text: 'Usa /stream live para anunciar cuando estés en vivo' })
        .setTimestamp()

      return interaction.reply({ embeds: [embed], ephemeral: true })
    }

    if (sub === 'info') {
      const config = getConfig(guildId)
      if (!config) {
        return interaction.reply({ content: '❌ No hay configuración de streams. Usa `/stream configurar` primero.', ephemeral: true })
      }

      const channel = interaction.guild.channels.cache.get(config.channelId)
      const role = config.roleId ? interaction.guild.roles.cache.get(config.roleId) : null

      const embed = new EmbedBuilder()
        .setColor(0x00bcd4)
        .setTitle('📊 Configuración de Streams')
        .addFields(
          { name: 'Canal de anuncios', value: channel ? `${channel}` : 'Canal no encontrado', inline: true },
          { name: 'Rol a mencionar', value: role ? `${role}` : 'Ninguno', inline: true },
          { name: 'Twitch', value: config.links.twitch || 'No configurado', inline: false },
          { name: 'Kick', value: config.links.kick || 'No configurado', inline: false },
          { name: 'YouTube', value: config.links.youtube || 'No configurado', inline: false }
        )
        .setTimestamp()

      return interaction.reply({ embeds: [embed], ephemeral: true })
    }

    if (sub === 'live') {
      const config = getConfig(guildId)
      if (!config) {
        return interaction.reply({ content: '❌ No hay configuración de streams. Un admin debe usar `/stream configurar` primero.', ephemeral: true })
      }

      const platform = interaction.options.getString('plataforma')
      const title = interaction.options.getString('titulo')
      const customLink = interaction.options.getString('enlace') || null

      const channel = interaction.guild.channels.cache.get(config.channelId)
      if (!channel) {
        return interaction.reply({ content: '❌ El canal de anuncios ya no existe.', ephemeral: true })
      }

      const link = customLink || config.links[platform] || 'https://example.com'
      const mention = config.roleId ? `<@&${config.roleId}>` : ''

      const colors = {
        twitch: 0x9146ff,
        kick: 0x53fc18,
        youtube: 0xff0000
      }

      const icons = {
        twitch: 'https://cdn.discordapp.com/attachments/330739726321713153/598282410349690890/twitch-logo.png',
        kick: 'https://kick.com/favicon.ico',
        youtube: 'https://www.youtube.com/s/desktop/12d6b690/img/favicon_144x144.png'
      }

      const embed = new EmbedBuilder()
        .setColor(colors[platform] || 0xff6b6b)
        .setTitle(`🔴 ${interaction.user.username} está en vivo!`)
        .setDescription(`**${title}**\n\n[Ver stream](${link})`)
        .addFields(
          { name: 'Plataforma', value: platform.toUpperCase(), inline: true },
          { name: 'Streamer', value: `${interaction.user}`, inline: true }
        )
        .setThumbnail(icons[platform] || null)
        .setFooter({ text: `Solome Bot • ${platform}` })
        .setTimestamp()

      await channel.send({ content: mention, embeds: [embed] })

      return interaction.reply({ content: '✅ Anuncio de stream enviado!', ephemeral: true })
    }
  }

  getSlashCommandData () {
    return {
      name: this.name,
      description: 'Sistema de anuncios para streamers',
      options: [
        {
          type: 1,
          name: 'configurar',
          description: 'Configura el sistema de anuncios de streams (solo admins)',
          options: [
            {
              type: 7,
              name: 'canal',
              description: 'Canal donde se anunciarán los streams',
              required: true
            },
            {
              type: 8,
              name: 'rol',
              description: 'Rol a mencionar cuando alguien esté en vivo',
              required: false
            },
            {
              type: 3,
              name: 'twitch',
              description: 'URL de tu canal de Twitch',
              required: false
            },
            {
              type: 3,
              name: 'kick',
              description: 'URL de tu canal de Kick',
              required: false
            },
            {
              type: 3,
              name: 'youtube',
              description: 'URL de tu canal de YouTube',
              required: false
            }
          ]
        },
        {
          type: 1,
          name: 'live',
          description: 'Anuncia que estás en vivo',
          options: [
            {
              type: 3,
              name: 'plataforma',
              description: 'Plataforma donde estás transmitiendo',
              required: true,
              choices: [
                { name: 'Twitch', value: 'twitch' },
                { name: 'Kick', value: 'kick' },
                { name: 'YouTube', value: 'youtube' }
              ]
            },
            {
              type: 3,
              name: 'titulo',
              description: 'Título de tu stream',
              required: true
            },
            {
              type: 3,
              name: 'enlace',
              description: 'Enlace personalizado (opcional, usa el configurado si no se especifica)',
              required: false
            }
          ]
        },
        {
          type: 1,
          name: 'info',
          description: 'Muestra la configuración actual de streams'
        }
      ]
    }
  }
}
