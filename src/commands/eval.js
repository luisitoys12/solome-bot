const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const util = require('util')

const codeBlock = (text) => `\`\`\`js\n${text}\n\`\`\``
const cleanCode = (text) => typeof text === 'string' ? text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`) : text

module.exports = class Eval extends Command {
  constructor (client) {
    super(client, {
      name: 'eval',
      description: '🔧 Evalúa código JavaScript (solo desarrolladores)',
      aliases: ['evaluate'],
      onlyDev: true
    })
  }

  async runSlash (interaction) {
    // Verificar si es desarrollador
    const devIds = ['TU_ID_AQUI', '123456789'] // Agregar IDs de devs
    if (!devIds.includes(interaction.user.id)) {
      return interaction.reply({ content: '❌ Este comando es solo para desarrolladores.', ephemeral: true })
    }

    const code = interaction.options.getString('codigo')
    
    try {
      let evaledCode = eval(code)
      if (typeof evaledCode !== 'string') evaledCode = util.inspect(evaledCode)
      
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ Código Evaluado')
        .addFields(
          { name: 'Input', value: codeBlock(code.substring(0, 1000)) },
          { name: 'Output', value: codeBlock(cleanCode(evaledCode).substring(0, 1000)) }
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('❌ Error en Evaluación')
        .addFields(
          { name: 'Input', value: codeBlock(code.substring(0, 1000)) },
          { name: 'Error', value: codeBlock(cleanCode(error.toString()).substring(0, 1000)) }
        )
        .setTimestamp()

      await interaction.reply({ embeds: [embed], ephemeral: true })
    }
  }

  run (message, args) {
    // Verificar si es desarrollador
    const devIds = ['TU_ID_AQUI', '123456789']
    if (!devIds.includes(message.author.id)) {
      return message.reply('❌ Este comando es solo para desarrolladores.')
    }

    try {
      let evaledCode = eval(args.join(' ').replace(/(^`{3}(\w+)?|`{3}$)/g, ''))
      if (typeof evaledCode !== 'string') evaledCode = util.inspect(evaledCode)
      
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .addFields(
          { name: 'Input', value: codeBlock(args.join(' ')) },
          { name: 'Output', value: codeBlock(cleanCode(evaledCode).substring(0, 1000)) }
        )

      message.channel.send({ embeds: [embed] })
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .addFields(
          { name: 'Input', value: codeBlock(args.join(' ')) },
          { name: 'Error', value: codeBlock(cleanCode(error.toString())) }
        )

      message.channel.send({ embeds: [embed] })
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          name: 'codigo',
          description: 'Código JavaScript a evaluar',
          type: 3, // STRING
          required: true
        }
      ]
    }
  }
}
