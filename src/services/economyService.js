const fs = require('fs');
const path = require('path');
const configManager = require('../utils/configManager');

class EconomyService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data/economy.json');
    this.data = this.load();
    this.config = configManager.getFeature('economy');
  }

  load() {
    try {
      if (!fs.existsSync(this.dataPath)) {
        return { users: {}, guilds: {} };
      }
      const raw = fs.readFileSync(this.dataPath, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      console.error('Error loading economy data:', error);
      return { users: {}, guilds: {} };
    }
  }

  save() {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving economy data:', error);
    }
  }

  getUserKey(guildId, userId) {
    return `${guildId}:${userId}`;
  }

  getBalance(guildId, userId) {
    const key = this.getUserKey(guildId, userId);
    return this.data.users[key]?.balance || 0;
  }

  setBalance(guildId, userId, amount) {
    const key = this.getUserKey(guildId, userId);
    if (!this.data.users[key]) {
      this.data.users[key] = { balance: 0, lastEarned: null };
    }
    this.data.users[key].balance = Math.max(0, amount);
    this.save();
    return this.data.users[key].balance;
  }

  addBalance(guildId, userId, amount, reason = 'unknown') {
    const current = this.getBalance(guildId, userId);
    const newBalance = this.setBalance(guildId, userId, current + amount);
    
    console.log(`💎 Economy: ${userId} ${amount >= 0 ? 'earned' : 'spent'} ${Math.abs(amount)} coins (${reason})`);
    
    return {
      previous: current,
      current: newBalance,
      change: amount
    };
  }

  canAfford(guildId, userId, amount) {
    return this.getBalance(guildId, userId) >= amount;
  }

  transfer(guildId, fromUserId, toUserId, amount) {
    if (!this.canAfford(guildId, fromUserId, amount)) {
      return { success: false, reason: 'Fondos insuficientes' };
    }

    this.addBalance(guildId, fromUserId, -amount, 'transfer_out');
    this.addBalance(guildId, toUserId, amount, 'transfer_in');

    return { success: true };
  }

  getLeaderboard(guildId, limit = 10) {
    const guildUsers = Object.entries(this.data.users)
      .filter(([key]) => key.startsWith(`${guildId}:`))
      .map(([key, data]) => ({
        userId: key.split(':')[1],
        balance: data.balance
      }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, limit);

    return guildUsers;
  }

  // Métodos para créditos del servidor
  getServerCredits(guildId) {
    return this.data.guilds[guildId]?.credits || 0;
  }

  addServerCredits(guildId, amount, reason = 'unknown') {
    if (!this.data.guilds[guildId]) {
      this.data.guilds[guildId] = { credits: 0 };
    }
    this.data.guilds[guildId].credits += amount;
    this.save();
    
    console.log(`🏦 Server Credits: Guild ${guildId} ${amount >= 0 ? 'earned' : 'spent'} ${Math.abs(amount)} credits (${reason})`);
    
    return this.data.guilds[guildId].credits;
  }

  canAffordServerCredits(guildId, amount) {
    return this.getServerCredits(guildId) >= amount;
  }

  getCoinName() {
    return this.config?.coinName || 'SolomeCoins';
  }

  getCoinEmoji() {
    return this.config?.coinEmoji || '💎';
  }

  formatBalance(amount) {
    return `${this.getCoinEmoji()} **${amount.toLocaleString()}** ${this.getCoinName()}`;
  }
}

module.exports = new EconomyService();
