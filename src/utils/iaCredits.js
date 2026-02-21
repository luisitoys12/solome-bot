// src/utils/iaCredits.js
const { load, save } = require('./database.js')

const DAILY_FREE_CREDITS = 15

function getData () {
  return load('iaCredits', {})
}

function saveData (data) {
  save('iaCredits', data)
}

function resetIfNeeded (user) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTs = today.getTime()

  if (!user.lastReset || user.lastReset < todayTs) {
    user.credits = DAILY_FREE_CREDITS
    user.lastReset = todayTs
  }
}

/**
 * Obtiene créditos actuales del usuario
 */
function getCredits (userId) {
  const data = getData()
  if (!data[userId]) {
    data[userId] = { credits: DAILY_FREE_CREDITS, lastReset: Date.now() }
    saveData(data)
  } else {
    resetIfNeeded(data[userId])
    saveData(data)
  }
  return data[userId].credits
}

/**
 * Consume 1 crédito (devuelve true si pudo, false si no)
 */
function useCredit (userId) {
  const data = getData()
  if (!data[userId]) {
    data[userId] = { credits: DAILY_FREE_CREDITS, lastReset: Date.now() }
  } else {
    resetIfNeeded(data[userId])
  }

  if (data[userId].credits <= 0) {
    saveData(data)
    return false
  }

  data[userId].credits -= 1
  saveData(data)
  return true
}

/**
 * Recarga créditos manualmente
 */
function addCredits (userId, amount) {
  const data = getData()
  if (!data[userId]) {
    data[userId] = { credits: DAILY_FREE_CREDITS, lastReset: Date.now() }
  }
  data[userId].credits += amount
  saveData(data)
  return data[userId].credits
}

module.exports = { getCredits, useCredit, addCredits, DAILY_FREE_CREDITS }
