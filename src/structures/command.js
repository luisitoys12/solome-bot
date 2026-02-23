const { SlashCommandBuilder } = require('discord.js')

module.exports = class Command {
  constructor (client, options = {}) {
    this.client = client
    this.name = options.name
    this.description = options.description || 'Sin descripción'
    this.aliases = options.aliases || []
    this.onlyDev = options.onlyDev || false
    this.category = options.category || 'general'
  }

  _run (message, args) {
    return this.run(message, args)
  }

  canRun () {
    return true
  }

  // ✅ Método que retorna SlashCommandBuilder CORRECTO para Discord
  getSlashCommandData() {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
    
    // Las subclases pueden sobrescribir este método para agregar opciones
    return builder
  }
}
