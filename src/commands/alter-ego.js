const Command = require('../structures/command.js')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

function getAlterEgo(userId) {
  const alterEgos = load('alter-egos', {})
  return alterEgos[userId] || null
}

function saveAlterEgo(userId, data) {
  const alterEgos = load('alter-egos', {})
  alterEgos[userId] = data
  save('alter-egos', alterEgos)
}

module.exports = class AlterEgo extends Command {
  constructor (client) {
    super(client, {
      name: 'alter-ego',
      aliases: ['alterego', 'fursona'],
      description: '🐾 Sistema de alter-ego para therians, furries y otherkin'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()

    if (sub === 'crear') await this.crear(interaction)
    else if (sub === 'editar') await this.editar(interaction)
    else if (sub === 'ver') await this.ver(interaction)
    else if (sub === 'eliminar') await this.eliminar(interaction)
    else if (sub === 'galeria') await this.galeria(interaction)
  }

  async crear(interaction) {
    const existing = getAlterEgo(interaction.user.id)
    if (existing) {
      return interaction.reply({ 
        content: '❌ Ya tienes un alter-ego. Usa `/alter-ego editar` para modificarlo.', 
        flags: 64 // Ephemeral flag
      })
    }

    const nombre = interaction.options.getString('nombre')
    const tipo = interaction.options.getString('tipo')
    const especie = interaction.options.getString('especie')
    const descripcion = interaction.options.getString('descripcion')
    const personalidad = interaction.options.getString('personalidad') || 'No especificada'
    const imagen = interaction.options.getString('imagen') || null

    const data = { nombre, tipo, especie, descripcion, personalidad, imagen, createdAt: Date.now() }
    saveAlterEgo(interaction.user.id, data)

    const embed = new EmbedBuilder()
      .setColor(0x9c27b0)
      .setTitle('🎉 Alter-Ego Creado')
      .setDescription(`**${nombre}** ha sido creado exitosamente!`)
      .addFields(
        { name: '🎭 Tipo', value: tipo, inline: true },
        { name: '🐾 Especie', value: especie, inline: true },
        { name: '📝 Descripción', value: descripcion },
        { name: '✨ Personalidad', value: personalidad }
      )
      .setFooter({ text: 'Usa /alter-ego ver para mostrar tu perfil' })
      .setTimestamp()

    if (imagen) embed.setThumbnail(imagen)

    await interaction.reply({ embeds: [embed] })
  }

  async ver(interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    const data = getAlterEgo(targetUser.id)

    if (!data) {
      return interaction.reply({ 
        content: '❌ Este usuario no tiene alter-ego.', 
        flags: 64 // Ephemeral
      })
    }

    const embed = new EmbedBuilder()
      .setColor(0xff5722)
      .setTitle(`🐾 ${data.nombre}`)
      .setDescription(data.descripcion)
      .addFields(
        { name: '🎭 Tipo', value: data.tipo, inline: true },
        { name: '🐾 Especie', value: data.especie, inline: true },
        { name: '✨ Personalidad', value: data.personalidad }
      )
      .setFooter({ text: `Alter-ego de ${targetUser.tag}` })
      .setTimestamp()

    if (data.imagen) embed.setImage(data.imagen)

    await interaction.reply({ embeds: [embed] })
  }

  async editar(interaction) {
    const data = getAlterEgo(interaction.user.id)
    if (!data) {
      return interaction.reply({ 
        content: '❌ No tienes un alter-ego. Usa `/alter-ego crear`.', 
        flags: 64 
      })
    }

    const campo = interaction.options.getString('campo')
    const valor = interaction.options.getString('valor')

    data[campo] = valor
    saveAlterEgo(interaction.user.id, data)

    await interaction.reply({ 
      content: `✅ **${campo}** actualizado a: ${valor}`, 
      flags: 64 
    })
  }

  async eliminar(interaction) {
    const data = getAlterEgo(interaction.user.id)
    if (!data) {
      return interaction.reply({ 
        content: '❌ No tienes un alter-ego.', 
        flags: 64 
      })
    }

    const alterEgos = load('alter-egos', {})
    delete alterEgos[interaction.user.id]
    save('alter-egos', alterEgos)

    await interaction.reply({ 
      content: '✅ Tu alter-ego ha sido eliminado.', 
      flags: 64 
    })
  }

  async galeria(interaction) {
    // ✅ Defer para evitar timeout
    await interaction.deferReply()
    
    try {
      const alterEgos = load('alter-egos', {})
      
      // ✅ NO hacer guild.members.fetch() - causa rate limit
      // Solo mostrar alter-egos sin verificar si están en el servidor
      const allAlterEgos = Object.entries(alterEgos).map(([userId, data]) => ({
        userId,
        ...data
      }))

      if (allAlterEgos.length === 0) {
        return interaction.editReply({ 
          content: '❌ No hay alter-egos registrados aún.'
        })
      }

      const embed = new EmbedBuilder()
        .setColor(0x673ab7)
        .setTitle('🎭 Galería de Alter-Egos')
        .setDescription(`${allAlterEgos.length} alter-egos registrados`)
        .setFooter({ text: 'Crea el tuyo con /alter-ego crear' })

      // Mostrar primeros 10
      allAlterEgos.slice(0, 10).forEach(ae => {
        embed.addFields({ 
          name: `🐾 ${ae.nombre}`, 
          value: `<@${ae.userId}> - ${ae.tipo} (${ae.especie})`,
          inline: false
        })
      })

      if (allAlterEgos.length > 10) {
        embed.setFooter({ text: `Mostrando 10 de ${allAlterEgos.length} alter-egos` })
      }

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      this.client.log('error', 'Error en galeria:', error)
      await interaction.editReply({ 
        content: '❌ Error al cargar la galería.' 
      }).catch(() => {})
    }
  }

  getSlashCommandData() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub =>
        sub
          .setName('crear')
          .setDescription('Crea tu alter-ego, therian o fursona')
          .addStringOption(opt => opt.setName('nombre').setDescription('Nombre de tu alter-ego').setRequired(true))
          .addStringOption(opt =>
            opt
              .setName('tipo')
              .setDescription('Tipo de alter-ego')
              .setRequired(true)
              .addChoices(
                { name: 'Therian', value: 'therian' },
                { name: 'Fursona', value: 'fursona' },
                { name: 'Kintype', value: 'kintype' },
                { name: 'Original Character', value: 'oc' }
              )
          )
          .addStringOption(opt => opt.setName('especie').setDescription('Especie (lobo, dragón, etc.)').setRequired(true))
          .addStringOption(opt => opt.setName('descripcion').setDescription('Descripción física').setRequired(true))
          .addStringOption(opt => opt.setName('personalidad').setDescription('Rasgos de personalidad').setRequired(false))
          .addStringOption(opt => opt.setName('imagen').setDescription('URL de imagen de referencia').setRequired(false))
      )
      .addSubcommand(sub =>
        sub
          .setName('editar')
          .setDescription('Edita tu alter-ego existente')
          .addStringOption(opt =>
            opt
              .setName('campo')
              .setDescription('Campo a editar')
              .setRequired(true)
              .addChoices(
                { name: 'Nombre', value: 'nombre' },
                { name: 'Especie', value: 'especie' },
                { name: 'Descripción', value: 'descripcion' },
                { name: 'Personalidad', value: 'personalidad' },
                { name: 'Imagen', value: 'imagen' }
              )
          )
          .addStringOption(opt => opt.setName('valor').setDescription('Nuevo valor').setRequired(true))
      )
      .addSubcommand(sub =>
        sub
          .setName('ver')
          .setDescription('Ver alter-ego de alguien')
          .addUserOption(opt => opt.setName('usuario').setDescription('Usuario a consultar (opcional)').setRequired(false))
      )
      .addSubcommand(sub =>
        sub
          .setName('eliminar')
          .setDescription('Elimina tu alter-ego permanentemente')
      )
      .addSubcommand(sub =>
        sub
          .setName('galeria')
          .setDescription('Muestra la galería de alter-egos')
      )
  }
}
