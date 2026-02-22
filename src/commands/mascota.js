const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

const MASCOTAS = [
  { nombre: 'Perro', emoji: '🐶', hambre: 'Croquetas', costo: 1000 },
  { nombre: 'Gato', emoji: '🐱', hambre: 'Pescado', costo: 1200 },
  { nombre: 'Conejo', emoji: '🐰', hambre: 'Zanahorias', costo: 800 },
  { nombre: 'Dragón', emoji: '🐉', hambre: 'Fuego', costo: 5000 },
  { nombre: 'Unicornio', emoji: '🦄', hambre: 'Arcoiris', costo: 10000 },
  { nombre: 'Phoenix', emoji: '🦅', hambre: 'Cenizas', costo: 15000 }
]

module.exports = class Mascota extends Command {
  constructor (client) {
    super(client, {
      name: 'mascota',
      aliases: ['pet'],
      description: '🐾 Adopta y cuida tu mascota virtual'
    })
  }

  async runSlash (interaction) {
    const accion = interaction.options.getString('accion')
    
    if (accion === 'adoptar') {
      const lista = MASCOTAS.map((m, i) => 
        `${i + 1}. ${m.emoji} **${m.nombre}** - $${m.costo.toLocaleString()}`
      ).join('\n')
      
      const embed = new EmbedBuilder()
        .setColor(0xff69b4)
        .setTitle('🐾 Tienda de Mascotas')
        .setDescription('Selecciona tu mascota ideal:\n\n' + lista)
        .addFields({ name: '🍽️ Cuidados', value: 'Alimenta a tu mascota diariamente para mantenerla feliz' })
        .setFooter({ text: 'Usa /mascota adoptar <nombre>' })
        .setTimestamp()
      
      return interaction.reply({ embeds: [embed] })
    }
    
    if (accion === 'alimentar') {
      const mascota = MASCOTAS[Math.floor(Math.random() * MASCOTAS.length)]
      const felicidad = Math.floor(Math.random() * 30) + 70
      
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`${mascota.emoji} Mascota Alimentada`)
        .setDescription(`Tu ${mascota.nombre} está feliz!`)
        .addFields(
          { name: '❤️ Felicidad', value: `${felicidad}%`, inline: true },
          { name: '🍽️ Comida', value: mascota.hambre, inline: true },
          { name: '⭐ Nivel', value: `${Math.floor(felicidad / 10)}`, inline: true }
        )
        .setTimestamp()
      
      return interaction.reply({ embeds: [embed] })
    }
    
    // Acción por defecto: mostrar mascota
    const mascota = MASCOTAS[1] // Simular mascota del usuario
    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle(`${mascota.emoji} Tu ${mascota.nombre}`)
      .addFields(
        { name: '❤️ Felicidad', value: '85%', inline: true },
        { name: '🍽️ Hambre', value: 'Media', inline: true },
        { name: '⭐ Nivel', value: '8', inline: true }
      )
      .setFooter({ text: 'Alimenta a tu mascota cada día' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
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
