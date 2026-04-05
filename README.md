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
The Warden hand had three separate mistakes:

It was getting a Rematch against every Pair — when it should lose to all of them
It was losing to One-two — when One-two is actually the exact threshold where a Rematch should happen
It was getting a Rematch against One-four, One-nine, One-ten, Four-ten, and Four-six — when it should lose to all of those too

# Screenshots



Five-Card mode — the original had no Five-Card support at all. The new version lets you enter all 5 cards you receive, automatically figures out the best 3-card combination to make a valid base (summing to 10 or 20), and shows you which 2 cards become your actual hand. If no valid combination exists, it tells you it's a Bust.
Spot Cheaters — a visual guide that shows side-by-side animated images of how a dealer holds the cards normally vs. how they cheat (bottom-dealing), with advice on when and how to use the Accuse button.
