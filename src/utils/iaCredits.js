// src/utils/iaCredits.js
// AI Credits Management System for Solome Bot 4.0
// Handles daily credits, usage tracking, and admin recharges

const { load, save } = require('./database.js')

const DAILY_FREE_CREDITS = 15

/**
 * Gets the credits data object
 */
function getData () {
  return load('iaCredits', {})
}

/**
 * Saves the credits data object
 */
function saveData (data) {
  save('iaCredits', data)
}

/**
 * Resets user credits if it's a new day
 * @param {Object} user - User credits object
 */
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
 * Gets current credits for a user
 * @param {string} userId - Discord user ID
 * @returns {number} Available credits
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
 * Attempts to use 1 credit
 * @param {string} userId - Discord user ID
 * @returns {boolean} true if credit was consumed, false if no credits available
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
 * Adds credits to a user (admin function)
 * @param {string} userId - Discord user ID
 * @param {number} amount - Credits to add
 * @returns {number} New total credits
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
