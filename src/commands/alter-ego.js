// src/commands/alter-ego.js
// Alter-Ego System for Therians, Furries & Otherkin
// Respectful and fun identity expression for trending communities

const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

const ANIMAL_EMOJIS = {
  lobo: '🐺',
  zorro: '🦊',
  gato: '🐱',
  perro: '🐶',
  leon: '🦁',
  tigre: '🐅',
  oso: '🐻',
  conejo: '🐰',
  dragon: '🐉',
  aguila: '🦅',
  cuervo: '🦤',
  buho: '🦉',
  mapache: '🦝',
  venado: '🦌',
  otro: '✨'
}

const HOWLS = [
  '*aulla hacia la luna* 🌕🐺',
  '*mueve las orejas con curiosidad* 🐾',
  '*sacude la cola con emoción* ✨',
  '*gruñe de forma amistosa* 💪',
  '*estira las patas* 🦴',
  '*olfatea el aire* 👃',
  '*corre por el bosque* 🌲',
  '*salta con energía* 🥸'
]

/**
 * Get alter-ego profile
 */
function getAlterEgo (userId) {
  const profiles = load('alter-ego', {})
  return profiles[userId] || null
}

/**
 * Save alter-ego profile
 */
function saveAlterEgo (userId, profile) {
  const profiles = load('alter-ego', {})
  profiles[userId] = profile
  save('alter-ego', profiles)
}

module.exports = class AlterEgo extends Command {
  constructor (client) {
    super(client, {
      name: 'alter-ego',
      aliases: ['therian', 'fursona', 'kintype'],
      description: '🐾 Sistema de alter-ego para therians, furries y otherkin'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()

    // Subcommand: configurar (setup alter-ego)
    if (sub === 'configurar') {
      await interaction.deferReply({ ephemeral: true })

      const especie = interaction.options.getString('especie')
      const nombre = interaction.options.getString('nombre') || null
      const pronombres = interaction.options.getString('pronombres') || 'they/them'
      const descripcion = interaction.options.getString('descripcion') || 'Sin descripción'

      const profile = {
        especie,
        nombre,
        pronombres,
        descripcion,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      saveAlterEgo(interaction.user.id, profile)

      const emoji = ANIMAL_EMOJIS[especie] || ANIMAL_EMOJIS.otro
      const displayName = nombre || `${especie.charAt(0).toUpperCase() + especie.slice(1)}`

      const embed = new EmbedBuilder()
        .setColor(0xe91e63)
        .setTitle(`${emoji} Alter-Ego Configurado`)
        .setDescription(`¡Tu identidad ha sido actualizada!`)
        .addFields(
          { name: '🐾 Especie', value: `${emoji} ${especie.charAt(0).toUpperCase() + especie.slice(1)}`, inline: true },
          { name: '📛 Nombre', value: displayName, inline: true },
          { name: '🏳️ Pronombres', value: pronombres, inline: true },
          { name: '✨ Descripción', value: descripcion, inline: false }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: 'Tu identidad es válida y respetada aquí ❤️' })
        .setTimestamp()

      return interaction.editReply({ embeds: [embed] })
    }

    // Subcommand: ver (view alter-ego)
    if (sub === 'ver') {
      const targetUser = interaction.options.getUser('usuario') || interaction.user
      const profile = getAlterEgo(targetUser.id)

      if (!profile) {
        return interaction.reply({
          content: targetUser.id === interaction.user.id
            ? '❌ No tienes un alter-ego configurado. Usa `/alter-ego configurar` para crear uno.'
            : `❌ ${targetUser.username} no tiene un alter-ego configurado.`,
          ephemeral: true
        })
      }

      const emoji = ANIMAL_EMOJIS[profile.especie] || ANIMAL_EMOJIS.otro
      const displayName = profile.nombre || profile.especie
      const createdDate = new Date(profile.createdAt).toLocaleDateString('es-ES')

      const embed = new EmbedBuilder()
        .setColor(0xf06292)
        .setTitle(`${emoji} Alter-Ego: ${displayName}`)
        .setDescription(`Identidad de ${targetUser.username}`)
        .addFields(
          { name: '🐾 Especie', value: `${emoji} ${profile.especie.charAt(0).toUpperCase() + profile.especie.slice(1)}`, inline: true },
          { name: '🏳️ Pronombres', value: profile.pronombres, inline: true },
          { name: '✨ Sobre mí', value: profile.descripcion, inline: false },
          { name: '📅 Desde', value: createdDate, inline: true }
        )
        .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
        .setFooter({ text: 'BabaRadio - Comunidad inclusiva y respetuosa' })
        .setTimestamp()

      return interaction.reply({ embeds: [embed] })
    }

    // Subcommand: howl (fun interaction)
    if (sub === 'howl') {
      const profile = getAlterEgo(interaction.user.id)
      
      if (!profile) {
        return interaction.reply({
          content: '❌ Necesitas configurar tu alter-ego primero con `/alter-ego configurar`.',
          ephemeral: true
        })
      }

      const emoji = ANIMAL_EMOJIS[profile.especie] || ANIMAL_EMOJIS.otro
      const displayName = profile.nombre || profile.especie
      const randomHowl = HOWLS[Math.floor(Math.random() * HOWLS.length)]
      
      const message = interaction.options.getString('mensaje')
      
      const embed = new EmbedBuilder()
        .setColor(0xab47bc)
        .setDescription(`${emoji} **${displayName}** (${interaction.user.username}):\n${randomHowl}${message ? `\n\n"${message}"` : ''}`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: 'Expresión therian/furry' })
        .setTimestamp()

      return interaction.reply({ embeds: [embed] })
    }

    // Subcommand: comunidad (community stats)
    if (sub === 'comunidad') {
      const profiles = load('alter-ego', {})
      const guildMembers = await interaction.guild.members.fetch()
      
      const guildProfiles = Object.entries(profiles).filter(([userId]) => 
        guildMembers.has(userId)
      )

      if (guildProfiles.length === 0) {
        return interaction.reply({
          content: '❌ No hay alter-egos configurados en este servidor aún.',
          ephemeral: true
        })
      }

      // Count species
      const speciesCount = {}
      for (const [, profile] of guildProfiles) {
        speciesCount[profile.especie] = (speciesCount[profile.especie] || 0) + 1
      }

      const topSpecies = Object.entries(speciesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([especie, count]) => {
          const emoji = ANIMAL_EMOJIS[especie] || ANIMAL_EMOJIS.otro
          return `${emoji} **${especie}**: ${count} miembro(s)`
        })
        .join('\n')

      const embed = new EmbedBuilder()
        .setColor(0x7b1fa2)
        .setTitle('🌐 Comunidad Therian/Furry')
        .setDescription(`Estadísticas de alter-egos en **${interaction.guild.name}**`)
        .addFields(
          { name: '👥 Total de miembros', value: `${guildProfiles.length}`, inline: true },
          { name: '🐾 Especies más populares', value: topSpecies || 'Sin datos', inline: false }
        )
        .setThumbnail(interaction.guild.iconURL())
        .setFooter({ text: 'BabaRadio - Espacio seguro para todos' })
        .setTimestamp()

      return interaction.reply({ embeds: [embed] })
    }
  }
}
