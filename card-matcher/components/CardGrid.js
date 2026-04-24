/**
 * CARD GRID COMPONENT — 8×5 Grid Renderer
 * Renders 40 cards, handles flip logic, emits events
 */

// SYMBOLS imported from app.js when needed — CardGrid receives card data directly

export class CardGrid {
  constructor(container, onCardClick) {
    this.container = container;
    this.onCardClick = onCardClick;
  }

  render(cards, probMap, selectedCard, hintCardId, nenVictimId) {
    this.container.innerHTML = '';

    cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.id = card.id;

      if (card.matched) el.classList.add('matched');
      else if (card.flipped) el.classList.add('flipped');

      if (selectedCard && card.id === selectedCard.id) el.classList.add('selected');
      if (hintCardId && card.id === hintCardId) el.classList.add('hint-glow');
      if (nenVictimId && card.id === nenVictimId) el.classList.add('nen-victim');

      const inner = document.createElement('div');
      inner.className = 'card-inner';

      const front = document.createElement('div');
      front.className = 'card-face card-front';
      front.innerHTML = `<span class="card-symbol">${card.symbol}</span>`;

      const back = document.createElement('div');
      back.className = 'card-face card-back';
      back.innerHTML = `<div class="card-back-pattern">✦</div>`;

      // Probability overlay on back (face-down)
      if (!card.flipped && !card.matched && probMap && probMap[card.id] !== undefined) {
        const probEl = document.createElement('div');
        const prob = probMap[card.id];
        probEl.className = 'prob-overlay';
        probEl.classList.add(prob >= 70 ? 'prob-high' : prob >= 40 ? 'prob-mid' : 'prob-low');
        probEl.textContent = `${prob}%`;
        back.appendChild(probEl);
      }

      inner.appendChild(front);
      inner.appendChild(back);
      el.appendChild(inner);

      if (!card.matched && !card.flipped) {
        el.addEventListener('click', () => this.onCardClick(card.id));
      }

      this.container.appendChild(el);
    });
  }
}
