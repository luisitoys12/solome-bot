<div align="center">
  <img src="https://cdn.discordapp.com/attachments/330739726321713153/451058006965354526/baba_logo_xd.png"><br>
  <b>Baba Radio v3.5 - Discord Bot made with discord.js v14, focused on playing radio stations.</b><br><br>
  <b>🎵 Streaming Solome Radio 🎵</b><br>
  <b>✅ No Privileged Intents Required!</b><br>
  <b>👨‍💻 Creado por djluisalegre para Solome</b><br><br>

  <p>
    <a href="https://github.com/perronosaurio/Baba-Radio/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/perronosaurio/Baba-Radio.svg" alt="License"/></a>
    <img src="https://img.shields.io/badge/discord.js-v14-blue.svg" alt="Discord.js v14"/>
    <img src="https://img.shields.io/badge/status-online-brightgreen.svg" alt="Status"/>
  </p>
</div>

## 🚀 Installation

### Prerequisites
1. [Node.js](https://nodejs.org/) v18 or higher
2. [FFmpeg](https://ffmpeg.org/) installed on your system
3. A Discord Bot Token (no privileged intents required!)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/perronosaurio/baba-radio.git
   cd baba-radio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Add your Discord bot token and client ID to `.env`
   ```env
   TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_bot_application_id
   PREFIX=!
   OWNER=your_discord_user_id
   ```

4. **Register slash commands**
   ```bash
   npm run register
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## 📝 Commands

The bot uses **Slash Commands** (no privileged intents needed!):

### 🎵 Music Commands
- `/play <canción>` - Reproduce música de YouTube, Spotify, SoundCloud, MP3 y más (Lavalink)
- `/radio <estación>` - Busca y reproduce estaciones de radio (iHeartRadio, TuneIn, MyTuner)

### 🎮 Game Commands
- `/8ball <question>` - Ask the magic 8-ball a question
- `/tictactoe @user` - Play Tic-Tac-Toe (Gato) with another user
- `/connect4 @user` - Play Connect 4 (4 en línea) with another user

### 📚 Information Commands
- `/wikipedia <query>` - Search Wikipedia for information

### 💬 Bot Mention
- Mention the bot (@Baba Radio) to see all available commands and get help

### How to use:
1. Join a voice channel (for music commands)
2. Type `/` to see all available commands
3. Select a command and fill in the required options
4. Enjoy! 🎵

## 🎵 Features

### Music & Audio
- 📻 Stream radio stations from iHeartRadio
- 🎵 Play music from YouTube
- 🔊 High-quality audio streaming
- 🎚️ Discord.js v14 voice support
- 📡 Streaming status showing "Solome Radio"

### Games & Fun
- 🎱 Magic 8-Ball fortune teller
- ⭕ Tic-Tac-Toe (Gato) multiplayer game
- 🔴 Connect 4 (4 en línea) multiplayer game
- 🎮 Interactive button-based gameplay

### Information
- 📖 Wikipedia search with multiple languages
- 💬 Helpful bot mention response
- 📋 Interactive dropdown menus

### Technical
- ✅ No privileged intents required
- 🚀 Works on bots with 75+ servers
- 🎯 Modern slash commands
- 🔄 Automatic command registration

## 🔧 Tech Stack

- Discord.js v14
- @discordjs/voice for audio streaming
- iHeart API for radio stations
- FFmpeg for audio processing

## 📄 License

MIT License - see LICENSE file for details
