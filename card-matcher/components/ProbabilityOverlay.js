/**
 * PROBABILITY OVERLAY — Visual probability indicator
 * Shows Nen aura strength around selected card
 */

export class ProbabilityOverlay {
  constructor(container) {
    this.container = container;
  }

  renderNenBar(level, warningLevel, interferenceCount) {
    const colors = {
      safe: '#00ff88',
      caution: '#ffcc00',
      danger: '#ff6600',
      critical: '#ff0044'
    };

    const labels = {
      safe: "Nen Stable",
      caution: "Bungee Gum Stirring...",
      danger: "INTERFERENCE IMMINENT",
      critical: "HISOKA ACTIVATES NEN"
    };

    this.container.innerHTML = `
      <div class="nen-bar-wrapper">
        <div class="nen-label" style="color:${colors[warningLevel]}">${labels[warningLevel]}</div>
        <div class="nen-bar-track">
          <div class="nen-bar-fill" style="width:${level}%; background:${colors[warningLevel]};"></div>
        </div>
        <div class="nen-count">Interferences: ${interferenceCount}</div>
      </div>
    `;
  }
}
