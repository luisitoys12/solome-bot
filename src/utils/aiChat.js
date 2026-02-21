// src/utils/aiChat.js
// Chat Session Management for Solome Assistant
// Handles thread-based conversation sessions

const { load, save } = require('./database.js')

/**
 * Gets all active chat sessions
 * @returns {Object} Sessions object { threadId: { userId, messages } }
 */
function getSessions () {
  return load('aiSessions', {})
}

/**
 * Saves sessions data
 * @param {Object} data - Sessions object
 */
function saveSessions (data) {
  save('aiSessions', data)
}

/**
 * Creates a new chat session
 * @param {string} threadId - Discord thread ID
 * @param {string} userId - Discord user ID
 */
function createSession (threadId, userId) {
  const data = getSessions()
  data[threadId] = { 
    userId, 
    messages: 0,
    createdAt: Date.now()
  }
  saveSessions(data)
}

/**
 * Closes and removes a chat session
 * @param {string} threadId - Discord thread ID
 */
function closeSession (threadId) {
  const data = getSessions()
  delete data[threadId]
  saveSessions(data)
}

/**
 * Gets a specific session
 * @param {string} threadId - Discord thread ID
 * @returns {Object|null} Session object or null if not found
 */
function getSession (threadId) {
  const data = getSessions()
  return data[threadId] || null
}

/**
 * Increments message count for a session
 * @param {string} threadId - Discord thread ID
 * @returns {number|null} New message count or null if session doesn't exist
 */
function incrementMessages (threadId) {
  const data = getSessions()
  if (!data[threadId]) return null
  
  data[threadId].messages = (data[threadId].messages || 0) + 1
  saveSessions(data)
  return data[threadId].messages
}

module.exports = { 
  createSession, 
  closeSession, 
  getSession,
  incrementMessages,
  getSessions
}
