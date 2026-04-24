/**
 * INTERFERENCE MANAGER — Hisoka's Bungee Gum Memory Distortion
 * "Hisoka's interference triggers after 3 mismatches. Plan your flips in batches of 2." — Kurapika
 */

export class InterferenceManager {
  constructor(onInterference) {
    this.consecutiveMismatches = 0;
    this.interferenceThreshold = 3;
    this.onInterference = onInterference; // callback(cardId)
    this.interferenceCount = 0;
    this.nenChargeLevel = 0; // 0-100 visual indicator
  }

  /**
   * Call on each mismatch result
   */
  recordMismatch() {
    this.consecutiveMismatches++;
    this.nenChargeLevel = Math.min(100, (this.consecutiveMismatches / this.interferenceThreshold) * 100);

    if (this.consecutiveMismatches >= this.interferenceThreshold) {
      this.triggerInterference();
      this.consecutiveMismatches = 0;
      this.nenChargeLevel = 0;
    }

    return {
      consecutive: this.consecutiveMismatches,
      nenCharge: this.nenChargeLevel,
      triggered: false
    };
  }

  /**
   * Call on each successful match — resets streak
   */
  recordMatch() {
    this.consecutiveMismatches = 0;
    this.nenChargeLevel = 0;
  }

  triggerInterference() {
    this.interferenceCount++;
    if (this.onInterference) {
      this.onInterference();
    }
  }

  /**
   * Pick a random revealed (matched) card to flip back down
   */
  selectVictimCard(matchedCards) {
    if (!matchedCards || matchedCards.length === 0) return null;
    const idx = Math.floor(Math.random() * matchedCards.length);
    return matchedCards[idx];
  }

  getWarningLevel() {
    if (this.consecutiveMismatches === 0) return 'safe';
    if (this.consecutiveMismatches === 1) return 'caution';
    if (this.consecutiveMismatches === 2) return 'danger';
    return 'critical';
  }

  getNenChargeLevel() {
    return this.nenChargeLevel;
  }

  reset() {
    this.consecutiveMismatches = 0;
    this.interferenceCount = 0;
    this.nenChargeLevel = 0;
  }
}
