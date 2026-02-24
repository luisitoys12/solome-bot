// interactionCreate event - Commands handle their own defer/reply
const { handle404Error, handleCommandError } = require('../handlers/errorHandler.js')
const ButtonHandler = require('../handlers/buttonHandler.js')

module.exports = {
  name: 'interactionCreate',
  async execute (interaction, client) {
    // Initialize button handler if not exists
    if (!client.buttonHandler) {
      client.buttonHandler = new ButtonHandler(client)
    }

    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const commandName = interaction.commandName
      const command = client.slashCommands.get(commandName)

      // 404 - Command not found
      if (!command) {
        await handle404Error(client, interaction, commandName)
        return
      }

      try {
        // Execute command (cada comando maneja su propio defer/reply)
        await command.runSlash(interaction)
        
        // Log successful execution
        client.log('info', `✅ /${commandName} executed by ${interaction.user.tag} in ${interaction.guild?.name || 'DM'}`)
        
      } catch (error) {
        // Handle execution error
        await handleCommandError(client, interaction, error, commandName)
      }
    }

    // Handle autocomplete
    if (interaction.isAutocomplete()) {
      const command = client.slashCommands.get(interaction.commandName)
      if (command && command.autocomplete) {
        try {
          await command.autocomplete(interaction)
        } catch (error) {
          client.log('error', 'Autocomplete error:', error)
        }
      }
    }

    // Handle buttons
    if (interaction.isButton()) {
      try {
        await client.buttonHandler.handle(interaction)
        client.log('debug', `Button handled: ${interaction.customId} by ${interaction.user.tag}`)
      } catch (error) {
        client.log('error', `Button error (${interaction.customId}):`, error)
        
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ Error al procesar el botón',
            flags: 64
          }).catch(() => {})
        }
      }
    }

    // Handle select menus
    if (interaction.isStringSelectMenu()) {
      try {
        const menuId = interaction.customId
        client.log('debug', `Menu selected: ${menuId} by ${interaction.user.tag}`)
        
        // Handle menu based on ID
        if (menuId.startsWith('help_')) {
          const command = client.slashCommands.get('help')
          if (command && command.handleMenu) {
            await command.handleMenu(interaction)
          }
        }
      } catch (error) {
        client.log('error', 'Select menu error:', error)
        
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ Error al procesar el menú',
            flags: 64
          }).catch(() => {})
        }
      }
    }

    // Handle modals
    if (interaction.isModalSubmit()) {
      try {
        const modalId = interaction.customId
        client.log('debug', `Modal submitted: ${modalId} by ${interaction.user.tag}`)
        
        // Handle based on modal ID
        if (modalId.startsWith('ticket_')) {
          const command = client.slashCommands.get('ticket')
          if (command && command.handleModal) {
            await command.handleModal(interaction)
          }
        }
      } catch (error) {
        client.log('error', 'Modal error:', error)
        
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ Error al procesar el formulario',
            flags: 64
          }).catch(() => {})
        }
      }
    }
  }
}
