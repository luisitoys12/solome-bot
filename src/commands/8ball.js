const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class EightBall extends Command {
  constructor (client) {
    super(client, {
      name: '8ball',
      aliases: [],
      description: 'Ask the magic 8-ball a question'
    })
  }

  async runSlash (interaction) {
    const question = interaction.options.getString('question')
    
    const responses = [
      // Positive
      '✅ Sí, definitivamente.',
      '✅ Es cierto.',
      '✅ Sin duda.',
      '✅ Sí, sin duda.',
      '✅ Puedes confiar en ello.',
      '✅ Como yo lo veo, sí.',
      '✅ Muy probable.',
      '✅ Las perspectivas son buenas.',
      '✅ Sí.',
      '✅ Las señales apuntan a que sí.',
      // Neutral
      '🤔 Respuesta confusa, intenta de nuevo.',
      '🤔 Pregunta de nuevo más tarde.',
      '🤔 Mejor no decirte ahora.',
      '🤔 No puedo predecirlo ahora.',
      '🤔 Concéntrate y pregunta de nuevo.',
      // Negative
      '❌ No cuentes con ello.',
      '❌ Mi respuesta es no.',
      '❌ Mis fuentes dicen que no.',
      '❌ Las perspectivas no son tan buenas.',
      '❌ Muy dudoso.'
    ]

    const answer = responses[Math.floor(Math.random() * responses.length)]

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🎱 Magic 8-Ball')
      .addFields(
        { name: '❓ Pregunta', value: question },
        { name: '🔮 Respuesta', value: answer }
      )
      .setFooter({ text: `Preguntado por ${interaction.user.tag}` })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }
}
