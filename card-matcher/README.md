# 🃏 GREED ISLAND: THE CARDS MATCHER
### Challenge 01 — High-Difficulty Probability Memory Game

> *"This is Greed Island, little Hunter. Nothing is simple."* — Hisoka

---

## 📖 Overview

A Hunter × Hunter–themed memory card matching game built with vanilla JavaScript (ES Modules). The player must find all **20 pairs** from **40 face-down cards** (8×5 grid) within **60 seconds** — aided (and sabotaged) by a live probability engine and Hisoka's Nen interference.

---

## 🗂️ Project Structure

```
card-matcher/
├── index.html                  — Game shell & DOM structure
├── style.css                   — Full HxH-themed UI styles
├── app.js                      — Main game controller & boot
├── algorithm/
│   ├── probabilityEngine.js    — Probability calculation engine
│   ├── patternDetector.js      — Positional pattern & memory assist
│   └── interferenceManager.js  — Nen interference & mismatch tracking
├── components/
│   ├── CardGrid.js             — 8×5 grid renderer & flip logic
│   ├── ProbabilityOverlay.js   — Nen bar & warning level display
│   └── ScorePanel.js           — HUD (score, moves, timer, pairs)
└── README.md
```

---

## 🚀 How to Run

Open `index.html` in any modern browser. No build step or server required — the game uses native ES Modules (`type="module"`).

> **Note:** Because of ES Module security restrictions, open via a local server (e.g. `npx serve .` or VS Code Live Server) rather than directly as a `file://` URL.

---

## 🎮 Game Mechanics

### Core Rules
| Rule | Detail |
|------|--------|
| **Grid** | 8 columns × 5 rows = 40 cards |
| **Pairs** | 20 unique symbols, each appearing exactly twice |
| **Timer** | 60 seconds to find all pairs |
| **Match** | Both cards stay revealed · +10 points |
| **Mismatch** | Both cards flip back · +0 points |
| **Win** | All 20 pairs found before time expires |
| **Lose** | Timer reaches 0 |

### Scoring
- **+10 pts** per matched pair
- **−2 pts** when using the hint feature
- **Perfect score** = 200 pts (20 moves, zero mismatches, no hints)
- **Efficiency rating** shown on win screen

---

## ⚡ The Probability Engine (`algorithm/probabilityEngine.js`)

After each first flip, every remaining face-down card displays a **probability percentage (0–100%)** indicating how likely it is to match the selected card.

### Calculation Formula

```
base_chance = 1 / total_unmatched_cards

For a card that IS the actual pair:
  prob = 85% – 95%  (randomised to simulate Nen aura "reading")

For all other cards:
  prob = base_noise (5%–20%)
  + adjacency_bonus  (×1.2 + 5pp if within 1 cell of selected card)
  − rarity_penalty   (×0.7 if only 1 copy of symbol remains)
  ± nen_distortion   (random ±0–30pp when Hisoka activates)
```

### Colour Coding
| Colour | Range | Meaning |
|--------|-------|---------|
| 🟢 Green | 70–100% | High match probability |
| 🟡 Yellow | 40–69% | Medium — worth considering |
| 🔴 Red | 0–39% | Low — likely not the pair |

---

## 🔮 Pattern Detector (`algorithm/patternDetector.js`)

Tracks every card flip across the session and builds a **memory map** of seen symbols.

### Features
- **Known-pair memory**: If you've previously flipped a card with the same symbol, the engine flags its position with a +50 score bonus.
- **Mirror detection**: Cards placed symmetrically (position `N` ↔ position `39−N`) get a +15 bonus.
- **Same-row bonus**: Cards in the same row as the selected card get +10.
- **Cluster detection**: Calculates the average position of unseen copies of a symbol — useful for the hint system to suggest quadrants.

> *"Adjacent cards share aura. If you flip a dragon, check its neighbours."* — Killua

---

## 💀 Interference Manager (`algorithm/interferenceManager.js`)

Implements **Hisoka's Bungee Gum Memory Distortion** mechanic.

### Nen Interference Trigger
- Every **3 consecutive mismatches** → Hisoka's Nen activates
- One random **already-matched** card pair has one card **flipped back face-down**
- The pair counter and score are decremented (-10 pts, -1 pair)
- You must re-discover that card

### Nen Charge Bar
The UI displays a charge bar that fills as consecutive mismatches accumulate:

| Mismatches | State | Colour |
|-----------|-------|--------|
| 0 | Nen Stable | 🟢 Green |
| 1 | Bungee Gum Stirring... | 🟡 Yellow |
| 2 | INTERFERENCE IMMINENT | 🟠 Orange |
| 3 | HISOKA ACTIVATES NEN | 🔴 Red → resets |

> *"Plan your flips in batches of 2 to reset the counter."* — Kurapika

---

## 💡 Best Move Hint System

Press **💡 HINT** (costs −2 pts) while a card is selected to highlight the face-down card with the **highest probability score** in cyan.

The hint combines:
1. Probability engine output
2. Pattern detector memory bonuses
3. Cluster position data

---

## 🧩 Component Breakdown

### `CardGrid.js`
- Renders the full 8×5 grid into a CSS Grid container
- Handles card flip animations via CSS class toggling (`flipped`, `matched`, `selected`, `hint-glow`, `nen-victim`)
- Injects probability percentage badges onto each face-down card

### `ProbabilityOverlay.js`
- Renders the Nen Interference bar with animated fill and colour transitions
- Displays warning level label and total interference count

### `ScorePanel.js`
- Renders the HUD strip: Score / Moves / Timer / Pairs
- Timer turns yellow at ≤30s, red and pulsing at ≤15s

---

## 🏆 Strategy Tips

> *"A perfect game is 20 moves. One flip per pair, then the match. Anything more is inefficiency."* — Biscuit

1. **Scan before clicking** — use the probability overlay to eliminate low-probability cards.
2. **Memorise revealed cards** even after mismatch — the pattern detector rewards memory.
3. **Watch the Nen bar** — if you're at 2 mismatches, consider a known safe pair first to reset.
4. **Use hints sparingly** — the −2 pt cost adds up; trust the 85%+ cards.
5. **Adjacent cards** get a 20% probability boost — clusters of the same symbol tend to be close.

> *"The probability numbers lie sometimes. Watch for sudden drops — that's his Bungee Gum stretching the truth."* — Gon

---

## 🛠️ Technical Notes

- **No dependencies** — pure vanilla JS ES Modules, no npm, no build tool
- **CSS custom properties** drive the entire HxH colour theme
- **CSS 3D transforms** power card flip animations (hardware-accelerated)
- All probability values are deterministic per flip but seeded with `Math.random()` noise to simulate Nen aura unpredictability
- The Nen interference victim is selected via `InterferenceManager.selectVictimCard()` using uniform random selection over matched cards

---

*"Probability is not destiny. The 93% card still fails 7% of the time. Trust nothing."* — **Hisoka** 🃏
