/**
 * Spam Detection Module
 * Tracks message frequency per user and identifies spammers
 */
class SpamDetector {
  constructor(config) {
    this.config = config;
    // Map: groupId -> Map: userId -> { count, lastMessageTime, warned }
    this.messageTracker = new Map();
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  recordMessage(groupId, userId) {
    if (!this.messageTracker.has(groupId)) {
      this.messageTracker.set(groupId, new Map());
    }

    const groupData = this.messageTracker.get(groupId);
    const now = Date.now();
    const windowMs = this.config.timeWindowSeconds * 1000;

    if (!groupData.has(userId)) {
      groupData.set(userId, {
        count: 1,
        firstMessageTime: now,
        lastMessageTime: now,
        warned: false,
      });
      return { isSpam: false, count: 1 };
    }

    const userData = groupData.get(userId);
    const timeSinceFirst = now - userData.firstMessageTime;

    // Reset window if outside time window
    if (timeSinceFirst > windowMs) {
      userData.count = 1;
      userData.firstMessageTime = now;
      userData.lastMessageTime = now;
      userData.warned = false;
      return { isSpam: false, count: 1 };
    }

    userData.count++;
    userData.lastMessageTime = now;

    const isSpam = userData.count >= this.config.maxMessages;
    return {
      isSpam,
      count: userData.count,
      warned: userData.warned,
      userData,
    };
  }

  markWarned(groupId, userId) {
    const groupData = this.messageTracker.get(groupId);
    if (groupData && groupData.has(userId)) {
      groupData.get(userId).warned = true;
      groupData.get(userId).warnTime = Date.now();
    }
  }

  resetUser(groupId, userId) {
    const groupData = this.messageTracker.get(groupId);
    if (groupData) {
      groupData.delete(userId);
    }
  }

  shouldRemove(spamResult) {
    if (!spamResult.isSpam) return false;
    const userData = spamResult.userData;
    if (!userData) return false;

    // Strict mode: remove immediately
    if (this.config.strictMode) {
      return true;
    }

    // First offense: warn (don't remove)
    if (this.config.firstOffense === 'warn' && !userData.warned) {
      return false;
    }

    // Second offense or remove mode: remove
    return this.config.firstOffense === 'remove' || userData.warned;
  }

  cleanup() {
    const now = Date.now();
    const maxAge = (this.config.timeWindowSeconds + this.config.warnCooldownSeconds) * 1000;

    for (const [groupId, groupData] of this.messageTracker) {
      for (const [userId, data] of groupData) {
        if (now - data.lastMessageTime > maxAge) {
          groupData.delete(userId);
        }
      }
      if (groupData.size === 0) {
        this.messageTracker.delete(groupId);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.messageTracker.clear();
  }
}

module.exports = SpamDetector;
