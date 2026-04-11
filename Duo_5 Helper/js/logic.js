function evalHand(a, b) {
  const lo = Math.min(a.n, b.n), hi = Math.max(a.n, b.n);
  const both = a.col==='red' && b.col==='red';
  const sum  = (a.n + b.n) % 10;
  if (lo===3&&hi===8&&both)             return { t:'prime_pair',    r:RK.PP,  num:null, sum, fb:sum };
  if (lo===1&&(hi===3||hi===8)&&both)   return { t:'superior_pair', r:RK.SP,  num:null, sum, fb:sum };
  if (lo===4&&hi===9&&both)             return { t:'high_warden',   r:-1,     num:null, sum, fb:3   };
  if (lo===4&&hi===7&&both)             return { t:'executor',      r:-1,     num:null, sum, fb:1   };
  if (lo===10&&hi===10)                 return { t:'ten_pair',      r:RK.TP,  num:null, sum, fb:sum };
  if (lo===4&&hi===9)                   return { t:'warden',        r:-1,     num:null, sum, fb:3   };
  if (lo===3&&hi===7)                   return { t:'judge',         r:-1,     num:null, sum, fb:sum };
  if (lo===hi)                          return { t:'pair',          r:RK.PB+lo, num:lo, sum, fb:sum };
  if (lo===1&&hi===2)                   return { t:'one_two',       r:RK.OT,  num:null, sum, fb:sum };
  if (lo===1&&hi===4)                   return { t:'one_four',      r:RK.OF,  num:null, sum, fb:sum };
  if (lo===1&&hi===9)                   return { t:'one_nine',      r:RK.ON,  num:null, sum, fb:sum };
  if (lo===1&&hi===10)                  return { t:'one_ten',       r:RK.OTn, num:null, sum, fb:sum };
  if (lo===4&&hi===10)                  return { t:'four_ten',      r:RK.FT,  num:null, sum, fb:sum };
  if (lo===4&&hi===6)                   return { t:'four_six',      r:RK.FS,  num:null, sum, fb:sum };
  if (sum===9)                          return { t:'perfect_nine',  r:RK.P9,  num:null, sum, fb:9   };
  if (sum===0)                          return { t:'zero',          r:RK.ZERO,num:null, sum, fb:0   };
  return                                       { t:'points',        r:sum,    num:null, sum, fb:sum };
}

function evalHand5(a, b) {
  const lo = Math.min(a.n, b.n), hi = Math.max(a.n, b.n);
  const sum  = (a.n + b.n) % 10;
  if (lo===10&&hi===10)                 return { t:'ten_pair',      r:80, num:null, sum, fb:sum };
  if (lo===hi)                          return { t:'pair',          r:70+lo, num:lo, sum, fb:sum };
  if (sum===9)                          return { t:'perfect_nine',  r:50, num:null, sum, fb:9 };
  if (sum===0)                          return { t:'zero',          r:0, num:null, sum, fb:0 };
  return                                       { t:'points',        r:sum, num:null, sum, fb:sum };
}

// ── Five-Card hand resolution ─────────────────────────────────────────────────
// Finds all 3-card combos summing to 10/20/30, returns best 2-card hand from remainder
function evalFiveCardHand(cards) {
  const filled = cards.filter(c => c.n && c.col);
  if (filled.length < 5) return null; // need all 5

  let bestHand = null;
  let bestRank = -Infinity;
  let bestCombo3 = null; // the 3 cards used for base
  let isBust = true;

  // Try all combinations of 3 cards from the 5
  for (let i=0;i<5;i++) for (let j=i+1;j<5;j++) for (let k=j+1;k<5;k++) {
    const sum3 = filled[i].n + filled[j].n + filled[k].n;
    if (sum3 === 10 || sum3 === 20 || sum3 === 30) {
      isBust = false;
      // The remaining 2 cards form the hand
      const rem = filled.filter((_,idx) => idx!==i && idx!==j && idx!==k);
      const h = evalHand5(rem[0], rem[1]);
      // Pick the best possible 2-card hand
      const rank = h.r;
      if (rank > bestRank) {
        bestRank = rank;
        bestHand = h;
        bestCombo3 = [filled[i],filled[j],filled[k]];
      }
    }
  }

  if (isBust) return { bust: true };
  return { hand: bestHand, base: bestCombo3, bust: false };
}

