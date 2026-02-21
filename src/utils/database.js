// src/utils/database.js
// Simple JSON-based database for Solome Bot 4.0
// Stores lottery, IA credits, chat sessions, and more

const fs = require('fs')
const path = require('path')

const BASE_PATH = path.join(__dirname, '..', '..', 'data')

/**
 * Ensures the data directory exists
 */
function ensureDir () {
  if (!fs.existsSync(BASE_PATH)) {
    fs.mkdirSync(BASE_PATH, { recursive: true })
  }
}

/**
 * Loads a JSON file from /data
 * @param {string} name - Filename without extension
 * @param {*} defaultValue - Value to return if file doesn't exist
 * @returns {*} Parsed JSON or defaultValue
 */
function load (name, defaultValue) {
  ensureDir()
  const file = path.join(BASE_PATH, `${name}.json`)

  if (!fs.existsSync(file)) {
    return defaultValue
  }

  try {
    const raw = fs.readFileSync(file, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    console.error(`Error loading ${name}.json:`, error)
    return defaultValue
  }
}

/**
 * Saves data to a JSON file in /data
 * @param {string} name - Filename without extension
 * @param {*} value - Data to save (will be stringified)
 */
function save (name, value) {
  ensureDir()
  const file = path.join(BASE_PATH, `${name}.json`)
  try {
    fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8')
  } catch (error) {
    console.error(`Error saving ${name}.json:`, error)
  }
}

module.exports = { load, save }
