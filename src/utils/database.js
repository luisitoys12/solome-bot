// src/utils/database.js
const fs = require('fs')
const path = require('path')

const BASE_PATH = path.join(__dirname, '..', '..', 'data')

function ensureDir () {
  if (!fs.existsSync(BASE_PATH)) {
    fs.mkdirSync(BASE_PATH, { recursive: true })
  }
}

/**
 * Carga un JSON desde /data, si no existe devuelve defaultValue
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
  } catch {
    return defaultValue
  }
}

/**
 * Guarda un JSON en /data
 */
function save (name, value) {
  ensureDir()
  const file = path.join(BASE_PATH, `${name}.json`)
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8')
}

module.exports = { load, save }
