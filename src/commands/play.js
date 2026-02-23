const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Play extends Command {
  constructor (client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'reproducir'],
      description: '🎵 Reproduce música de YouTube, Spotify o SoundCloud'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()
    
    const cancion = interaction.options.getString('cancion')
    
    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Debes estar en un canal de voz')
    }

    // Implementación básica
    await interaction.editReply(`🎵 Reproduciendo: **${cancion}** (sistema de música próximamente)`)
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 3, name: 'cancion', description: 'Nombre de la canción, URL de YouTube/Spotify/SoundCloud o enlace MP3', required: true }
      ]
    }
  }
}
