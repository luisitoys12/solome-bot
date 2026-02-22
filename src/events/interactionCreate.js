// interactionCreate event with 404 handling
const { handle404Error, handleCommandError } = require('../handlers/errorHandler.js')

module.exports = {
  name: 'interactionCreate',
  async execute (interaction, client) {
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
        // Execute command
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
      // Handle button interactions
      const buttonId = interaction.customId
      client.log('debug', `Button clicked: ${buttonId}`)
    }

    // Handle select menus
    if (interaction.isStringSelectMenu()) {
      // Handle select menu interactions
      const menuId = interaction.customId
      client.log('debug', `Menu selected: ${menuId}`)
    }
  }
}
