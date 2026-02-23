const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class Moderar extends Command {
  constructor (client) {
    super(client, {
      name: 'moderar',
      aliases: ['moderate', 'automod'],
      description: '🛡️ Sistema de moderación automática con IA para detectar contenido inapropiado'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()

    if (sub === 'texto') await this.texto(interaction)
    else if (sub === 'imagen') await this.imagen(interaction)
    else if (sub === 'auto') await this.auto(interaction)
    else if (sub === 'config') await this.config(interaction)
  }

  async texto(interaction) {
    await interaction.deferReply({ ephemeral: true })
    const texto = interaction.options.getString('texto')

    // Detección básica (en producción: usar API de moderación)
    const palabrasProhibidas = ['spam', 'scam', 'hack']
    const encontradas = palabrasProhibidas.filter(p => texto.toLowerCase().includes(p))

    const embed = new EmbedBuilder()
      .setColor(encontradas.length > 0 ? 0xff0000 : 0x00ff00)
      .setTitle('🔍 Análisis de Texto')
      .addFields(
        { name: '📝 Texto', value: texto.substring(0, 200), inline: false },
        { name: '⚠️ Resultado', value: encontradas.length > 0 ? `❌ Contenido inapropiado detectado` : `✅ Contenido seguro`, inline: false }
      )

    if (encontradas.length > 0) {
      embed.addFields({ name: '🚨 Palabras detectadas', value: encontradas.join(', ') })
    }

    await interaction.editReply({ embeds: [embed] })
  }

  async imagen(interaction) {
    await interaction.deferReply({ ephemeral: true })
    await interaction.editReply('❌ Moderación de imágenes aún no implementada. Próximamente!')
  }

  async auto(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Solo administradores.', ephemeral: true })
    }

    const activar = interaction.options.getBoolean('activar')
    const severidad = interaction.options.getString('severidad') || 'media'

    const config = load('moderation-config', {})
    config[interaction.guild.id] = { enabled: activar, severity: severidad }
    save('moderation-config', config)

    await interaction.reply({ 
      content: `✅ Moderación automática ${activar ? 'activada' : 'desactivada'} (Severidad: ${severidad})`,
      ephemeral: true 
    })
  }

  async config(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Solo administradores.', ephemeral: true })
    }

    const config = load('moderation-config', {})
    const guildConfig = config[interaction.guild.id] || { enabled: false, severity: 'media' }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('⚙️ Configuración de Moderación')
      .addFields(
        { name: '🔘 Estado', value: guildConfig.enabled ? '✅ Activada' : '❌ Desactivada', inline: true },
        { name: '🎯 Severidad', value: guildConfig.severity, inline: true }
      )

    await interaction.reply({ embeds: [embed], ephemeral: true })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 1,
          name: 'texto',
          description: 'Analiza texto para detectar contenido inapropiado',
          options: [
            { type: 3, name: 'texto', description: 'Texto a analizar', required: true }
          ]
        },
        {
          type: 1,
          name: 'imagen',
          description: 'Analiza imagen para detectar contenido NSFW',
          options: [
            { type: 11, name: 'imagen', description: 'Imagen a analizar', required: true }
          ]
        },
        {
          type: 1,
          name: 'auto',
          description: '[ADMIN] Configura moderación automática',
          options: [
            { type: 5, name: 'activar', description: 'Activar o desactivar', required: true },
            {
              type: 3,
              name: 'severidad',
              description: 'Nivel de moderación',
              required: false,
              choices: [
                { name: '🟢 Baja (Solo alerta)', value: 'baja' },
                { name: '🟡 Media (Advertir)', value: 'media' },
                { name: '🔴 Alta (Eliminar)', value: 'alta' }
              ]
            }
          ]
        },
        {
          type: 1,
          name: 'config',
          description: '[ADMIN] Ver configuración de moderación'
        }
      ]
    }
  }
}
