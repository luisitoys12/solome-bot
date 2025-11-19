# 🎵 Baba Radio Setup Guide

## ✅ NO PRIVILEGED INTENTS REQUIRED!

This bot uses **Slash Commands** and works without privileged intents. Perfect for bots in 75+ servers!

### Step-by-Step Instructions:

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Log in with your Discord account

2. **Select Your Bot Application**
   - Click on your bot application from the list
   - If you don't have one, click "New Application" to create it

3. **Get Your Bot Token and Client ID**
   - Click on "Bot" in the left sidebar
   - Find "TOKEN" and click "Copy" to copy your token
   - **NEVER share this token publicly!**
   - Go back to "General Information" in the left sidebar
   - Copy your "APPLICATION ID" (this is your CLIENT_ID)

4. **Update Your .env File**
   ```env
   TOKEN=paste_your_token_here
   CLIENT_ID=paste_your_application_id_here
   PREFIX=!
   OWNER=your_discord_user_id
   ```

5. **Invite Bot to Your Server**
   - Go to "OAuth2" → "URL Generator" in the left sidebar
   - Select scopes: `bot` and `applications.commands`
   - Select permissions:
     - Read Messages/View Channels
     - Send Messages
     - Connect
     - Speak
     - Use Slash Commands
   - Copy the generated URL and open it in your browser
   - Select your server and authorize

## 🚀 Running the Bot

After completing the setup above:

```bash
npm install
npm run register  # Register slash commands (only needed once)
npm start
```

You should see:
```
[commands] eval.js loaded.
[commands] search.js loaded.
[commands] play.js loaded.
[events] interactionCreate.js loaded.
[events] message.js loaded.
[info] Bot is ready! Streaming Solome Radio 🎵
```

## 🎮 Using the Bot

Once the bot is online, use **Slash Commands**:

1. Join a voice channel
2. Type `/search` or `/play` followed by a station name
3. Select a station from the dropdown menu
4. Enjoy! 🎵

### Examples:
- `/search solome` - Search for Solome Radio
- `/play rock` - Search for rock stations
- `/search jazz` - Find jazz stations

## 🔧 Troubleshooting

### Error: "Used disallowed intents"
- You forgot to enable the intents in Discord Developer Portal
- Follow steps 1-4 above

### Error: "Invalid token"
- Your token is incorrect or expired
- Generate a new token in the Developer Portal
- Update your .env file

### Bot doesn't respond to commands
- Make sure the bot has permission to read messages in the channel
- Check that your PREFIX in .env matches what you're typing
- Verify Message Content Intent is enabled

### No audio in voice channel
- Make sure FFmpeg is installed on your system
- Check that the bot has permission to connect and speak in voice channels
- Try a different radio station

## 📞 Support

If you encounter issues, check:
1. All intents are enabled
2. Bot has proper permissions in your server
3. FFmpeg is installed
4. Node.js version is 18 or higher

## 🎵 Default Status

The bot will show as "Streaming Solome Radio" when online. This is configured in `src/client.js`.
