// src/commands/entretenimiento.js
const Command = require('../structures/command.js')
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js')
const axios = require('axios')

// Opciones de pintacaritas para niños
const FACE_PAINT_DESIGNS = [
  { emoji: '🐯', name: 'Tigre', description: 'Rayas naranjas y negras con nariz rosada' },
  { emoji: '🦁', name: 'León', description: 'Melena dorada con nariz negra' },
  { emoji: '🦋', name: 'Mariposa', description: 'Alas coloridas con brillos' },
  { emoji: '🐱', name: 'Gatito', description: 'Bigotes y nariz rosa' },
  { emoji: '🐶', name: 'Perrito', description: 'Manchas y lengua feliz' },
  { emoji: '🐰', name: 'Conejito', description: 'Nariz rosada con dientes grandes' },
  { emoji: '🦄', name: 'Unicornio', description: 'Cuerno arcoiris con estrellas' },
  { emoji: '🐉', name: 'Dragón', description: 'Escamas verdes con fuego' },
  { emoji: '🦈', name: 'Tiburón', description: 'Aleta y dientes afilados' },
  { emoji: '🐞', name: 'Mariquita', description: 'Puntos rojos y negros' },
  { emoji: '🕷️', name: 'Araña', description: 'Telaráfia con araña amigable' },
  { emoji: '⭐', name: 'Estrella Mágica', description: 'Estrellas brillantes con purpurina' }
]

// Juego piedra-papel-tijeras
const RPS_CHOICES = {
  rock: { emoji: '🪨', name: 'Piedra', beats: 'scissors' },
  paper: { emoji: '📄', name: 'Papel', beats: 'rock' },
  scissors: { emoji: '✂️', name: 'Tijeras', beats: 'paper' }
}

function getRandomChoice () {
  const keys = Object.keys(RPS_CHOICES)
  return keys[Math.floor(Math.random() * keys.length)]
}

function determineWinner (choice1, choice2) {
  if (choice1 === choice2) return 'draw'
  return RPS_CHOICES[choice1].beats === choice2 ? 'player1' : 'player2'
}

