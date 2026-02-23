const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Mascota extends Command {
  constructor (client) {
    super(client, {
      name: 'mascota',
      aliases: ['pet'],
      description: '🐾 Sistema de mascotas virtuales - Adopta, cuida y juega con tu mascota'
    })
  }

  async runSlash (interaction) {
    const accion = interaction.options.getString('accion') || 'ver'
    
    if (accion === 'ver') await this.ver(interaction)
    else if (accion === 'adoptar') await this.adoptar(interaction)
    else if (accion === 'alimentar') await this.alimentar(interaction)
    else if (accion === 'jugar') await this.jugar(interaction)
    else if (accion === 'liberar') await this.liberar(interaction)
  }

  async ver(interaction) {
    const mascotas = load('mascotas', {})
    const mascota = mascotas[interaction.user.id]

    if (!mascota) {
      return interaction.reply({ content: '❌ No tienes mascota. Usa `/mascota adoptar`.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle(`🐾 ${mascota.nombre}`)
      .addFields(
        { name: '🌟 Tipo', value: mascota.tipo, inline: true },
        { name: '❤️ Felicidad', value: `${mascota.felicidad}/100`, inline: true },
        { name: '🍔 Hambre', value: `${mascota.hambre}/100`, inline: true }
      )

    await interaction.reply({ embeds: [embed] })
  }

  async adoptar(interaction) {
    const mascotas = load('mascotas', {})
    if (mascotas[interaction.user.id]) {
      return interaction.reply({ content: '❌ Ya tienes una mascota!', ephemeral: true })
    }

    const tipos = ['🐶 Perro', '🐱 Gato', '🐹 Hámster', '🐰 Conejo']
    const tipo = tipos[Math.floor(Math.random() * tipos.length)]

    mascotas[interaction.user.id] = {
      nombre: `Mascota de ${interaction.user.username}`,
      tipo,
      felicidad: 50,
      hambre: 50,
      adoptedAt: Date.now()
    }
    save('mascotas', mascotas)

    await interaction.reply(`✅ ¡Adoptaste un ${tipo}!`)
  }

  async alimentar(interaction) {
    const mascotas = load('mascotas', {})
    const mascota = mascotas[interaction.user.id]

    if (!mascota) {
      return interaction.reply({ content: '❌ No tienes mascota.', ephemeral: true })
    }

    mascota.hambre = Math.max(0, mascota.hambre - 30)
    mascota.felicidad = Math.min(100, mascota.felicidad + 10)
    save('mascotas', mascotas)

    await interaction.reply('🍔 Alimentaste a tu mascota!')
  }

  async jugar(interaction) {
    const mascotas = load('mascotas', {})
    const mascota = mascotas[interaction.user.id]

    if (!mascota) {
      return interaction.reply({ content: '❌ No tienes mascota.', ephemeral: true })
    }

    mascota.felicidad = Math.min(100, mascota.felicidad + 20)
    mascota.hambre = Math.min(100, mascota.hambre + 10)
    save('mascotas', mascotas)

    await interaction.reply('🎾 ¡Jugaste con tu mascota!')
  }

  async liberar(interaction) {
    const mascotas = load('mascotas', {})
    if (!mascotas[interaction.user.id]) {
      return interaction.reply({ content: '❌ No tienes mascota.', ephemeral: true })
    }

    delete mascotas[interaction.user.id]
    save('mascotas', mascotas)

    await interaction.reply('🚪 Liberaste a tu mascota...')
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
            { name: '🏪 Adoptar mascota', value: 'adoptar' },
            { name: '🍽️ Alimentar', value: 'alimentar' },
            { name: '🎮 Jugar', value: 'jugar' },
            { name: '🚪 Liberar', value: 'liberar' }
          ]
        }
      ]
    }
  }
}
