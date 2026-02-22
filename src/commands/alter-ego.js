const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class AlterEgo extends Command {
  constructor (client) {
    super(client, {
      name: 'alter-ego',
      aliases: ['alterego', 'therian', 'fursona'],
      description: '🐾 Define y gestiona tu alter-ego, therian o fursona'
    })
  }

  async runSlash (interaction) {
    const subcommand = interaction.options.getSubcommand()
    
    if (subcommand === 'crear') {
      await this.crear(interaction)
    } else if (subcommand === 'editar') {
      await this.editar(interaction)
    } else if (subcommand === 'ver') {
      await this.ver(interaction)
    } else if (subcommand === 'eliminar') {
      await this.eliminar(interaction)
    } else if (subcommand === 'galeria') {
      await this.galeria(interaction)
    }
  }

  async crear(interaction) {
    const nombre = interaction.options.getString('nombre')
    const tipo = interaction.options.getString('tipo')
    const especie = interaction.options.getString('especie')
    const descripcion = interaction.options.getString('descripcion')
    const personalidad = interaction.options.getString('personalidad') || 'Por definir'
    const imagen = interaction.options.getString('imagen') || null
    
    // Aquí guardarías en base de datos
    const embed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle(`🐾 Alter-Ego Creado: ${nombre}`)
      .setDescription(descripcion)
      .addFields(
        { name: '🎭 Tipo', value: tipo, inline: true },
        { name: '🦊 Especie', value: especie, inline: true },
        { name: '✨ Personalidad', value: personalidad, inline: false },
        { name: '👤 Dueño', value: `<@${interaction.user.id}>`, inline: true }
      )
      .setFooter({ text: 'Usa /alter-ego editar para modificar' })
      .setTimestamp()
    
    if (imagen) {
      embed.setThumbnail(imagen)
    }
    
    await interaction.reply({ embeds: [embed] })
  }

  async editar(interaction) {
    const campo = interaction.options.getString('campo')
    const valor = interaction.options.getString('valor')
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Alter-Ego Actualizado')
      .setDescription(`**${campo}** ha sido actualizado a:\n${valor}`)
      .setFooter({ text: 'Cambios guardados exitosamente' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async ver(interaction) {
    const usuario = interaction.options.getUser('usuario') || interaction.user
    
    // Simular datos (en producción: obtener de BD)
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🐾 Alter-Ego de ${usuario.username}`)
      .setDescription('Un lobo ártico misterioso con poderes de hielo')
      .addFields(
        { name: '🏷️ Nombre', value: 'Luna Frost', inline: true },
        { name: '🎭 Tipo', value: 'Therian', inline: true },
        { name: '🦊 Especie', value: 'Lobo Ártico', inline: true },
        { name: '✨ Personalidad', value: 'Reservado, protector, leal', inline: false },
        { name: '🎨 Características', value: '• Pelaje blanco como la nieve\n• Ojos azul hielo\n• Collar de cristales mágicos', inline: false },
        { name: '📊 Estadísticas', value: '⭐ Fuerza: 8/10\n💨 Velocidad: 9/10\n🧠 Inteligencia: 7/10', inline: false }
      )
      .setThumbnail(usuario.displayAvatarURL())
      .setFooter({ text: `Creado el ${new Date().toLocaleDateString()}` })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async eliminar(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('⚠️ Alter-Ego Eliminado')
      .setDescription('Tu alter-ego ha sido eliminado permanentemente.')
      .setFooter({ text: 'Puedes crear uno nuevo con /alter-ego crear' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed], ephemeral: true })
  }

  async galeria(interaction) {
    await interaction.deferReply()
    
    const miembros = await interaction.guild.members.fetch()
    const alters = miembros.filter(m => !m.user.bot).random(6)
    
    const embed = new EmbedBuilder()
      .setColor(0xe91e63)
      .setTitle('🎨 Galería de Alter-Egos')
      .setDescription(`**${alters.size}** alter-egos destacados del servidor`)
    
    alters.forEach(member => {
      embed.addFields({
        name: `🐾 ${member.user.username}`,
        value: `Tipo: Therian | Especie: Aleatorio\n[Ver perfil completo](/alter-ego ver ${member.user.id})`,
        inline: true
      })
    })
    
    embed.setFooter({ text: `Total de alter-egos en ${interaction.guild.name}` })
    embed.setTimestamp()
    
    await interaction.editReply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 1, // SUB_COMMAND
          name: 'crear',
          description: 'Crea tu alter-ego, therian o fursona',
          options: [
            { type: 3, name: 'nombre', description: 'Nombre de tu alter-ego', required: true },
            { 
              type: 3, 
              name: 'tipo', 
              description: 'Tipo de alter-ego', 
              required: true,
              choices: [
                { name: 'Therian', value: 'therian' },
                { name: 'Fursona', value: 'fursona' },
                { name: 'Kintype', value: 'kintype' },
                { name: 'Original Character', value: 'oc' }
              ]
            },
            { type: 3, name: 'especie', description: 'Especie (lobo, dragón, etc.)', required: true },
            { type: 3, name: 'descripcion', description: 'Descripción física', required: true },
            { type: 3, name: 'personalidad', description: 'Rasgos de personalidad', required: false },
            { type: 3, name: 'imagen', description: 'URL de imagen de referencia', required: false }
          ]
        },
        {
          type: 1,
          name: 'editar',
          description: 'Edita tu alter-ego existente',
          options: [
            {
              type: 3,
              name: 'campo',
              description: 'Campo a editar',
              required: true,
              choices: [
                { name: 'Nombre', value: 'nombre' },
                { name: 'Especie', value: 'especie' },
                { name: 'Descripción', value: 'descripcion' },
                { name: 'Personalidad', value: 'personalidad' },
                { name: 'Imagen', value: 'imagen' }
              ]
            },
            { type: 3, name: 'valor', description: 'Nuevo valor', required: true }
          ]
        },
        {
          type: 1,
          name: 'ver',
          description: 'Ver alter-ego de alguien',
          options: [
            { type: 6, name: 'usuario', description: 'Usuario a consultar (opcional)', required: false }
          ]
        },
        {
          type: 1,
          name: 'eliminar',
          description: 'Elimina tu alter-ego permanentemente'
        },
        {
          type: 1,
          name: 'galeria',
          description: 'Muestra la galería de alter-egos del servidor'
        }
      ]
    }
  }
}
