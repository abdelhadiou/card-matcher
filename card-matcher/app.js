/**
 * GREED ISLAND: THE CARDS MATCHER
 * Main Application Entry Point
 */

import { ProbabilityEngine } from './algorithm/probabilityEngine.js';
import { PatternDetector } from './algorithm/patternDetector.js';
import { InterferenceManager } from './algorithm/interferenceManager.js';
import { CardGrid } from './components/CardGrid.js';
import { ProbabilityOverlay } from './components/ProbabilityOverlay.js';
import { ScorePanel } from './components/ScorePanel.js';

export const SYMBOLS = [
  '🃏', '⚡', '🔥', '💎', '🌙', '⚔️', '🐉', '🌸',
  '🎯', '🦋', '🌊', '🔮', '💀', '🦅', '🌺', '⭐',
  '🐺', '🎭', '🏹', '💫'
];

const GRID_COLS = 8;
const GRID_ROWS = 5;
const TOTAL_CARDS = 40;
const GAME_TIME = 40;

class GreedIslandGame {
  constructor() {
    this.cards = [];
    this.selectedCard = null;
    this.isProcessing = false;
    this.score = 0;
    this.moves = 0;
    this.pairsFound = 0;
    this.timeLeft = GAME_TIME;
    this.timer = null;
    this.probMap = {};
    this.hintCardId = null;
    this.nenVictimId = null;
    this.gameStarted = false;
    this.gameOver = false;
    this.showHints = false;

    this.gridEl = document.getElementById('card-grid');
    this.scorePanelEl = document.getElementById('score-panel');
    this.nenBarEl = document.getElementById('nen-bar');
    this.messageEl = document.getElementById('hisoka-message');
    this.overlayEl = document.getElementById('game-overlay');

    this.cardGrid = new CardGrid(this.gridEl, (id) => this.handleCardClick(id));
    this.scorePanel = new ScorePanel(this.scorePanelEl);
    this.probOverlay = new ProbabilityOverlay(this.nenBarEl);

    this.interference = new InterferenceManager(() => this.onNenInterference());
    this.patternDetector = new PatternDetector(GRID_COLS, GRID_ROWS);
    this.probabilityEngine = null;

    document.getElementById('btn-start').addEventListener('click', () => this.startGame());
    document.getElementById('btn-hint').addEventListener('click', () => this.useHint());
    document.getElementById('btn-restart').addEventListener('click', () => this.restartGame());
  }

  initCards() {
    const deck = [];
    SYMBOLS.forEach(sym => { deck.push(sym); deck.push(sym); });
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.cards = deck.map((symbol, i) => ({
      id: i,
      symbol,
      position: i,
      flipped: false,
      matched: false
    }));
  }

  startGame() {
    this.overlayEl.classList.add('hidden');
    this.initCards();
    this.score = 0;
    this.moves = 0;
    this.pairsFound = 0;
    this.timeLeft = GAME_TIME;
    this.selectedCard = null;
    this.probMap = {};
    this.hintCardId = null;
    this.nenVictimId = null;
    this.gameOver = false;
    this.gameStarted = true;

    this.interference.reset();
    this.patternDetector.reset();
    this.probabilityEngine = new ProbabilityEngine(this.cards, GRID_COLS);
    this.hintsUsed = 0;

    this.render();
    this.startTimer();
    this.showMessage("\"Find all 20 pairs before I get... bored.\" — Hisoka 🃏", 3000);
  }

  restartGame() {
    clearInterval(this.timer);
    this.startGame();
  }

  startTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.renderHUD();
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.endGame(false);
      }
    }, 1000);
  }

  async handleCardClick(cardId) {
    if (this.isProcessing || this.gameOver) return;
    const card = this.cards[cardId];
    if (!card || card.flipped || card.matched) return;

    // Flip card
    card.flipped = true;
    this.moves++;
    this.patternDetector.recordFlip(card);

    if (!this.selectedCard) {
      // First flip
      this.selectedCard = card;
      const rawProbs = this.probabilityEngine.calculateProbabilities(card, this.cards);

      // FIX 2: Blend pattern detector scores into the probability map
      Object.keys(rawProbs).forEach(id => {
        const c = this.cards[parseInt(id)];
        if (!c) return;
        const patternBonus = this.patternDetector.getPatternScore(c, card);
        // Convert pattern bonus (0–75) to a probability nudge (0–20pp)
        const nudge = Math.round((patternBonus / 75) * 20);
        rawProbs[id] = Math.min(99, rawProbs[id] + nudge);
      });

      // FIX 2b: If we've previously seen this card's pair, force it to 97%
      const knownPairPos = this.patternDetector.findKnownPair(card);
      if (knownPairPos !== null) {
        const knownCard = this.cards.find(c => c.position === knownPairPos && !c.matched && !c.flipped);
        if (knownCard) rawProbs[knownCard.id] = 97;
      }

      this.probMap = rawProbs;
      this.render();
    } else {
      // Second flip — evaluate match
      const first = this.selectedCard;
      this.selectedCard = null;
      this.isProcessing = true;
      this.probMap = {};
      this.hintCardId = null;
      this.render();

      await this.delay(700);

      if (first.symbol === card.symbol) {
        // MATCH
        first.matched = true;
        card.matched = true;
        this.pairsFound++;
        this.score += 10;
        this.interference.recordMatch();
        this.nenVictimId = null;
        this.showMessage(this.getMatchMessage(), 1500);

        if (this.pairsFound === 20) {
          clearInterval(this.timer);
          await this.delay(500);
          this.endGame(true);
          return;
        }
      } else {
        // MISMATCH
        first.flipped = false;
        card.flipped = false;
        const result = this.interference.recordMismatch();
        this.showWarning(result);
      }

      this.isProcessing = false;
      this.render();
    }
  }

  onNenInterference() {
    // Find matched cards to flip back
    const matchedCards = this.cards.filter(c => c.matched);
    if (matchedCards.length === 0) return;

    const victim = this.interference.selectVictimCard(matchedCards);
    if (!victim) return;

    // Flip one card of the pair back
    const pairCards = this.cards.filter(c => c.symbol === victim.symbol && c.matched);
    const target = pairCards[Math.floor(Math.random() * pairCards.length)];

    target.matched = false;
    target.flipped = false;
    this.pairsFound--;
    this.score = Math.max(0, this.score - 10);
    this.nenVictimId = target.id;
    this.probabilityEngine = new ProbabilityEngine(this.cards, GRID_COLS);

    // FIX 1: Enable Nen distortion so probability numbers are skewed after interference
    this.probabilityEngine.enableNenDistortion(0.35);
    setTimeout(() => {
      this.probabilityEngine.disableNenDistortion();
    }, 8000); // distortion lasts 8 seconds

    this.showMessage("\"Bungee Gum... has the properties of both rubber and gum. And memory.\" — Hisoka 🃏", 3000);
    setTimeout(() => { this.nenVictimId = null; this.render(); }, 2000);
    this.render();
  }

  useHint() {
    if (!this.selectedCard || this.gameOver) return;

    // FIX 3: Hint uses patternDetector memory first — if we've seen the pair, go straight to it
    const knownPairPos = this.patternDetector.findKnownPair(this.selectedCard);
    if (knownPairPos !== null) {
      const knownCard = this.cards.find(c => c.position === knownPairPos && !c.matched && !c.flipped);
      if (knownCard) {
        this.hintCardId = knownCard.id;
        this.score = Math.max(0, this.score - 2);
        this.hintsUsed = (this.hintsUsed || 0) + 1;
        this.render();
        this.showMessage(`Nen memory: card #${knownCard.id + 1} — you've seen this symbol before! (97%)`, 2500);
        return;
      }
    }

    // Fall back to highest probability card
    const best = this.probabilityEngine.getBestMoveHint(this.probMap);
    if (best) {
      this.hintCardId = best.id;
      this.score = Math.max(0, this.score - 2);
      this.hintsUsed = (this.hintsUsed || 0) + 1;
      this.render();
      this.showMessage(`Hint: card #${best.id + 1} has ${best.prob}% match chance`, 2000);
    }
  }

  showMessage(msg, duration = 2500) {
    this.messageEl.textContent = msg;
    this.messageEl.classList.add('visible');
    clearTimeout(this._msgTimer);
    this._msgTimer = setTimeout(() => this.messageEl.classList.remove('visible'), duration);
  }

  showWarning(result) {
    const warning = this.interference.getWarningLevel();
    const msgs = {
      caution: `"Careful now... 1 mismatch." — Hisoka`,
      danger: `"2 mismatches... my fingers are getting itchy." — Hisoka ⚠️`,
      critical: `"3 MISMATCHES! My Nen activates!" — Hisoka 💀`
    };
    if (warning !== 'safe') {
      this.showMessage(msgs[warning] || '', 2000);
    }
  }

  getMatchMessage() {
    const msgs = [
      '"Splendid. But don\'t celebrate yet." — Hisoka',
      '"A match. How... delightful." — Hisoka 🃏',
      '"Your memory serves you well. For now." — Hisoka',
      '"Impressive. Continue." — Hisoka',
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  endGame(win) {
    this.gameOver = true;
    const overlay = this.overlayEl;
    overlay.classList.remove('hidden');
    overlay.querySelector('.overlay-title').textContent = win ? '🏆 MISSION COMPLETE' : '💀 GAME OVER';
    overlay.querySelector('.overlay-subtitle').textContent = win
      ? `"Impressive, little Hunter. You've earned your passage." — Hisoka`
      : `"Tsk. How disappointing. Time's up." — Hisoka`;
    overlay.querySelector('.overlay-stats').innerHTML = `
      Score: ${this.score} pts &nbsp;|&nbsp; Moves: ${this.moves} &nbsp;|&nbsp; Pairs: ${this.pairsFound}/20<br>
      ${win ? `Perfect score would be 200 — efficiency rating: ${Math.round((200 / Math.max(1, this.score)) * 100 > 100 ? 100 : (this.score / 200) * 100)}%` : ''}
    `;
  }

  render() {
    this.cardGrid.render(this.cards, this.probMap, this.selectedCard, this.hintCardId, this.nenVictimId);
    this.renderHUD();
    this.probOverlay.renderNenBar(
      this.interference.getNenChargeLevel(),
      this.interference.getWarningLevel(),
      this.interference.interferenceCount
    );
  }

  renderHUD() {
    this.scorePanel.render({
      score: this.score,
      moves: this.moves,
      timeLeft: this.timeLeft,
      pairsFound: this.pairsFound,
      totalPairs: 20,
      hintUsed: this.hintsUsed || 0   // FIX 4: pass hint count to HUD
    });
  }

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  window._game = new GreedIslandGame();
});
