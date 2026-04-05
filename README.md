# Duo-Five-Helper-Crimson-Desert
Based on the original code of leumas152000 : https://github.com/leumas152000/Crimson-Desert-Duo-Calculator-
Reworked with the help of AI. 

# Visual updates :

**Visual changes**
The current version uses a pure-black design with a three-column layout: your hand on the left, the win percentage and advice in the centre (over the game's background image), and your opponents on the right. 

**Advice**
The current version gives you the in-game action — ALL-IN, DOUBLE RAISE, HALF RAISE, CHECK, CALL, or FOLD — with a short sentence explaining the reasoning, and adjusts the thresholds depending on whether you're acting first or facing a raise.

**How you pick cards**
The current version shows a red row and a yellow row side by side. One click picks both the number and the colour. Cards already used somewhere else are greyed out so you can't accidentally pick them twice.

# Things added to the Duo mode

**Up to 3 opponents** — the original capped at 2, with basic Add/Remove buttons. Now supports 3, with individual remove buttons per opponent
Fold button — you can mark an opponent as folded. Their card is still removed from the deck (so it doesn't appear as a possible card for anyone else) but they drop out of the odds.

**Threat warning** — when you enter an opponent's visible card, a badge appears explaining what dangerous hands that card could lead to (e.g. a Red 4 can form the High Warden, Executor, or Warden).

**Hand Rankings & Rules panel** — a collapsible reference at the bottom showing every hand in order, the betting options, and the special hand rules.

# Things added / corrected

The Judge hand (3+7) didn't exist. It's now fully implemented: it beats all Pairs, but is treated as Zero against everything else.

**Five-Card mode** — the original had no Five-Card support at all. The new version lets you enter all 5 cards you receive, automatically figures out the best 3-card combination to make a valid base (summing to 10 or 20), and shows you which 2 cards become your actual hand. If no valid combination exists, it tells you it's a Bust.
**/!\ Didn't played the Five-Card mode yet. It's based on the in game rules.**

**Spot Cheaters guide** — a visual guide that shows side-by-side animated images of how a dealer holds the cards normally vs. how they cheat (bottom-dealing), with advice on when and how to use the Accuse button.

# Screenshots

<img width="1437" height="654" alt="Image" src="https://github.com/user-attachments/assets/7e23631e-064c-46ed-ac25-ca3bc3041223" />
<img width="1437" height="654" alt="Image" src="https://github.com/user-attachments/assets/a2511704-9b65-4127-90d2-4c1676875b78" />
<img width="1437" height="654" alt="Image" src="https://github.com/user-attachments/assets/e1dedad3-14a5-4362-a792-6b160834f6ac" />
<img width="1437" height="654" alt="Image" src="https://github.com/user-attachments/assets/cde09615-f7c2-469a-a370-eac69deff3cf" />