// Five-Card resolution must be order-independent. The UI may present cards in
// any slot order, but the game resolves from the full 5-card set.
function evalFiveCardShownHand(cards) {
  return evalFiveCardHand(cards);
}

function handName(h) {
  const tbl = HAND_NAMES[S.lang];
  if (h.t === 'pair')   return (S.lang==='fr' ? 'Paire de '+h.num : 'Pair of '+h.num+'s');
  if (h.t === 'points') {
    if (S.lang === 'fr') return `${h.sum} ${h.sum === 1 ? 'point' : 'points'}`;
    return `${h.sum} ${h.sum === 1 ? 'Point' : 'Points'}`;
  }
  return tbl[h.t] || h.t;
}

// ── Hand comparison ───────────────────────────────────────────────────────────
// Based on official in-game rules :
// - Warden (4+9 any): rematch if ALL players ≤ Un-Deux (one_two). Loses to everything above.
// - High Warden (R4+R9): rematch if ALL players ≤ Pair of 9. Loses to 10-pair and above.
// - Judge (3+7): beats Pairs ≤9. Treated as Zéro (r=0) against everything else.
// - Executor (R4+R7): beats Superior Pair. Cannot beat Prime Pair. Else treated as 1 point.
function ord(a, b) { return a>b ? 'win' : a<b ? 'lose' : 'tie'; }

// Named hands above one_two (warden rematch threshold) in rank order:
const ABOVE_ONE_TWO = new Set(['one_four','one_nine','one_ten','four_ten','four_six','perfect_nine']);

function cmp(my, op) {

  // ── Judge (3+7) ──────────────────────────────────────────
  // Beats pairs ≤9. Treated as Zéro against everything else.
  if (my.t==='judge') {
    if (TOP.includes(op.t))                                           return 'lose';
    if (op.t==='pair')                                                return 'win';
    if (op.t==='judge')                                               return 'tie';
    if (op.t==='warden'||op.t==='high_warden')                       return 'tie';
    if (op.t==='executor')                                            return 'lose';
    // Treated as Zéro: loses to points>0, ties with zero
    if (op.t==='zero')                                                return 'tie';
    if (op.t==='points') return ord(0, op.r); // zero(0) vs points
    return 'lose'; // loses to all named hands (one_two+)
  }
  if (op.t==='judge') {
    if (TOP.includes(my.t))                                           return 'win';
    if (my.t==='pair')                                                return 'lose';
    if (my.t==='warden'||my.t==='high_warden')                       return 'tie';
    if (my.t==='executor')                                            return 'win';
    if (my.t==='zero')                                                return 'tie';
    if (my.t==='points') return ord(my.r, 0);
    return 'win'; // named hands (one_two+) beat judge-as-zero
  }

  // ── Executor (R4+R7) ─────────────────────────────────────
  // Beats Superior Pair. Cannot beat Prime Pair. Else treated as 1 point.
  if (my.t==='executor') {
    if (op.t==='prime_pair')                                          return 'lose';
    if (op.t==='superior_pair')                                       return 'win';
    if (op.t==='executor')                                            return 'tie';
    if (op.t==='high_warden'||op.t==='warden')                       return 'tie';
    return ord(1, op.r); // treated as 1 point
  }
  if (op.t==='executor') {
    if (my.t==='prime_pair')                                          return 'win';
    if (my.t==='superior_pair')                                       return 'lose';
    if (my.t==='warden'||my.t==='high_warden')                       return 'tie';
    return ord(my.r, 1);
  }

  // ── High Warden (R4+R9) ──────────────────────────────────
  // Rematch if ALL players ≤ Pair of 9. Loses to Pair of 10 and above.
  if (my.t==='high_warden') {
    if (TOP.includes(op.t))                                           return 'lose';
    if (op.t==='pair' && op.r > RK.NINE_PAIR)                        return 'lose'; // 10-pair and above
    return 'tie'; // rematch: everything ≤ 8-pair, named hands, points, zero
  }
  if (op.t==='high_warden') {
    if (TOP.includes(my.t))                                           return 'win';
    if (my.t==='pair' && my.r > RK.NINE_PAIR)                        return 'win';
    return 'tie';
  }

  // ── Warden (4+9 any) ─────────────────────────────────────
  // Rematch if ALL players ≤ Un-Deux. one_two = threshold (rematch).
  // Loses to: TOP hands, any pair, any named hand above one_two.
  // Ties (rematch): one_two, points, zero.
  if (my.t==='warden') {
    if (TOP.includes(op.t))                                           return 'lose';
    if (op.t==='pair')                                                return 'lose';
    if (ABOVE_ONE_TWO.has(op.t))                                      return 'lose'; // above one_two
    return 'tie'; // one_two, points, zero → rematch
  }
  if (op.t==='warden') {
    if (TOP.includes(my.t))                                           return 'win';
    if (my.t==='pair')                                                return 'win';
    if (ABOVE_ONE_TWO.has(my.t))                                      return 'win';
    return 'tie';
  }

  // ── Standard comparison ───────────────────────────────────
  return ord(my.r, op.r);
}

