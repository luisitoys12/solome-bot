const configManager = require('../utils/configManager');
const fs = require('fs');
const path = require('path');

class PrefixHandler {
  constructor(client) {
    this.client = client;
    this.prefix = configManager.getPrefix();
    this.commands = new Map();
    this.loadCommands();
  }

  loadCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        delete require.cache[require.resolve(filePath)];
        
        const CommandClass = require(filePath);
        if (typeof CommandClass === 'function') {
          const cmd = new CommandClass(this.client);
          
          // Obtener el nombre del comando
          let commandName;
          if (typeof cmd.getSlashCommandData === 'function') {
            commandName = cmd.getSlashCommandData().name;
          } else if (cmd.name) {
            commandName = cmd.name;
          }

          if (commandName) {
            this.commands.set(commandName, cmd);
            console.log(`  ✅ Prefix command loaded: ${this.prefix}${commandName}`);
          }
        }
      } catch (error) {
        console.error(`  ❌ Error loading ${file}:`, error.message);
      }
    }

    console.log(`\n📝 Total prefix commands: ${this.commands.size}`);
  }

  async handleMessage(message) {
    // Ignorar bots y mensajes sin el prefix
    if (message.author.bot) return;
    if (!message.content.startsWith(this.prefix)) return;

    // Parsear comando y argumentos
    const args = message.content.slice(this.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Buscar comando
    const command = this.commands.get(commandName);
    if (!command) return;

    try {
      // Verificar si el comando tiene restricciones beta
      if (command.beta) {
        const userId = message.author.id;
        const guildId = message.guild?.id;
        
        if (!configManager.isBetaUser(userId) && !configManager.isBetaGuild(guildId)) {
          return message.reply({
            content: '🧪 **Este es un comando BETA**\n\nSolo disponible para Beta Supporters.\nÚnete al programa beta para probarlo primero.',
            ephemeral: true
          });
        }
      }

      // Crear objeto interaction-like para compatibilidad
      const fakeInteraction = {
        user: message.author,
        member: message.member,
        guild: message.guild,
        channel: message.channel,
        options: this.parseOptions(args),
        reply: async (options) => {
          if (typeof options === 'string') {
            return message.reply(options);
          }
          return message.reply(options);
        },
        deferReply: async () => {
          return message.channel.sendTyping();
        },
        editReply: async (options) => {
          return message.reply(options);
        },
        followUp: async (options) => {
          return message.channel.send(options);
        }
      };

      // Ejecutar comando
      if (typeof command.execute === 'function') {
        await command.execute(fakeInteraction);
      } else {
        await message.reply('❌ Este comando no está completamente implementado para prefix.');
      }

    } catch (error) {
      console.error(`Error executing prefix command ${commandName}:`, error);
      
      const errorMessage = {
        content: `❌ Error al ejecutar el comando: ${error.message}`,
        ephemeral: true
      };

      try {
        await message.reply(errorMessage);
      } catch (replyError) {
        console.error('Could not send error message:', replyError);
      }
    }
  }

  parseOptions(args) {
    // Convertir args a formato options-like
    const options = {
      getString: (name) => args[0] || null,
      getInteger: (name) => {
        const val = parseInt(args[0]);
        return isNaN(val) ? null : val;
      },
      getUser: (name) => null, // Esto requeriría parsing más complejo
      getChannel: (name) => null,
      getBoolean: (name) => {
        const val = args[0]?.toLowerCase();
        return val === 'true' || val === 'yes' || val === '1';
      },
      data: args
    };

    return options;
  }

  getPrefix() {
    return this.prefix;
  }

  getCommands() {
    return Array.from(this.commands.values());
  }
}

module.exports = PrefixHandler;
