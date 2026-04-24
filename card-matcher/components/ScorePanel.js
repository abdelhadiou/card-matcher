/**
 * SCORE PANEL — HUD display
 */

export class ScorePanel {
  constructor(container) {
    this.container = container;
  }

  render({ score, moves, timeLeft, pairsFound, totalPairs, hintUsed }) {
    const urgency = timeLeft <= 15 ? 'timer-urgent' : timeLeft <= 30 ? 'timer-warn' : '';
    this.container.innerHTML = `
      <div class="hud-grid">
        <div class="hud-item">
          <div class="hud-val">${score}</div>
          <div class="hud-lbl">SCORE</div>
        </div>
        <div class="hud-item">
          <div class="hud-val">${moves}</div>
          <div class="hud-lbl">MOVES</div>
        </div>
        <div class="hud-item ${urgency}">
          <div class="hud-val">${timeLeft}s</div>
          <div class="hud-lbl">TIME</div>
        </div>
        <div class="hud-item">
          <div class="hud-val">${pairsFound}/${totalPairs}</div>
          <div class="hud-lbl">PAIRS</div>
        </div>
        <div class="hud-item">
          <div class="hud-val" style="color:${hintUsed > 0 ? '#00ccff' : 'var(--gold-bright)'};">${hintUsed}</div>
          <div class="hud-lbl">HINTS</div>
        </div>
      </div>
    `;
  }
}