function cmp5(my, op) { return ord(my.r, op.r); }

// ── Odds engine ───────────────────────────────────────────────────────────────
let cache = {};
function bustCache() { cache = {}; }
let testStatus = { ok: true, count: 0, failed: [] };

function cardKey(c) { return `${c.n}:${c.col}`; }

function removeKnownCards(deck, knownCards) {
  const remaining = [];
  const used = new Map();
  knownCards.forEach(c => {
    if (!c || !c.n || !c.col) return;
    const k = cardKey(c);
    used.set(k, (used.get(k) || 0) + 1);
  });
  deck.forEach(c => {
    const k = cardKey(c);
    const left = used.get(k) || 0;
    if (left > 0) {
      used.set(k, left - 1);
      return;
    }
    remaining.push(c);
  });
  return remaining;
}

function serializeCards(cards) {
  return cards
    .filter(c => c && c.n && c.col)
    .map(c => `${c.n}${c.col[0]}`)
    .sort()
    .join(',');
}

function handSortRank(h) {
  if (!h) return -1;
  if (h.t === 'prime_pair') return 200;
  if (h.t === 'superior_pair') return 190;
  if (h.t === 'ten_pair') return 180;
  if (h.t === 'high_warden') return 175;
  if (h.t === 'executor') return 170;
  if (h.t === 'pair') return 100 + h.num;
  if (h.t === 'judge') return 95;
  if (h.t === 'warden') return 94;
  return h.r;
}

function handSortRank5(h) {
  if (!h) return -1;
  if (h.t === 'ten_pair') return 290;
  if (h.t === 'pair') return 200 + h.num;
  if (h.t === 'perfect_nine') return 190;
  return h.r;
}

function detailHandName(entry) {
  if (entry.bust) return S.lang === 'fr' ? 'Échec' : 'Bust';
  return handName(entry.hand);
}

