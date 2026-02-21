// src/utils/ownerOnly.js
// Lista de IDs de usuarios que son dueños del bot
const OWNER_IDS = [
  // Añade tu ID aquí
  // '123456789012345678',
]

/**
 * Verifica si un usuario es dueño del bot
 */
function isOwner (userId) {
  return OWNER_IDS.includes(userId)
}

/**
 * Middleware para comandos exclusivos del dueño
 * Retorna true si el usuario puede ejecutar, false si no
 */
function checkOwner (interaction) {
  if (!isOwner(interaction.user.id)) {
    interaction.reply({ 
      content: '❌ Este comando solo puede ser usado por el dueño del bot.', 
      ephemeral: true 
    })
    return false
  }
  return true
}

module.exports = { isOwner, checkOwner, OWNER_IDS }
