/**
 * PATTERN DETECTOR — Greed Island Card Matcher
 * "The symbols aren't random. There's a hidden pattern in their arrangement." — Anonymous
 */

export class PatternDetector {
  constructor(gridCols = 8, gridRows = 5) {
    this.gridCols = gridCols;
    this.gridRows = gridRows;
    this.knownPositions = {}; // symbol -> [positions]
    this.flipHistory = [];
  }

  /**
   * Record a flip event
   */
  recordFlip(card) {
    this.flipHistory.push({ id: card.id, symbol: card.symbol, position: card.position, time: Date.now() });
    if (!this.knownPositions[card.symbol]) {
      this.knownPositions[card.symbol] = [];
    }
    if (!this.knownPositions[card.symbol].includes(card.position)) {
      this.knownPositions[card.symbol].push(card.position);
    }
  }

  /**
   * Given a selected card, check if we've seen its pair before (memory assist)
   */
  findKnownPair(selectedCard) {
    const known = this.knownPositions[selectedCard.symbol];
    if (!known) return null;
    // Return any position we've seen with same symbol (not the selected card itself)
    const others = known.filter(p => p !== selectedCard.position);
    return others.length > 0 ? others[0] : null;
  }

  /**
   * Detect "cluster" — same symbol tends to appear in same quadrant
   */
  detectCluster(symbol, cards) {
    const matchCards = cards.filter(c => c.symbol === symbol && !c.matched);
    if (matchCards.length === 0) return null;

    const avgCol = matchCards.reduce((s, c) => s + (c.position % this.gridCols), 0) / matchCards.length;
    const avgRow = matchCards.reduce((s, c) => s + Math.floor(c.position / this.gridCols), 0) / matchCards.length;

    return {
      centerCol: Math.round(avgCol),
      centerRow: Math.round(avgRow),
      quadrant: `${avgRow < this.gridRows / 2 ? 'top' : 'bottom'}-${avgCol < this.gridCols / 2 ? 'left' : 'right'}`
    };
  }

  /**
   * Score a card position based on pattern heuristics
   */
  getPatternScore(card, selectedCard) {
    let score = 0;

    // Same row bonus
    const selectedRow = Math.floor(selectedCard.position / this.gridCols);
    const cardRow = Math.floor(card.position / this.gridCols);
    if (selectedRow === cardRow) score += 10;

    // Mirror position bonus (cards placed symmetrically)
    const mirrorPos = this.gridCols * this.gridRows - 1 - selectedCard.position;
    if (card.position === mirrorPos) score += 15;

    // Known-seen bonus
    const seen = this.knownPositions[selectedCard.symbol];
    if (seen && seen.includes(card.position)) score += 50;

    return score;
  }

  reset() {
    this.knownPositions = {};
    this.flipHistory = [];
  }
}
