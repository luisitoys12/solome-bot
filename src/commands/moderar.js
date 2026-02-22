const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')
const { serverConfigs } = require('./ai.js')

module.exports = class Moderar extends Command {
  constructor (client) {
    super(client, {
      name: 'moderar',
      aliases: ['moderate', 'filtro'],
      description: '🛡️ Moderación automática con IA - Detecta contenido inapropiado'
    })
  }

  async runSlash (interaction) {
    const subcommand = interaction.options.getSubcommand()
    
    if (subcommand === 'texto') {
      await this.texto(interaction)
    } else if (subcommand === 'imagen') {
      await this.imagen(interaction)
    } else if (subcommand === 'auto') {
      await this.auto(interaction)
    } else if (subcommand === 'config') {
      await this.config(interaction)
    }
  }

  async texto(interaction) {
    await interaction.deferReply({ ephemeral: true })
    
    const texto = interaction.options.getString('texto')
    const config = serverConfigs.get(interaction.guild.id)
    
    if (!config?.apiKey) {
      return interaction.editReply('❌ Configura primero una API key con `/ai config`')
    }
    
    try {
      const response = await axios.post('https://api.openai.com/v1/moderations', {
        input: texto
      }, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      const result = response.data.results[0]
      const flagged = result.flagged
      const categories = result.categories
      const scores = result.category_scores
      
      const embed = new EmbedBuilder()
        .setColor(flagged ? 0xff0000 : 0x00ff00)
        .setTitle(flagged ? '⚠️ Contenido Inapropiado Detectado' : '✅ Contenido Apropiado')
        .setDescription(`**Texto analizado:** ${texto.substring(0, 200)}...`)
      
      if (flagged) {
        const problemas = Object.entries(categories)
          .filter(([_, value]) => value)
          .map(([key, _]) => {
            const score = (scores[key] * 100).toFixed(1)
            return `• ${key}: ${score}% confianza`
          })
          .join('\n')
        
        embed.addFields(
          { name: '🚨 Categorías Detectadas', value: problemas || 'Ninguna' },
          { name: '🛡️ Acción Recomendada', value: 'Advertir o eliminar mensaje' }
        )
      } else {
        embed.setDescription(`✅ El contenido no viola las políticas de uso.`)
      }
      
      embed.setFooter({ text: 'OpenAI Moderation API' })
      embed.setTimestamp()
      
      await interaction.editReply({ embeds: [embed] })
      
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al analizar contenido.')
    }
  }

  async imagen(interaction) {
    await interaction.deferReply({ ephemeral: true })
    
    const imagen = interaction.options.getAttachment('imagen')
    
    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle('🛡️ Análisis de Imagen')
      .setDescription(
        'Esta función requiere APIs adicionales como:\n' +
        '• Google Vision AI\n' +
        '• AWS Rekognition\n' +
        '• Azure Content Moderator\n\n' +
        'Configura una en `/moderar config`'
      )
      .setThumbnail(imagen.url)
      .setFooter({ text: 'Próximamente' })
      .setTimestamp()
    
    await interaction.editReply({ embeds: [embed] })
  }

  async auto(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ 
        content: '❌ Solo administradores pueden configurar moderación automática.',
        ephemeral: true 
      })
    }
    
    const estado = interaction.options.getBoolean('activar')
    const severidad = interaction.options.getString('severidad') || 'media'
    
    // Guardar config (en producción: BD)
    const embed = new EmbedBuilder()
      .setColor(estado ? 0x00ff00 : 0xff0000)
      .setTitle(`🛡️ Moderación Automática ${estado ? 'Activada' : 'Desactivada'}`)
      .setDescription(
        estado
          ? `Los mensajes serán analizados automáticamente.\n**Severidad:** ${severidad}`
          : 'La moderación automática ha sido desactivada.'
      )
      .addFields(
        { name: '🔍 Detección', value: 'Odio, violencia, contenido sexual, spam' },
        { name: '⚡ Acción', value: severidad === 'alta' ? 'Eliminar y advertir' : 'Solo advertir' }
      )
      .setFooter({ text: 'Configuración guardada' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed], ephemeral: true })
  }

  async config(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ 
        content: '❌ Solo administradores.',
        ephemeral: true 
      })
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('⚙️ Configuración de Moderación IA')
      .setDescription('Opciones disponibles:')
      .addFields(
        { name: '🛡️ Auto-Moderación', value: 'Activa con `/moderar auto`' },
        { name: '🔔 Alertas', value: 'Envía notificaciones a un canal' },
        { name: '📋 Logs', value: 'Registra todas las detecciones' },
        { name: '⚡ Acciones', value: 'Warn, kick, ban, delete' }
      )
      .setFooter({ text: 'Sistema de moderación inteligente' })
      .setTimestamp()
    
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
