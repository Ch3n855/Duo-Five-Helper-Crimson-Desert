# DUO/5 Helper — Crimson Desert

Based on the original calculator by [leumas152000](https://github.com/leumas152000/Crimson-Desert-Duo-Calculator-), reworked extensively with AI assistance.

---

## What it does

A browser-based companion tool for the **Duo** and **Five-Card** mini-games in Crimson Desert. Enter the cards you can see on your hand, your opponents' visible cards — and the app calculates your win/tie/lose probability and gives you a concrete betting recommendation.

---

## Structure

The app is a single HTML file with four JS modules and an external stylesheet, no build step needed:

```
index.html
styles.css
js/
  state.js   — game constants, decks, translations, app state
  logic.js   — hand evaluation, comparison engine, odds calculator
  ui.js      — rendering helpers, advice, threat badges, card selectors
  main.js    — render loop, mode routing, event handlers
```

---

## Modes

### Duo
The original game mode. Played with a 20-card deck (1–10, one Red and one Yellow of each). You hold 2 cards; so does each opponent.

- Enter your 2 cards and up to 3 opponents' visible cards
- Win/tie/lose probability is calculated against each opponent individually, and as a combined scenario when facing multiple opponents at once (cards are drawn without replacement across opponents)
- The recommended action — **ALL-IN, DOUBLE RAISE, HALF RAISE, CHECK, CALL,** or **FOLD** — adapts to whether you're acting first or responding to a raise
- Ties (rematches) are counted as half-wins in the advice thresholds, but if you have zero actual wins they are treated as pure rematches and don't inflate the recommendation
- Contextual notes appear for weak hands (slow-check bluff tip), when an opponent shows a dangerous card (1, 2, or 10), and when your hand is an Executor

### Five-Card (Cinq-Cartes)
Played with a 40-card deck (two copies of 1–10 in each colour). Each player holds 5 cards; they must form a 3-card base summing to exactly 10, 20, or 30, with the best remaining 2-card hand winning.

- Enter all 5 of your cards; the app finds the optimal 3-card base and shows which 2 cards form your actual hand, with BASE and HAND labels
- If no valid base exists, it shows Bust — automatic loss
- Opponent odds are computed by iterating every possible 4-card hidden combination (exact calculation for 1 opponent; Monte Carlo simulation with 12,000 trials when facing 2 or 3 opponents simultaneously)
- The Five-Card hand set differs from Duo: no Prime Pair, Warden, High Warden, Judge, or Executor — only Superior Pair, Ten Pair, regular Pairs, Perfect Nine, Points, Zero, and Bust

### Spot Cheaters
A visual reference guide with side-by-side animated images showing how dealers hold and place cards normally versus when they cheat. Includes advice on when to use the Accuse button and what the stakes are for a wrong accusation.

### Fedora Guide (Deceiver's Fedora)
Step-by-step guide to unlocking the Deceiver's Fedora item: location in the Tashkalp region, the quest chain required, how to raise vendor trust to 100%, and how to use the item during a game to reveal opponents' full hands.

When the **Fedora toggle** is active in Duo or Five-Card mode, the app switches to full-hand mode — you enter both cards of each opponent (or all 5 for Five-Card), and the result becomes a deterministic win/loss/tie rather than a probability.

---

## UI

- **Three-column layout** — hand on the left, win% and advice in the centre over the game's background image with a blur overlay, opponents on the right
- **Card selectors** — a red row and yellow row per slot; one click picks number and colour together; cards already in use elsewhere are greyed out
- **Threat badges** — when an opponent's visible card is entered, a badge shows what dangerous hands it could still enable (contextual: checks whether the required partner cards are still available)
- **Fold button** — mark an opponent as folded; their card is still removed from the available pool but they're excluded from the odds
- **Rules panel** — a floating button opens a full reference overlay with all hand rankings, betting options, and special hand rules; separate panels for Duo and Five-Card
- **Bilingual** — full English / French throughout, persisted to localStorage
- **Media lightbox** — images and GIFs in the Spot Cheaters and Fedora Guide pages can be clicked to enlarge

---

## Credits

Original concept: [leumas152000](https://github.com/leumas152000/Crimson-Desert-Duo-Calculator-)  
Reworked with AI assistance.

# Screenshots

<img width="1425" height="645" alt="Image" src="https://github.com/user-attachments/assets/5b2a5e58-d5da-4678-804d-a48eeb4c75b5" />
<img width="1425" height="645" alt="Image" src="https://github.com/user-attachments/assets/734479d7-b17a-48a3-9078-03fd376bf978" />
<img width="1425" height="645" alt="Image" src="https://github.com/user-attachments/assets/b81eb60e-f0b4-4a49-9951-ca354b0d752f" />
<img width="1431" height="649" alt="Image" src="https://github.com/user-attachments/assets/838d2acc-6c05-4c32-9f3e-1a51071d268b" />
