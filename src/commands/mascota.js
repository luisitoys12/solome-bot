const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Mascota extends Command {
  constructor (client) {
    super(client, {
      name: 'mascota',
      aliases: ['pet'],
      description: '🐾 Adopta y cuida tu mascota virtual'
    })
  }

  async runSlash (interaction) {
    const accion = interaction.options.getString('accion') || 'ver'
    const mascotas = load('mascotas', {})
    const userId = interaction.user.id

    if (accion === 'adoptar') {
      if (mascotas[userId]) {
        return interaction.reply({ content: '❌ Ya tienes una mascota', ephemeral: true })
      }

      const tipos = ['🐶', '🐱', '🐹', '🐰', '🦊']
      const mascota = {
        tipo: tipos[Math.floor(Math.random() * tipos.length)],
        nombre: 'Sin nombre',
        hambre: 50,
        felicidad: 50,
        createdAt: Date.now()
      }

      mascotas[userId] = mascota
      save('mascotas', mascotas)

      return interaction.reply(`🎉 ¡Adoptaste una mascota ${mascota.tipo}!`)
    }

    if (!mascotas[userId]) {
      return interaction.reply({ content: '❌ No tienes mascota. Usa `/mascota accion:adoptar`', ephemeral: true })
    }

    const mascota = mascotas[userId]

    if (accion === 'ver') {
      const embed = new EmbedBuilder()
        .setColor(0xff69b4)
        .setTitle(`${mascota.tipo} ${mascota.nombre}`)
        .addFields(
          { name: '🍔 Hambre', value: `${mascota.hambre}/100`, inline: true },
          { name: '😀 Felicidad', value: `${mascota.felicidad}/100`, inline: true }
        )
        .setTimestamp()

      return interaction.reply({ embeds: [embed] })
    }

    if (accion === 'alimentar') {
      mascota.hambre = Math.min(100, mascota.hambre + 20)
      save('mascotas', mascotas)
      return interaction.reply(`🍔 Alimentaste a tu mascota ${mascota.tipo}`)
    }

    if (accion === 'jugar') {
      mascota.felicidad = Math.min(100, mascota.felicidad + 20)
      save('mascotas', mascotas)
      return interaction.reply(`🎮 Jugaste con tu mascota ${mascota.tipo}`)
    }

    if (accion === 'liberar') {
      delete mascotas[userId]
      save('mascotas', mascotas)
      return interaction.reply(`👋 Liberaste a tu mascota ${mascota.tipo}`)
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'accion',
          description: 'Qué hacer con tu mascota',
          required: false,
          choices: [
            { name: '🐾 Ver mi mascota', value: 'ver' },
            { name: '🏠 Adoptar mascota', value: 'adoptar' },
            { name: '🍔 Alimentar', value: 'alimentar' },
            { name: '🎮 Jugar', value: 'jugar' },
            { name: '🚪 Liberar', value: 'liberar' }
          ]
        }
      ]
    }
  }
}
