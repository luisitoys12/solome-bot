module.exports = class Command {
  constructor (client, options = {}) {
    this.client = client
    this.name = options.name
    this.description = options.description || 'Sin descripción' // ✅ AGREGADO
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

  // ✅ Método por defecto para comandos que no lo tengan
  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
