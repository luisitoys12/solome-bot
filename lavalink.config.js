// Lavalink Configuration v4
// Multiple servers for high availability and performance
// Version: 4.0.8

module.exports = {
  nodes: [
    {
      host: 'lavahatry4.techbyte.host',
      port: 3000,
      password: 'NAIGLAVA',
      secure: false,
      retryAmount: 5,
      retryDelay: 3000,
      id: 'TechByte-Main',
      // Plugins disponibles:
      // - lavasrc-plugin v4.7.3
      // - java-lyrics-plugin v1.6.5
      // - lavasearch-plugin v1.0.0
      // - sponsorblock-plugin v3.0.1
      // - DuncteBot-plugin v1.7.0
      // - jiosaavn-plugin v1.0.3
      // - youtube-plugin v1.15.0
      // - lavalyrics-plugin v7d60077
    },
    {
      host: '173.249.0.115',
      port: 13592,
      password: 'https://camming.xyz',
      secure: false,
      retryAmount: 5,
      retryDelay: 3000,
      id: 'YumiTeam-Backup'
    }
  ],
  options: {
    clientName: 'BabaRadio/4.0',
    defaultSearchPlatform: 'ytsearch',
    restTimeout: 10000,
    // Credits
    hostedBy: 'TechByte & Yumi Team',
    version: '4.0.8',
    // Plugins
    plugins: {
      lyrics: true,
      search: true,
      sponsorblock: true,
      jiosaavn: true
    }
  }
}