module.exports = class Entretenimiento extends Command {
  constructor (client) {
    super(client, {
      name: 'entretenimiento',
      description: 'Módulo de entretenimiento: pintacaritas, ofertas Amazon, series populares y más'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()

    // Subcomando: pintacaritas
    if (sub === 'pintacaritas') {
      const design = interaction.options.getString('diseño')

      if (design === 'random') {
        const random = FACE_PAINT_DESIGNS[Math.floor(Math.random() * FACE_PAINT_DESIGNS.length)]
        const embed = new EmbedBuilder()
          .setColor(0xff69b4)
          .setTitle(`🎨 ¡Pintacaritas Sorpresa!`)
          .setDescription(`**${random.emoji} ${random.name}**\n\n${random.description}`)
          .addFields(
            { name: '👨‍🎨 Dificultad', value: 'Media', inline: true },
            { name: '⏱️ Tiempo estimado', value: '10-15 min', inline: true }
          )
          .setFooter({ text: 'Solome Bot • Entretenimiento' })
          .setTimestamp()

        return interaction.reply({ embeds: [embed] })
      }

      // Mostrar todos los diseños
      const embed = new EmbedBuilder()
        .setColor(0xff69b4)
        .setTitle('🎨 Catálogo de Pintacaritas')
        .setDescription('Ideas divertidas para pintar caritas de niños:')
        .setFooter({ text: 'Solome Bot • Entretenimiento' })
        .setTimestamp()

      FACE_PAINT_DESIGNS.forEach(design => {
        embed.addFields({
          name: `${design.emoji} ${design.name}`,
          value: design.description,
          inline: true
        })
      })

      return interaction.reply({ embeds: [embed] })
    }

    // Subcomando: Amazon ofertas
    if (sub === 'amazon') {
      const category = interaction.options.getString('categoria') || 'general'

      const embed = new EmbedBuilder()
        .setColor(0xff9900)
        .setTitle('🛒 Ofertas destacadas de Amazon')
        .setDescription(`Categoría: **${category.toUpperCase()}**\n\n⚠️ Recuerda verificar precios actuales en Amazon.`)
        .addFields(
          { name: '💻 Electrónica', value: 'Fire TV Stick 4K - 50% OFF\nEcho Dot 5ª Gen - 40% OFF', inline: true },
          { name: '🎮 Gaming', value: 'Control Xbox Wireless - 30% OFF\nHeadset HyperX - 45% OFF', inline: true },
          { name: '📖 Libros', value: 'Kindle Unlimited - 3 meses gratis\nBestsellers - 20% OFF', inline: true },
          { name: '🏠 Hogar', value: 'Robot Aspiradora - 35% OFF\nAlexa Smart Plug - 50% OFF', inline: true },
          { name: '👗 Moda', value: 'Ropa deportiva - Hasta 60% OFF\nZapatos - Hasta 50% OFF', inline: true },
          { name: '🍽️ Cocina', value: 'Air Fryer - 40% OFF\nBatidora KitchenAid - 30% OFF', inline: true }
        )
        .setFooter({ text: 'Solome Bot • Ofertas sujetas a disponibilidad' })
        .setTimestamp()

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Ver en Amazon')
          .setURL('https://www.amazon.com/deals')
          .setStyle(ButtonStyle.Link)
          .setEmoji('🛒')
      )

      return interaction.reply({ embeds: [embed], components: [row] })
    }

    // Subcomando: TV/Streaming tendencias
    if (sub === 'tv') {
      await interaction.deferReply()

      try {
        // Usamos TMDb API (requiere key, aquí simulamos)
        const trendingShows = [
          { title: 'The Last of Us', platform: 'HBO Max', rating: 9.2, genre: 'Drama/Acción' },
          { title: 'Wednesday', platform: 'Netflix', rating: 8.6, genre: 'Comedia/Terror' },
          { title: 'The Mandalorian T3', platform: 'Disney+', rating: 8.9, genre: 'Ciencia Ficción' },
          { title: 'La Casa del Dragón', platform: 'HBO Max', rating: 8.5, genre: 'Fantasía' },
          { title: 'Stranger Things T5', platform: 'Netflix', rating: 8.7, genre: 'Terror/Misterio' },
          { title: 'Ted Lasso T3', platform: 'Apple TV+', rating: 8.8, genre: 'Comedia' },
          { title: 'The Bear', platform: 'Disney+', rating: 8.6, genre: 'Drama/Comedia' },
          { title: 'Severance', platform: 'Apple TV+', rating: 8.7, genre: 'Thriller/Misterio' }
        ]

        const embed = new EmbedBuilder()
          .setColor(0xe50914)
          .setTitle('📺 Lo Más Visto en Streaming')
          .setDescription('Series y shows populares en plataformas de streaming:')
          .setThumbnail('https://cdn-icons-png.flaticon.com/512/2991/2991195.png')
          .setFooter({ text: 'Solome Bot • Entretenimiento' })
          .setTimestamp()

        trendingShows.forEach((show, index) => {
          embed.addFields({
            name: `${index + 1}. ${show.title}`,
            value: `🎬 ${show.platform} | ⭐ ${show.rating}/10\n🎭 ${show.genre}`,
            inline: true
          })
        })

        return interaction.editReply({ embeds: [embed] })
      } catch (error) {
        console.error('Error en subcomando tv:', error)
        return interaction.editReply({ content: '❌ Error al obtener tendencias de TV.' })
      }
    }

    // Subcomando: Piedra, Papel o Tijeras
    if (sub === 'piedra-papel-tijeras') {
      const mode = interaction.options.getString('modo') || 'bot'

      if (mode === 'bot') {
        // Jugar contra el bot
        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('rock')
            .setLabel('Piedra')
            .setEmoji('🪨')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('paper')
            .setLabel('Papel')
            .setEmoji('📄')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('scissors')
            .setLabel('Tijeras')
            .setEmoji('✂️')
            .setStyle(ButtonStyle.Primary)
        )

        const embed = new EmbedBuilder()
          .setColor(0xff9800)
          .setTitle('🎮 Piedra, Papel o Tijeras')
          .setDescription(`${interaction.user}, ¡elige tu jugada contra el bot!`)
          .setFooter({ text: 'Tienes 30 segundos para elegir' })
          .setTimestamp()

        const msg = await interaction.reply({ embeds: [embed], components: [buttons], fetchReply: true })

        const collector = msg.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 30000,
          filter: i => i.user.id === interaction.user.id
        })

        collector.on('collect', async i => {
          const playerChoice = i.customId
          const botChoice = getRandomChoice()
          const result = determineWinner(playerChoice, botChoice)

          let resultText = ''
          let color = 0x607d8b

          if (result === 'draw') {
            resultText = '🤝 ¡Empate!'
            color = 0xffeb3b
          } else if (result === 'player1') {
            resultText = `🏆 ¡${interaction.user.username} ganó!`
            color = 0x4caf50
          } else {
            resultText = `🤖 ¡El bot ganó!`
            color = 0xf44336
          }

          const resultEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🎮 Resultado del Juego')
            .setDescription(resultText)
            .addFields(
              { name: interaction.user.username, value: `${RPS_CHOICES[playerChoice].emoji} ${RPS_CHOICES[playerChoice].name}`, inline: true },
              { name: 'Bot', value: `${RPS_CHOICES[botChoice].emoji} ${RPS_CHOICES[botChoice].name}`, inline: true }
            )
            .setTimestamp()

          await i.update({ embeds: [resultEmbed], components: [] })
          collector.stop()
        })

        collector.on('end', (collected, reason) => {
          if (reason === 'time' && collected.size === 0) {
            const timeoutEmbed = new EmbedBuilder()
              .setColor(0x9e9e9e)
              .setTitle('⏱️ Tiempo agotado')
              .setDescription(`${interaction.user} no eligió a tiempo.`)

            msg.edit({ embeds: [timeoutEmbed], components: [] })
          }
        })
      }
    }
  }

  getSlashCommandData () {
    return {
      name: this.name,
      description: 'Entretenimiento variado para toda la familia',
      options: [
        {
          type: 1,
          name: 'pintacaritas',
          description: 'Ideas de diseños para pintacaritas de niños',
          options: [
            {
              type: 3,
              name: 'diseño',
              description: 'Ver todos los diseños o elegir uno aleatorio',
              required: false,
              choices: [
                { name: '🎲 Diseño Aleatorio', value: 'random' },
                { name: '📜 Ver Catálogo Completo', value: 'all' }
              ]
            }
          ]
        },
        {
          type: 1,
          name: 'amazon',
          description: 'Ofertas y descuentos destacados de Amazon',
          options: [
            {
              type: 3,
              name: 'categoria',
              description: 'Categoría de productos',
              required: false,
              choices: [
                { name: '💻 Electrónica', value: 'electronica' },
                { name: '🎮 Gaming', value: 'gaming' },
                { name: '📖 Libros', value: 'libros' },
                { name: '🏠 Hogar', value: 'hogar' },
                { name: '👗 Moda', value: 'moda' },
                { name: '🍽️ Cocina', value: 'cocina' }
              ]
            }
          ]
        },
        {
          type: 1,
          name: 'tv',
          description: 'Lo más visto en plataformas de streaming (Netflix, HBO, Disney+, etc.)'
        },
        {
          type: 1,
          name: 'piedra-papel-tijeras',
          description: 'Juega piedra, papel o tijeras',
          options: [
            {
              type: 3,
              name: 'modo',
              description: 'Modo de juego',
              required: false,
              choices: [
                { name: '🤖 vs Bot', value: 'bot' }
              ]
            }
          ]
        }
      ]
    }
  }
}
