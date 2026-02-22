// Error Handler with 404 reporting and webhook notification
const { EmbedBuilder, WebhookClient } = require('discord.js')
const axios = require('axios')

// Owner webhook configuration (add to .env: OWNER_WEBHOOK_URL)
const OWNER_WEBHOOK_URL = process.env.OWNER_WEBHOOK_URL || null
let webhookClient = null

if (OWNER_WEBHOOK_URL) {
  try {
    webhookClient = new WebhookClient({ url: OWNER_WEBHOOK_URL })
  } catch (error) {
    console.error('Failed to initialize webhook client:', error)
  }
}

/**
 * Handle 404 command not found errors
 */
async function handle404Error(client, interaction, commandName) {
  const errorData = {
    commandName: commandName,
    userId: interaction.user.id,
    userTag: interaction.user.tag,
    guildId: interaction.guild?.id || 'DM',
    guildName: interaction.guild?.name || 'Direct Message',
    channelId: interaction.channel?.id,
    timestamp: new Date().toISOString(),
    type: 'COMMAND_NOT_FOUND'
  }

  // Log to console
  client.log('error', `❌ 404 Command Not Found: /${commandName} by ${interaction.user.tag} in ${errorData.guildName}`)

  // Save to database/file
  try {
    const fs = require('fs')
    const path = require('path')
    const errorLogPath = path.join(__dirname, '../../data/error-logs.json')
    
    let errorLogs = []
    if (fs.existsSync(errorLogPath)) {
      errorLogs = JSON.parse(fs.readFileSync(errorLogPath, 'utf8'))
    }
    
    errorLogs.push(errorData)
    
    // Keep only last 100 errors
    if (errorLogs.length > 100) {
      errorLogs = errorLogs.slice(-100)
    }
    
    fs.writeFileSync(errorLogPath, JSON.stringify(errorLogs, null, 2))
  } catch (err) {
    console.error('Failed to save error log:', err)
  }

  // Send to owner via webhook
  if (webhookClient) {
    try {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🚨 404 - Comando No Encontrado')
        .setDescription(`Se intentó ejecutar un comando que no existe o no está registrado.`)
        .addFields(
          { name: '📝 Comando', value: `\`/${commandName}\``, inline: true },
          { name: '👤 Usuario', value: `${interaction.user.tag}\n(${interaction.user.id})`, inline: true },
          { name: '🏠 Servidor', value: `${errorData.guildName}\n(${errorData.guildId})`, inline: false },
          { name: '📍 Canal', value: `<#${errorData.channelId}>`, inline: true },
          { name: '⏰ Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setFooter({ text: 'Sistema de Reporte Automático' })
        .setTimestamp()

      await webhookClient.send({
        username: 'Error Reporter',
        avatarURL: 'https://cdn.discordapp.com/emojis/1234567890.png',
        embeds: [embed]
      })

      client.log('info', '✅ Error report sent to owner webhook')
    } catch (error) {
      client.log('error', 'Failed to send webhook notification:', error)
    }
  }

  // Reply to user
  const userEmbed = new EmbedBuilder()
    .setColor(0xff6b6b)
    .setTitle('❌ Error 404: Comando No Encontrado')
    .setDescription(
      `El comando \`/${commandName}\` no existe o no está disponible.\n\n` +
      '**Posibles razones:**\n' +
      '• El comando fue eliminado o renombrado\n' +
      '• Hay un error de escritura\n' +
      '• El bot no tiene permisos necesarios\n\n' +
      '**Solución:**\n' +
      '• Usa `/help` para ver comandos disponibles\n' +
      '• Verifica que escribiste bien el comando\n' +
      '• Contacta a un administrador si el problema persiste'
    )
    .addFields(
      { name: '🆔 Reporte ID', value: `\`${Date.now()}\``, inline: true },
      { name: '📊 Estado', value: '✅ Reportado al desarrollador', inline: true }
    )
    .setFooter({ text: 'Este error ha sido reportado automáticamente' })
    .setTimestamp()

  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [userEmbed] })
    } else {
      await interaction.reply({ embeds: [userEmbed], ephemeral: true })
    }
  } catch (err) {
    client.log('error', 'Failed to send error message to user:', err)
  }

  return errorData
}

/**
 * Handle general command execution errors
 */
async function handleCommandError(client, interaction, error, commandName) {
  client.log('error', `Error executing command /${commandName}:`, error)

  // Send to webhook if critical
  if (webhookClient && error.name !== 'DiscordAPIError') {
    try {
      const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('⚠️ Error de Ejecución de Comando')
        .setDescription(`Error al ejecutar \`/${commandName}\``)
        .addFields(
          { name: '❌ Error', value: `\`\`\`${error.message?.substring(0, 1000)}\`\`\``, inline: false },
          { name: '👤 Usuario', value: `${interaction.user.tag}`, inline: true },
          { name: '🏠 Servidor', value: `${interaction.guild?.name || 'DM'}`, inline: true }
        )
        .setTimestamp()

      await webhookClient.send({ embeds: [embed] })
    } catch (err) {
      client.log('error', 'Failed to send error webhook:', err)
    }
  }

  // Reply to user
  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle('❌ Error de Ejecución')
    .setDescription(
      `Ocurrió un error al ejecutar el comando \`/${commandName}\`.\n\n` +
      '**El error ha sido reportado automáticamente al desarrollador.**'
    )
    .setFooter({ text: 'Intenta nuevamente en unos momentos' })
    .setTimestamp()

  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [embed] })
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true })
    }
  } catch (err) {
    client.log('error', 'Failed to send error message:', err)
  }
}

module.exports = {
  handle404Error,
  handleCommandError,
  webhookClient
}
