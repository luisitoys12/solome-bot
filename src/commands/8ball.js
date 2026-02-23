const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class EightBall extends Command {
  constructor (client) {
    super(client, {
      name: '8ball',
      aliases: ['bola8', 'pregunta'],
      description: '🎱 Hazle una pregunta a la bola 8'
    })
    
    this.respuestas = [
      // Afirmativas
      '✅ Sí, definitivamente',
      '✅ Sin duda',
      '✅ Es cierto',
      '✅ Puedes contar con ello',
      '✅ Como yo lo veo, sí',
      '✅ Lo más probable',
      '✅ Las perspectivas son buenas',
      '✅ Sí',
      '✅ Las señales apuntan a que sí',
      // Neutrales
      '🤔 Respuesta confusa, intenta de nuevo',
      '🤔 Pregunta de nuevo más tarde',
      '🤔 Mejor no decirte ahora',
      '🤔 No puedo predecir ahora',
      '🤔 Concéntrate y pregunta de nuevo',
      // Negativas
      '❌ No cuentes con ello',
      '❌ Mi respuesta es no',
      '❌ Mis fuentes dicen que no',
      '❌ Las perspectivas no son buenas',
      '❌ Muy dudoso'
    ]
  }

  async runSlash (interaction) {
    const pregunta = interaction.options.getString('pregunta')
    const respuesta = this.respuestas[Math.floor(Math.random() * this.respuestas.length)]
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🎱 Bola Mágica 8')
      .addFields(
        { name: '❓ Pregunta', value: pregunta, inline: false },
        { name: '💬 Respuesta', value: respuesta, inline: false }
      )
      .setFooter({ text: `Preguntado por ${interaction.user.tag}` })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3, // STRING
          name: 'pregunta',
          description: 'Tu pregunta para la bola 8',
          required: true
        }
      ]
    }
  }
}
