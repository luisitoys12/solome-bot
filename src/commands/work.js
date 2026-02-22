const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

const TRABAJOS = [
  { nombre: 'Programador', min: 200, max: 800, emoji: '💻' },
  { nombre: 'DJ de Radio', min: 150, max: 600, emoji: '🎙️' },
  { nombre: 'Streamer', min: 100, max: 500, emoji: '📹' },
  { nombre: 'Músico', min: 120, max: 550, emoji: '🎵' },
  { nombre: 'Chef', min: 90, max: 400, emoji: '🍳' },
  { nombre: 'Gamer Profesional', min: 180, max: 700, emoji: '🎮' },
  { nombre: 'Artista', min: 110, max: 480, emoji: '🎨' },
  { nombre: 'Youtuber', min: 140, max: 620, emoji: '🎥' }
]

module.exports = class Work extends Command {
  constructor (client) {
    super(client, {
      name: 'work',
      aliases: ['trabajar', 'trabajo'],
      description: '💼 Trabaja para ganar monedas'
    })
  }

  async runSlash (interaction) {
    const trabajo = TRABAJOS[Math.floor(Math.random() * TRABAJOS.length)]
    const ganancia = Math.floor(Math.random() * (trabajo.max - trabajo.min + 1)) + trabajo.min
    
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`${trabajo.emoji} Has trabajado como ${trabajo.nombre}`)
      .setDescription(`Has ganado **$${ganancia.toLocaleString()}** monedas`)
      .addFields(
        { name: '💼 Trabajo realizado', value: trabajo.nombre, inline: true },
        { name: '💵 Pago', value: `$${ganancia}`, inline: true }
      )
      .setFooter({ text: 'Puedes trabajar cada hora' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
