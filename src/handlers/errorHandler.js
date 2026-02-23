const { EmbedBuilder } = require('discord.js')

// Mensajes de error amigables para usuarios
const ERROR_MESSAGES = {
  TIMEOUT: '❌ El comando tardó demasiado en responder. Intenta de nuevo.',
  API_ERROR: '❌ Error de conexión. Intenta de nuevo en unos momentos.',
  PERMISSION: '❌ No tienes permisos para ejecutar este comando.',
  NOT_FOUND: '❌ Recurso no encontrado.',
  RATE_LIMIT: '❌ Demasiadas peticiones. Espera unos segundos.',
  INVALID_INPUT: '❌ Parámetros inválidos. Verifica tu comando.',
  DATABASE: '❌ Error temporal del sistema. Intenta de nuevo.',
  UNKNOWN: '❌ Ocurrió un error inesperado. El problema ha sido reportado.'
}

/**
 * Detecta el tipo de error y retorna un mensaje amigable
 */
function getErrorType(error) {
  if (!error) return 'UNKNOWN'
  
  const message = error.message?.toLowerCase() || ''
  
  if (message.includes('timeout') || message.includes('timed out')) return 'TIMEOUT'
  if (message.includes('rate limit')) return 'RATE_LIMIT'
  if (message.includes('permission')) return 'PERMISSION'
  if (message.includes('not found') || error.code === 10062) return 'NOT_FOUND'
  if (message.includes('api') || message.includes('fetch')) return 'API_ERROR'
  if (message.includes('database') || message.includes('enoent')) return 'DATABASE'
  if (message.includes('invalid') || message.includes('required')) return 'INVALID_INPUT'
  
  return 'UNKNOWN'
}

/**
 * Maneja errores de comandos y responde al usuario de forma amigable
 */
async function handleCommandError(client, interaction, error, commandName) {
  const errorType = getErrorType(error)
  const userMessage = ERROR_MESSAGES[errorType]
  
  // Log completo en consola para debugging (solo visible para admins del servidor)
  client.log('error', `❌ Error en comando /${commandName}:`, {
    user: interaction.user.tag,
    guild: interaction.guild?.name || 'DM',
    error: error.message,
    stack: error.stack?.split('\n').slice(0, 3).join('\n')
  })
  
  // Log detallado en archivo si existe sistema de logs
  if (client.logger) {
    client.logger.error({
      command: commandName,
      user: interaction.user.id,
      guild: interaction.guild?.id,
      error: error.message,
      stack: error.stack
    })
  }
  
  // Responder al usuario con mensaje amigable (SIN stack trace)
  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('❌ Error al ejecutar comando')
    .setDescription(userMessage)
    .setFooter({ 
      text: 'Si el problema persiste, contacta a los administradores',
      iconURL: interaction.client.user.displayAvatarURL()
    })
    .setTimestamp()
  
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ embeds: [embed], flags: 64 })
    } else {
      await interaction.reply({ embeds: [embed], flags: 64 })
    }
  } catch (replyError) {
    // Si no se puede responder, solo loguear
    client.log('error', 'No se pudo responder al usuario:', replyError.message)
  }
}

/**
 * Maneja errores 404 (comando no encontrado)
 */
async function handle404Error(client, interaction, commandName) {
  client.log('warn', `Comando no encontrado: /${commandName} por ${interaction.user.tag}`)
  
  const embed = new EmbedBuilder()
    .setColor(0xf39c12)
    .setTitle('⚠️ Comando no encontrado')
    .setDescription(
      `El comando \`/${commandName}\` no existe o no está disponible.\n\n` +
      'Usa `/help` para ver todos los comandos disponibles.'
    )
    .setFooter({ text: 'Verifica que escribiste el comando correctamente' })
    .setTimestamp()
  
  try {
    await interaction.reply({ embeds: [embed], flags: 64 })
  } catch (error) {
    client.log('error', 'Error enviando mensaje 404:', error.message)
  }
}

/**
 * Maneja errores de permisos
 */
async function handlePermissionError(client, interaction, requiredPermission) {
  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🚫 Sin permisos')
    .setDescription(
      `No tienes permisos para ejecutar este comando.\n\n` +
      `**Permiso requerido:** \`${requiredPermission}\``
    )
    .setFooter({ text: 'Contacta a un administrador si crees que es un error' })
    .setTimestamp()
  
  try {
    await interaction.reply({ embeds: [embed], flags: 64 })
  } catch (error) {
    client.log('error', 'Error enviando mensaje de permisos:', error.message)
  }
}

/**
 * Formatea errores para logs (sin exponer a usuarios)
 */
function formatErrorForLog(error) {
  if (!error) return 'Unknown error'
  
  return {
    message: error.message,
    name: error.name,
    code: error.code,
    stack: error.stack?.split('\n').slice(0, 5).join('\n')
  }
}

module.exports = {
  handleCommandError,
  handle404Error,
  handlePermissionError,
  formatErrorForLog,
  getErrorType
}
