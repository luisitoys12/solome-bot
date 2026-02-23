const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
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
      return interaction.reply({ content: '❌ Ya tienes un alter-ego. Usa `/alter-ego editar` para modificarlo.', ephemeral: true })
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
      return interaction.reply({ content: '❌ Este usuario no tiene alter-ego.', ephemeral: true })
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
      return interaction.reply({ content: '❌ No tienes un alter-ego. Usa `/alter-ego crear`.', ephemeral: true })
    }

    const campo = interaction.options.getString('campo')
    const valor = interaction.options.getString('valor')

    data[campo] = valor
    saveAlterEgo(interaction.user.id, data)

    await interaction.reply({ content: `✅ **${campo}** actualizado a: ${valor}`, ephemeral: true })
  }

  async eliminar(interaction) {
    const data = getAlterEgo(interaction.user.id)
    if (!data) {
      return interaction.reply({ content: '❌ No tienes un alter-ego.', ephemeral: true })
    }

    const alterEgos = load('alter-egos', {})
    delete alterEgos[interaction.user.id]
    save('alter-egos', alterEgos)

    await interaction.reply({ content: '✅ Tu alter-ego ha sido eliminado.', ephemeral: true })
  }

  async galeria(interaction) {
    const alterEgos = load('alter-egos', {})
    const guildMembers = await interaction.guild.members.fetch()
    const guildAlterEgos = []

    for (const [userId, data] of Object.entries(alterEgos)) {
      if (guildMembers.has(userId)) {
        guildAlterEgos.push({ userId, ...data })
      }
    }

    if (guildAlterEgos.length === 0) {
      return interaction.reply({ content: '❌ No hay alter-egos en este servidor.', ephemeral: true })
    }

    const embed = new EmbedBuilder()
      .setColor(0x673ab7)
      .setTitle('🎭 Galería de Alter-Egos')
      .setDescription(`${guildAlterEgos.length} alter-egos en este servidor`)

    guildAlterEgos.slice(0, 10).forEach(ae => {
      embed.addFields({ name: `🐾 ${ae.nombre}`, value: `<@${ae.userId}> - ${ae.tipo} (${ae.especie})` })
    })

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 1,
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
