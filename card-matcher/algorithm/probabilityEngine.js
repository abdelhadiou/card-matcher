/**
 * PROBABILITY ENGINE — Greed Island Card Matcher
 * "Probability is not destiny. The 93% card still fails 7% of the time. Trust nothing." — Hisoka
 */

export class ProbabilityEngine {
  constructor(cards, gridCols = 8) {
    this.cards = cards;
    this.gridCols = gridCols;
    this.symbolFrequency = {};
    this.nenDistortionActive = false;
    this.distortionFactor = 70;
    this._buildFrequencyMap();
  }

  _buildFrequencyMap() {
    this.symbolFrequency = {};
    this.cards.forEach(card => {
      if (!card.matched) {
        this.symbolFrequency[card.symbol] = (this.symbolFrequency[card.symbol] || 0) + 1;
      }
    });
  }

  /**
   * Recalculate probabilities for all face-down cards given a selected card
   */
  calculateProbabilities(selectedCard, cards) {
    this._buildFrequencyMap();
    const unmatched = cards.filter(c => !c.matched && !c.flipped && c.id !== selectedCard.id);
    const totalUnmatched = unmatched.length;
    if (totalUnmatched === 0) return {};

    const probMap = {};
    const baseChance = 1 / totalUnmatched;

    unmatched.forEach(card => {
      let prob = baseChance;

      // Symbol match boost — if this card has the same symbol as selected, high probability
      if (card.symbol === selectedCard.symbol) {
        prob = 0.85 + Math.random() * 0.1; // 85–95%
      } else {
        // Base probability from remaining deck composition
        const matchingCount = cards.filter(
          c => !c.matched && !c.flipped && c.symbol === selectedCard.symbol && c.id !== selectedCard.id && c.id !== card.id
        ).length;
        prob = matchingCount > 0 ? 0.05 + Math.random() * 0.15 : Math.random() * 0.12;

        // Positional adjacency boost (20%)
        if (this._areAdjacent(selectedCard.position, card.position)) {
          prob = Math.min(prob * 1.2 + 0.05, 0.95);
        }

        // Rarity penalty — rarer symbols have lower probability hint
        const freq = this.symbolFrequency[card.symbol] || 1;
        if (freq === 1) prob *= 0.7;
      }

      // Nen Distortion — Hisoka randomly skews numbers
      if (this.nenDistortionActive) {
        const distort = (Math.random() - 0.5) * this.distortionFactor;
        prob = Math.max(0.01, Math.min(0.99, prob + distort));
      }

      probMap[card.id] = Math.round(prob * 100);
    });

    return probMap;
  }

  _areAdjacent(posA, posB) {
    const rowA = Math.floor(posA / this.gridCols);
    const colA = posA % this.gridCols;
    const rowB = Math.floor(posB / this.gridCols);
    const colB = posB % this.gridCols;
    return Math.abs(rowA - rowB) <= 1 && Math.abs(colA - colB) <= 1;
  }

  enableNenDistortion(level = 70) {
    this.nenDistortionActive = true;
    this.distortionFactor = level;
  }

  disableNenDistortion() {
    this.nenDistortionActive = false;
    this.distortionFactor = 70;
  }

  getBestMoveHint(probMap) {
    if (!probMap || Object.keys(probMap).length === 0) return null;
    return Object.entries(probMap).reduce((best, [id, prob]) =>
      prob > (best.prob || 0) ? { id: parseInt(id), prob } : best
    , {});
  }
}
