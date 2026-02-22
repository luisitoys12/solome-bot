const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, '../../config/features.json');
    this.config = null;
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(this.configPath)) {
        console.warn('⚠️ Config file not found, using defaults');
        this.config = this.getDefaultConfig();
        return;
      }
      
      const data = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(data);
      console.log('✅ Configuration loaded successfully');
    } catch (error) {
      console.error('❌ Error loading config:', error.message);
      this.config = this.getDefaultConfig();
    }
  }

  save() {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('✅ Configuration saved');
      return true;
    } catch (error) {
      console.error('❌ Error saving config:', error.message);
      return false;
    }
  }

  getDefaultConfig() {
    return {
      version: '5.0.0-beta',
      bot: {
        prefix: '!',
        owners: [],
        betaUsers: [],
        betaGuilds: []
      },
      features: {
        economy: { enabled: true },
        ai: { enabled: true, defaultProvider: 'openai' },
        advertising: { enabled: true },
        sports: { enabled: true, beta: true },
        radio247: { enabled: true, beta: true }
      }
    };
  }

  get(path) {
    const keys = path.split('.');
    let value = this.config;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    return value;
  }

  set(path, value) {
    const keys = path.split('.');
    let obj = this.config;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in obj) || typeof obj[key] !== 'object') {
        obj[key] = {};
      }
      obj = obj[key];
    }
    obj[keys[keys.length - 1]] = value;
    this.save();
  }

  isOwner(userId) {
    const owners = this.get('bot.owners') || [];
    return owners.includes(userId);
  }

  isBetaUser(userId) {
    if (this.isOwner(userId)) return true;
    const betaUsers = this.get('bot.betaUsers') || [];
    return betaUsers.includes(userId);
  }

  isBetaGuild(guildId) {
    const betaGuilds = this.get('bot.betaGuilds') || [];
    return betaGuilds.includes(guildId);
  }

  isProGuild(guildId) {
    // TODO: Integrar con base de datos de suscripciones Stripe
    // Por ahora, todos los beta guilds son considerados pro
    return this.isBetaGuild(guildId);
  }

  getUserTier(userId, guildId) {
    if (this.isOwner(userId) || this.isBetaUser(userId)) {
      return 'beta';
    }
    if (this.isProGuild(guildId)) {
      return 'pro';
    }
    return 'free';
  }

  getFeature(featureName) {
    return this.get(`features.${featureName}`);
  }

  isFeatureEnabled(featureName) {
    const feature = this.getFeature(featureName);
    return feature && feature.enabled === true;
  }

  isFeatureBeta(featureName) {
    const feature = this.getFeature(featureName);
    return feature && feature.beta === true;
  }

  canUseFeature(featureName, userId, guildId) {
    if (!this.isFeatureEnabled(featureName)) {
      return { allowed: false, reason: 'Función desactivada' };
    }

    if (this.isFeatureBeta(featureName)) {
      if (!this.isBetaUser(userId) && !this.isBetaGuild(guildId)) {
        return { 
          allowed: false, 
          reason: '🧪 Esta es una función BETA. Solo disponible para Beta Supporters.' 
        };
      }
    }

    return { allowed: true };
  }

  getPrefix() {
    return this.get('bot.prefix') || '!';
  }
}

module.exports = new ConfigManager();
