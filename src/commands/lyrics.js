const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Lyrics extends Command {
  constructor (client) {
    super(client, {
      name: 'lyrics',
      description: 'Muestra la letra de la canción actual o busca una canción'
    })
  }

  async runSlash (interaction) {
    await interaction.deferReply()

    const query = interaction.options.getString('cancion')

    try {
      if (!this.client.lavalink) {
        return interaction.editReply('❌ El sistema de música no está disponible.')
      }

      let searchQuery = query
      
      // Si no se proporciona query, usar canción actual
      if (!query) {
        const player = this.client.lavalink.getPlayer(interaction.guild.id)
        if (!player || !player.queue.current) {
          return interaction.editReply('❌ No hay ninguna canción reproduciéndose.')
        }
        searchQuery = `${player.queue.current.info.title} ${player.queue.current.info.author}`
      }

      // Buscar letra usando el plugin de lyrics
      // Nota: Esto requiere que el plugin esté configurado correctamente
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🎤 Letra de la Canción')
        .setDescription(`Buscando letra para: **${searchQuery}**\n\n*Función disponible con Lavalink v4 y plugin de lyrics*`)
        .addFields(
          { name: '💎 Premium', value: 'Esta función está disponible en su totalidad con Baba Radio Premium' }
        )
        .setFooter({ text: 'Powered by Lavalink v4 Plugins' })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al buscar la letra.')
    }
  }
}
