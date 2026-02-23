const Command = require('../structures/command.js')
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { load, save } = require('../utils/database.js')

module.exports = class CustomCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'customcommand',
      aliases: ['cc', 'custom'],
      description: '⚙️ Crear comandos personalizados para tu servidor'
    })
  }

  async runSlash (interaction) {
    const subcommand = interaction.options.getSubcommand()
    
    if (subcommand === 'add') {
      await this.add(interaction)
    } else if (subcommand === 'remove') {
      await this.remove(interaction)
    } else if (subcommand === 'list') {
      await this.list(interaction)
    } else if (subcommand === 'edit') {
      await this.edit(interaction)
    }
  }

  async add(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ 
        content: '❌ Necesitas permiso de **Administrar Servidor**', 
        flags: 64 
      })
    }
    
    const name = interaction.options.getString('nombre').toLowerCase()
    const response = interaction.options.getString('respuesta')
    const description = interaction.options.getString('descripcion') || 'Comando personalizado'
    
    // Validar nombre
    if (name.length < 2 || name.length > 32) {
      return interaction.reply({ 
        content: '❌ El nombre debe tener entre 2 y 32 caracteres', 
        flags: 64 
      })
    }
    
    if (!/^[a-z0-9_-]+$/.test(name)) {
      return interaction.reply({ 
        content: '❌ El nombre solo puede contener letras, números, guiones y guiones bajos', 
        flags: 64 
      })
    }
    
    // Verificar que no sea comando nativo
    if (this.client.slashCommands.has(name)) {
      return interaction.reply({ 
        content: '❌ No puedes sobrescribir comandos nativos del bot', 
        flags: 64 
      })
    }
    
    const customCommands = load('customCommands', {})
    
    if (!customCommands[interaction.guild.id]) {
      customCommands[interaction.guild.id] = {}
    }
    
    // Verificar límite (máximo 25 por servidor)
    if (Object.keys(customCommands[interaction.guild.id]).length >= 25) {
      return interaction.reply({ 
        content: '❌ Máximo 25 comandos personalizados por servidor', 
        flags: 64 
      })
    }
    
    customCommands[interaction.guild.id][name] = {
      response: response,
      description: description,
      author: interaction.user.id,
      createdAt: Date.now(),
      uses: 0
    }
    
    save('customCommands', customCommands)
    
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('✅ Comando Personalizado Creado')
      .setDescription(`El comando \`/${name}\` ha sido creado exitosamente`)
      .addFields(
        { name: '🎯 Nombre', value: `/${name}`, inline: true },
        { name: '📝 Descripción', value: description, inline: true },
        { name: '💬 Respuesta', value: response.substring(0, 100) + (response.length > 100 ? '...' : '') }
      )
      .setFooter({ text: 'Usa /customcommand list para ver todos los comandos' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async remove(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ 
        content: '❌ Necesitas permiso de **Administrar Servidor**', 
        flags: 64 
      })
    }
    
    const name = interaction.options.getString('nombre').toLowerCase()
    const customCommands = load('customCommands', {})
    
    if (!customCommands[interaction.guild.id]?.[name]) {
      return interaction.reply({ 
        content: '❌ Ese comando no existe', 
        flags: 64 
      })
    }
    
    delete customCommands[interaction.guild.id][name]
    save('customCommands', customCommands)
    
    await interaction.reply(`✅ Comando \`/${name}\` eliminado`)
  }

  async list(interaction) {
    const customCommands = load('customCommands', {})
    const guildCommands = customCommands[interaction.guild.id] || {}
    
    if (Object.keys(guildCommands).length === 0) {
      return interaction.reply({ 
        content: '❌ No hay comandos personalizados en este servidor.\nUsa `/customcommand add` para crear uno', 
        flags: 64 
      })
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📜 Comandos Personalizados')
      .setDescription(`Este servidor tiene ${Object.keys(guildCommands).length}/25 comandos personalizados`)
    
    Object.entries(guildCommands).forEach(([name, data]) => {
      embed.addFields({
        name: `/${name}`,
        value: `${data.description}\n• Usos: ${data.uses}\n• Creado: <t:${Math.floor(data.createdAt / 1000)}:R>`,
        inline: true
      })
    })
    
    embed.setFooter({ text: 'Usa /customcommand remove para eliminar un comando' })
    
    await interaction.reply({ embeds: [embed] })
  }

  async edit(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ 
        content: '❌ Necesitas permiso de **Administrar Servidor**', 
        flags: 64 
      })
    }
    
    const name = interaction.options.getString('nombre').toLowerCase()
    const newResponse = interaction.options.getString('nueva_respuesta')
    const customCommands = load('customCommands', {})
    
    if (!customCommands[interaction.guild.id]?.[name]) {
      return interaction.reply({ 
        content: '❌ Ese comando no existe', 
        flags: 64 
      })
    }
    
    customCommands[interaction.guild.id][name].response = newResponse
    save('customCommands', customCommands)
    
    await interaction.reply(`✅ Comando \`/${name}\` actualizado`)
  }

  getSlashCommandData() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub =>
        sub
          .setName('add')
          .setDescription('Crear un comando personalizado')
          .addStringOption(opt =>
            opt
              .setName('nombre')
              .setDescription('Nombre del comando (sin /)')
              .setRequired(true)
          )
          .addStringOption(opt =>
            opt
              .setName('respuesta')
              .setDescription('Respuesta del comando')
              .setRequired(true)
          )
          .addStringOption(opt =>
            opt
              .setName('descripcion')
              .setDescription('Descripción del comando')
              .setRequired(false)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('remove')
          .setDescription('Eliminar un comando personalizado')
          .addStringOption(opt =>
            opt
              .setName('nombre')
              .setDescription('Nombre del comando a eliminar')
              .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('list')
          .setDescription('Ver todos los comandos personalizados')
      )
      .addSubcommand(sub =>
        sub
          .setName('edit')
          .setDescription('Editar un comando personalizado')
          .addStringOption(opt =>
            opt
              .setName('nombre')
              .setDescription('Nombre del comando a editar')
              .setRequired(true)
          )
          .addStringOption(opt =>
            opt
              .setName('nueva_respuesta')
              .setDescription('Nueva respuesta del comando')
              .setRequired(true)
          )
      )
  }
}