function forEachCombination(items, size, fn, start = 0, combo = []) {
  if (combo.length === size) {
    fn(combo.slice());
    return;
  }
  for (let i = start; i <= items.length - (size - combo.length); i++) {
    combo.push(items[i]);
    forEachCombination(items, size, fn, i + 1, combo);
    combo.pop();
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function available() {
  const used = [];
  if (S.c1.n&&S.c1.col) used.push(S.c1);
  if (S.c2.n&&S.c2.col) used.push(S.c2);
  S.opps.forEach(o => {
    if (o.n&&o.col) used.push({ n:o.n, col:o.col });
  });
  return removeKnownCards(DECK, used);
}

function computeOdds(myH, visOpps) {
  const oppKey = visOpps.map(o => {
    const lead = `${o.n}${o.col[0]}`;
    return S.fedora && o.n2 && o.col2 ? `${lead}-${o.n2}${o.col2[0]}` : lead;
  }).sort().join(',');
  const k = `duo|${S.fedora?'fedora':'normal'}|${serializeCards([S.c1, S.c2])}|${oppKey}`;
  if (cache[k]) return cache[k];

  let perOpp;
  let combo = null;

  if (S.fedora) {
    perOpp = visOpps.map(opp => {
      const oppHidden = { n:opp.n2, col:opp.col2 };
      const oh = evalHand({ n:opp.n, col:opp.col }, oppHidden);
      const res = cmp(myH, oh);
      return {
        w: res === 'win' ? 1 : 0,
        l: res === 'lose' ? 1 : 0,
        ti: res === 'tie' ? 1 : 0,
        tot: 1,
        dtl: [{ card: oppHidden, oh, res }]
      };
    });

    if (visOpps.length >= 2) {
      const results = perOpp.map(r => r.w ? 'win' : r.l ? 'lose' : 'tie');
      combo = {
        w: results.every(r => r === 'win') ? 1 : 0,
        l: results.some(r => r === 'lose') ? 1 : 0,
        ti: !results.some(r => r === 'lose') && !results.every(r => r === 'win') ? 1 : 0,
        tot: 1
      };
    }
  } else {
    const pool = available();
    perOpp = visOpps.map(opp => {
      let w=0,l=0,ti=0; const dtl=[];
      pool.forEach(unk => {
        const oh = evalHand({ n:opp.n, col:opp.col }, unk);
        const res = cmp(myH, oh);
        if (res==='win') w++; else if (res==='lose') l++; else ti++;
        dtl.push({ card:unk, oh, res });
      });
      const tot = pool.length;
      return { w,l,ti,tot,dtl };
    });

    if (visOpps.length >= 2) {
      let cw=0,cl=0,ct=0;
      (function rec(i, res, rem) {
        if (i===visOpps.length) {
          if (res.every(r=>r==='win')) cw++;
          else if (res.some(r=>r==='lose')) cl++;
          else ct++;
          return;
        }
        rem.forEach((unk, idx) => {
          res.push(cmp(myH, evalHand({ n:visOpps[i].n, col:visOpps[i].col }, unk)));
          rec(i+1, res, rem.filter((_, rIdx) => rIdx !== idx));
          res.pop();
        });
      })(0, [], pool);
      let tot = 1;
      for (let i = 0; i < visOpps.length; i++) tot *= (pool.length - i);
      combo = { w:cw, l:cl, ti:ct, tot };
    }
  }

  cache[k] = { perOpp, combo };
  return cache[k];
}

// ── Duplicate detection ───────────────────────────────────────────────────────
function isTaken(num, col, key) {
  const all = [
    {k:'c1',card:S.c1},{k:'c2',card:S.c2},
    ...S.opps.flatMap((o,i) => {
      const cards = [{k:`o${i}a`,card:{ n:o.n, col:o.col }}];
      if (S.fedora) cards.push({k:`o${i}b`,card:{ n:o.n2, col:o.col2 }});
      return cards;
    })
  ];
  return all.some(x => x.k!==key && x.card.n===num && x.card.col===col);
}

function isTaken5(num, col, key) {
  const all = [
    ...S5.cards.map((c,i) => ({k:'c'+i, card:c})),
    ...S5.opps.flatMap((o,i) => {
      if (!S5.fedora) return [{k:`o${i}c0`, card:o.cards[0]}];
      return o.cards.map((card, cardIdx) => ({k:`o${i}c${cardIdx}`, card}));
    })
  ];
  return all.filter(x => x.k!==key && x.card.n===num && x.card.col===col).length >= 2;
}

function available5() {
  const used = [];
  S5.cards.forEach(c => { if (c.n&&c.col) used.push(c); });
  S5.opps.forEach(o => {
    const limit = S5.fedora ? o.cards.length : 1;
    for (let i = 0; i < limit; i++) {
      const card = o.cards[i];
      if (card.n && card.col) used.push(card);
    }
  });
  return removeKnownCards(DECK5, used);
}

function computeOdds5(myH, visOpps) {
  const oppKey = visOpps.map(o => {
    const limit = S5.fedora ? o.cards.length : 1;
    return o.cards.slice(0, limit).filter(c => c.n && c.col).map(c => `${c.n}${c.col[0]}`).join('-');
  }).sort().join(',');
  const k5 = `five|${S5.fedora?'fedora':'normal'}|${serializeCards(S5.cards)}|${oppKey}`;
  if (cache[k5]) return cache[k5];
  let combo = null;
  let perOpp;

  if (S5.fedora) {
    perOpp = visOpps.map(opp => {
      const resolved = evalFiveCardShownHand(opp.cards);
      const res = resolved.bust ? 'win' : cmp5(myH, resolved.hand);
      return {
        w: res === 'win' ? 1 : 0,
        l: res === 'lose' ? 1 : 0,
        ti: res === 'tie' ? 1 : 0,
        tot: 1,
        dtl: [{
          bust: !!resolved.bust,
          hand: resolved.bust ? null : resolved.hand,
          res,
          count: 1
        }]
      };
    });

    if (visOpps.length >= 2) {
      const results = perOpp.map(r => r.w ? 'win' : r.l ? 'lose' : 'tie');
      combo = {
        w: results.every(r => r === 'win') ? 1 : 0,
        l: results.some(r => r === 'lose') ? 1 : 0,
        ti: !results.some(r => r === 'lose') && !results.every(r => r === 'win') ? 1 : 0,
        tot: 1
      };
    }
  } else {
    const pool = available5();
    perOpp = visOpps.map(opp => {
      let w=0,l=0,ti=0, tot=0;
      const dtlMap = new Map();
      forEachCombination(pool, 4, combo => {
        const resolved = evalFiveCardShownHand([opp.cards[0], ...combo]);
        const res = resolved.bust ? 'win' : cmp5(myH, resolved.hand);
        if (res==='win') w++; else if (res==='lose') l++; else ti++;
        tot++;
        const key = resolved.bust
          ? `bust|${res}`
          : `${resolved.hand.t}|${resolved.hand.num ?? ''}|${resolved.hand.sum ?? resolved.hand.r}|${res}`;
        const existing = dtlMap.get(key) || {
          bust: !!resolved.bust,
          hand: resolved.bust ? null : resolved.hand,
          res,
          count: 0
        };
        existing.count++;
        dtlMap.set(key, existing);
      });
      const dtl = [...dtlMap.values()];
      return { w,l,ti,tot,dtl };
    });
    if (visOpps.length >= 2) {
      const trials = 12000;
      let cw=0,cl=0,ct=0;
      for (let t=0; t<trials; t++) {
        const rem = shuffle(pool.slice());
        let offset = 0;
        const res = [];
        for (let i=0; i<visOpps.length; i++) {
          const cards = rem.slice(offset, offset + 4);
          offset += 4;
          const resolved = evalFiveCardShownHand([visOpps[i].cards[0], ...cards]);
          res.push(resolved.bust ? 'win' : cmp5(myH, resolved.hand));
        }
        if (res.every(r=>r==='win')) cw++;
        else if (res.some(r=>r==='lose')) cl++;
        else ct++;
      }
      combo={w:cw,l:cl,ti:ct,tot:trials, simulated:true};
    }
  }
  cache[k5]={perOpp,combo};return cache[k5];
}

// ── i18n helper ───────────────────────────────────────────────────────────────
