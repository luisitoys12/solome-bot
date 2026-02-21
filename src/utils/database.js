// src/utils/database.js
// Simple JSON-based storage system for BabaRadio Bot
// Stores data in /data directory with automatic creation

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
 * Load JSON data from /data directory
 * @param {string} name - File name (without .json)
 * @param {*} defaultValue - Default value if file doesn't exist
 * @returns {*} Parsed JSON data or defaultValue
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
 * Save JSON data to /data directory
 * @param {string} name - File name (without .json)
 * @param {*} value - Data to save
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
