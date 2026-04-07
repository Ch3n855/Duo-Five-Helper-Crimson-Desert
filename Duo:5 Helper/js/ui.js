function tx(key, ...subs) {
  let s = LANGS[S.lang][key] || LANGS.en[key] || key;
  subs.forEach(v => { s = s.replace(/\{[^}]+\}/, v); });
  return s;
}

// ── Result colors ─────────────────────────────────────────────────────────────
function rCol(r) { return r==='win'?'var(--c-win)':r==='lose'?'var(--c-lose)':'var(--c-tie)'; }
function rIco(r) { return r==='win'?'✓':r==='lose'?'✗':'='; }

function cardSurfaceStyle(c, opts = {}) {
  const muted = !!opts.muted;
  const accent = !!opts.accent;
  const isR = c.col === 'red';
  const base = isR
    ? 'linear-gradient(135deg, rgba(120,24,24,.34), rgba(70,12,12,.18))'
    : 'linear-gradient(135deg, rgba(120,90,12,.30), rgba(70,50,8,.16))';
  const gloss = 'radial-gradient(circle at top left, rgba(255,255,255,.18), transparent 48%)';
  const edge = accent
    ? 'box-shadow: inset 0 0 0 1px rgba(233,193,118,.65), 0 0 14px rgba(233,193,118,.22);'
    : '';
  const tone = muted ? 'opacity:.42;filter:grayscale(.25);' : '';
  return `${base}, ${gloss};${edge}${tone}`;
}

function handBehaviorNote(h, mode) {
  if (!h) return '';
  if (mode === 'cinq') return tx('normalHand');
  if (h.t === 'executor') return tx('executorFallback');
  if (h.t === 'judge') return tx('judgeFallback');
  if (h.t === 'warden') return tx('wardenFallback');
  if (h.t === 'high_warden') return tx('highWardenFallback');
  return tx('normalHand');
}

function cardCode(c) {
  if (!c || !c.n || !c.col) return '—';
  return `${c.col === 'red' ? 'R' : (S.lang === 'fr' ? 'J' : 'Y')}${c.n}`;
}

function adviceCardInfo(visOpps) {
  if (!visOpps || !visOpps.length) return '—';
  if (S.mode === 'cinq') {
    if (S5.fedora) return visOpps.map(o => o.cards.map(cardCode).join(' ')).join(' · ');
    return visOpps.map(o => cardCode(o.cards[0])).join(', ');
  }
  if (S.fedora) {
    return visOpps.map(o => `${cardCode({ n:o.n, col:o.col })} + ${cardCode({ n:o.n2, col:o.col2 })}`).join(' · ');
  }
  return visOpps.map(o => cardCode({ n:o.n, col:o.col })).join(', ');
}

function adviceThreshold(score, raising) {
  if (!raising) {
    if (score >= 0.70) return '>= 70%';
    if (score >= 0.55) return '55%–69.9%';
    if (score >= 0.45) return '45%–54.9%';
    return '< 45%';
  }
  if (score >= 0.70) return '>= 70%';
  if (score >= 0.55) return '55%–69.9%';
  if (score >= 0.45) return '45%–54.9%';
  return '< 45%';
}

function renderAdviceCard(data) {
  const why = [
    `<div><strong>${tx('equity')}:</strong> ${(data.score*100).toFixed(1)}%</div>`,
    `<div><strong>${tx('threshold')}:</strong> ${data.threshold}</div>`,
    `<div><strong>${tx('visibleInfo')}:</strong> ${data.visible}</div>`
  ].join('');
  return `<div class="advice" style="border-left-color:${data.col};background:${data.col}0d">
    <div class="advice-tag" style="color:${data.col}">${tx('recAction')}</div>
    <div class="advice-act" style="color:${data.col}">${data.act}</div>
    <div class="advice-sub" style="color:${data.col}">${data.sub}</div>
    ${data.confidenceTag || ''}
    <div class="advice-note" style="color:var(--c-faint)"><span class="ico" style="font-size:11px">tune</span><span><strong>${tx('why')}:</strong> ${why}</span></div>
    ${data.behavior ? `<div class="advice-note" style="color:var(--c-faint)"><span class="ico" style="font-size:11px">info</span><span><strong>${tx('handBehavior')}:</strong> ${data.behavior}</span></div>` : ''}
    ${data.notes || ''}
  </div>`;
}

function adviceDuo(w, l, tot, raising, myH, visOpps) {
  if (!tot) return '';
  const ti = tot - w - l;
  const wr = w === 0 ? 0 : (w + ti * 0.5) / tot;
  const lr = l / tot;
  let act, sub, col;
  if (!raising) {
    if      (wr>=0.70) { act=tx('allin');    sub=tx('s_allin_f'); col='#4ade80'; }
    else if (wr>=0.55) { act=tx('dblRaise'); sub=tx('s_dbl_f');   col='#a8d44a'; }
    else if (wr>=0.45) { act=tx('halfRaise');sub=tx('s_half_f');  col='#e9c176'; }
    else               { act=tx('check');    sub=tx('s_check');   col='#d4a04a'; }
  } else {
    if      (wr>=0.70) { act=tx('allin');    sub=tx('s_allin_r'); col='#4ade80'; }
    else if (wr>=0.55) { act=tx('dblRaise'); sub=tx('s_dbl_r');   col='#a8d44a'; }
    else if (wr>=0.45) { act=tx('halfRaise');sub=tx('s_half_r');  col='#e9c176'; }
    else if (w===0 && l>0) { act=tx('fold'); sub=tx('s_fold'); col='#f87171'; }
    else if (lr<0.80)  { act=tx('call'); sub=tx('s_call'); col='#e8934a'; }
    else               { act=tx('fold'); sub=tx('s_fold'); col='#f87171'; }
  }

  let notes = '';
  if (!raising && act===tx('check')) {
    notes += `<div class="advice-note" style="color:var(--c-faint)"><span class="ico" style="font-size:11px">tips_and_updates</span>${tx('s_check_bluff')}</div>`;
  }
  if (!S.fedora && visOpps && visOpps.length > 0 && wr < 0.55) {
    const hasDangerCard = visOpps.some(o => o.n===1 || o.n===2 || o.n===10);
    if (hasDangerCard) {
      notes += `<div class="advice-note" style="color:#e9c176"><span class="ico" style="font-size:11px">visibility</span>${tx('s_opp_danger')}</div>`;
    }
  }
  if (myH && myH.t === 'executor') {
    notes += `<div class="advice-note" style="color:var(--c-faint)"><span class="ico" style="font-size:11px">info</span>${tx('s_executor')}</div>`;
  }
  const confidenceTag = (act===tx('allin') && wr < 0.90)
    ? `<div class="advice-tag" style="color:${col};opacity:.5;font-size:8px;margin-top:2px">${tx('allInBorderline')}</div>`
    : '';
  return renderAdviceCard({
    act, sub, col,
    score: wr,
    threshold: adviceThreshold(wr, raising),
    visible: adviceCardInfo(visOpps),
    behavior: handBehaviorNote(myH, 'duo'),
    confidenceTag,
    notes
  });
}

function adviceFive(w, l, tot, raising, myH, visOpps) {
  if (!tot) return '';
  const ti = tot - w - l;
  const wr = w === 0 ? 0 : (w + ti * 0.5) / tot;
  const lr = l / tot;
  let act, sub, col;
  if (!raising) {
    if      (wr>=0.70) { act=tx('allin');    sub=tx('s_allin_f'); col='#4ade80'; }
    else if (wr>=0.55) { act=tx('dblRaise'); sub=tx('s_dbl_f');   col='#a8d44a'; }
    else if (wr>=0.45) { act=tx('halfRaise');sub=tx('s_half_f');  col='#e9c176'; }
    else               { act=tx('check');    sub=tx('s_check');   col='#d4a04a'; }
  } else {
    if      (wr>=0.70) { act=tx('allin');    sub=tx('s_allin_r'); col='#4ade80'; }
    else if (wr>=0.55) { act=tx('dblRaise'); sub=tx('s_dbl_r');   col='#a8d44a'; }
    else if (wr>=0.45) { act=tx('halfRaise');sub=tx('s_half_r');  col='#e9c176'; }
    else if (w===0 && l>0) { act=tx('fold'); sub=tx('s_fold'); col='#f87171'; }
    else if (lr<0.80)  { act=tx('call'); sub=tx('s_call'); col='#e8934a'; }
    else               { act=tx('fold'); sub=tx('s_fold'); col='#f87171'; }
  }
  const confidenceTag = (act===tx('allin') && wr < 0.90)
    ? `<div class="advice-tag" style="color:${col};opacity:.5;font-size:8px;margin-top:2px">${tx('allInBorderline')}</div>`
    : '';
  return renderAdviceCard({
    act, sub, col,
    score: wr,
    threshold: adviceThreshold(wr, raising),
    visible: S5.fedora ? adviceCardInfo(visOpps) : `${adviceCardInfo(visOpps)} · ${tx('f5VisibleNote')}`,
    behavior: handBehaviorNote(myH, 'cinq'),
    confidenceTag,
    notes: ''
  });
}

function renderBarRight(mode) {
  const fedoraOn = mode === 'cinq' ? S5.fedora : S.fedora;
  const resetFn = mode === 'cinq' ? 'resetAll5()' : 'resetAll()';
  return `<div style="display:flex;align-items:center;gap:10px">
    ${mode === 'duo' || mode === 'cinq' ? `<button class="top-pill subtle${fedoraOn?' on':''}" onclick="${mode === 'cinq' ? 'toggleFedora5()' : 'toggleFedora()'}"><span class="ico">visibility</span>${tx('fedoraToggle')}</button>` : ''}
    ${mode !== 'cheat' && mode !== 'fedora' ? `<button class="top-pill subtle" onclick="${resetFn}"><span class="ico">refresh</span>${tx('reset')}</button>` : ''}
    <div class="lang-seg">
      <button class="${S.lang==='en'?'on':''}" onclick="setLang('en')"><span class="flag">🇬🇧</span>EN</button>
      <button class="${S.lang==='fr'?'on':''}" onclick="setLang('fr')"><span class="flag">🇫🇷</span>FR</button>
    </div>
  </div>`;
}

function mediaFrame(src, alt, label, labelCls = '') {
  return `<button class="cheat-gif media-frame" onclick="openMedia('${src}','${alt.replace(/'/g, "\\'")}')" aria-label="${tx('clickZoom')}">
    <img src="${src}" alt="${alt}" />
    <div class="cheat-gif-label ${labelCls}">${label}</div>
  </button>`;
}

function renderMediaViewer() {
  if (!S.media) return '';
  return `<div class="media-overlay" onclick="closeMedia()">
    <div class="media-panel" onclick="event.stopPropagation()">
      <button class="rules-close media-close" onclick="closeMedia()" aria-label="${tx('close')}"><span class="ico">close</span></button>
      <div class="media-caption">${S.media.alt}</div>
      <img class="media-image" src="${S.media.src}" alt="${S.media.alt}" />
    </div>
  </div>`;
}

// ── Card chip (V2 — with card image background) ───────────────────────────────
function chip(c, lbl) {
  const ok=c.n&&c.col, isR=c.col==='red';
  const colCls = ok&&isR?' r':ok?' y':'';
  const nc = ok?(isR?'#e07070':'#d4b84a'):'var(--c-faint)';
  const pfx = isR?'R':(S.lang==='fr'?'J':'Y');
  if (ok) {
    return `<div class="chip${colCls} filled" style="background:${cardSurfaceStyle(c)}">
      <span class="chip-corner">${pfx}</span>
      <span class="chip-n" style="color:${nc}">${c.n}</span>
      <span class="chip-c" style="color:${nc}">${tx(isR?'red':'yellow')}</span>
    </div>`;
  }
  return `<div class="chip"><span class="chip-e">${lbl}</span></div>`;
}

// ── Card selector (Duo hand + all opponents) ──────────────────────────────────
function selector(c, key, lbl, isOpp, idx, opts = {}) {
  const filled = c.n && c.col;
  const isR = c.col === 'red';
  const pfx = isR ? 'R' : (S.lang==='fr'?'J':'Y');
  const numCls = filled ? (isR ? 'done-r' : 'done-y') : '';
  const panelCls = filled ? (isR ? 'filled-r' : 'filled-y') : '';
  const valLabel = filled ? `<span class="cslot5-val">${pfx}${c.n}</span>` : '';

  // Slot number: c1→1, c2→2, o0→1, o1→2, o2→3
  const slotNum = opts.slotNum ?? (key==='c1'?1 : key==='c2'?2 : (parseInt(key.slice(1), 10)+1));

  let foldBtn = '';
  if (isOpp && opts.showFold !== false) {
    const isFolded = c.folded;
    const fTxt = isFolded ? tx('unfold') : tx('foldBtn');
    foldBtn = `<button class="fold-btn${isFolded?' folded':''}" onclick="toggleFold(${idx})"><span class="ico">${isFolded?'undo':'block'}</span>${fTxt}</button>`;
  }

  let h = `<div class="cslot5 ${panelCls}">
    <div class="cslot5-hd">
      <span class="cslot5-num ${numCls}">${slotNum}</span>
      <span class="cslot5-lbl">${lbl}</span>
      ${valLabel}
      ${foldBtn}
    </div>
    <div style="${(isOpp&&c.folded)?'opacity:0.4;pointer-events:none;':''}">`;

  // Red row
  h += `<div class="card-row">`;
  for (let i=1;i<=10;i++) {
    const on = c.n===i && c.col==='red';
    const taken = !on && isTaken(i,'red',key);
    h += `<button class="crb r${on?' sel':''}${taken?' taken':''}" ${taken?'':`onclick="pickCard('${key}',${i},'red')"`}>${i}</button>`;
  }
  h += `</div>`;
  // Yellow row
  h += `<div class="card-row">`;
  for (let i=1;i<=10;i++) {
    const on = c.n===i && c.col==='yellow';
    const taken = !on && isTaken(i,'yellow',key);
    h += `<button class="crb y${on?' sel':''}${taken?' taken':''}" ${taken?'':`onclick="pickCard('${key}',${i},'yellow')"`}>${i}</button>`;
  }
  h += `</div></div></div>`;
  return h;
}

// ── Five-Card selector ────────────────────────────────────────────────────────
function selector5(c, key, lbl, isOpp, idx, opts = {}) {
  // ── Opponent slots: same panel layout ──
  if (isOpp) {
    const filled = c.n && c.col;
    const isR = c.col === 'red';
    const pfx = isR ? 'R' : (S.lang==='fr'?'J':'Y');
    const numCls = filled ? (isR ? 'done-r' : 'done-y') : '';
    const panelCls = filled ? (isR ? 'filled-r' : 'filled-y') : '';
    const valLabel = filled ? `<span class="cslot5-val">${pfx}${c.n}</span>` : '';
    const slotNum = opts.slotNum ?? (idx + 1);
    const isFolded = c.folded;
    const fTxt = isFolded ? tx('unfold') : tx('foldBtn');
    const foldBtn = opts.showFold === false ? '' : `<button class="fold-btn${isFolded?' folded':''}" onclick="toggleFold5(${idx})"><span class="ico">${isFolded?'undo':'block'}</span>${fTxt}</button>`;

    let h = `<div class="cslot5 ${panelCls}">
      <div class="cslot5-hd">
        <span class="cslot5-num ${numCls}">${slotNum}</span>
        <span class="cslot5-lbl">${lbl}</span>
        ${valLabel}
        ${foldBtn}
      </div>
      <div style="${isFolded?'opacity:0.4;pointer-events:none;':''}">`;
    h += `<div class="card-row">`;
    for (let i=1;i<=10;i++) {
      const on = c.n===i && c.col==='red';
      const taken = !on && isTaken5(i,'red',key);
      h += `<button class="crb r${on?' sel':''}${taken?' taken':''}" ${taken?'':`onclick="pickCard5('${key}',${i},'red')"`}>${i}</button>`;
    }
    h += `</div><div class="card-row">`;
    for (let i=1;i<=10;i++) {
      const on = c.n===i && c.col==='yellow';
      const taken = !on && isTaken5(i,'yellow',key);
      h += `<button class="crb y${on?' sel':''}${taken?' taken':''}" ${taken?'':`onclick="pickCard5('${key}',${i},'yellow')"`}>${i}</button>`;
    }
    h += `</div></div></div>`;
    return h;
  }

  // ── My Hand slots: distinct bordered panel per card ──
  const filled = c.n && c.col;
  const isR = c.col === 'red';
  const slotNum = opts.slotNum ?? (parseInt(key.slice(1), 10) + 1); // c0→1, c1→2 …
  const numCls = filled ? (isR ? 'done-r' : 'done-y') : '';
  const panelCls = filled ? (isR ? 'filled-r' : 'filled-y') : '';
  const pfx = isR ? 'R' : (S.lang==='fr'?'J':'Y');
  const valLabel = filled ? `<span class="cslot5-val">${pfx}${c.n}</span>` : '';

  let h = `<div class="cslot5 ${panelCls}">
    <div class="cslot5-hd">
      <span class="cslot5-num ${numCls}">${slotNum}</span>
      <span class="cslot5-lbl">${lbl}</span>
      ${valLabel}
    </div>`;
  h += `<div class="card-row">`;
  for (let i=1;i<=10;i++) {
    const on = c.n===i && c.col==='red';
    const taken = !on && isTaken5(i,'red',key);
    h += `<button class="crb r${on?' sel':''}${taken?' taken':''}" ${taken?'':`onclick="pickCard5('${key}',${i},'red')"`}>${i}</button>`;
  }
  h += `</div><div class="card-row">`;
  for (let i=1;i<=10;i++) {
    const on = c.n===i && c.col==='yellow';
    const taken = !on && isTaken5(i,'yellow',key);
    h += `<button class="crb y${on?' sel':''}${taken?' taken':''}" ${taken?'':`onclick="pickCard5('${key}',${i},'yellow')"`}>${i}</button>`;
  }
  h += `</div></div>`;
  return h;
}

function cardRowsHTML(c, key, pickFn, takenFn) {
  let h = `<div class="card-row">`;
  for (let i=1;i<=10;i++) {
    const on = c.n===i && c.col==='red';
    const taken = !on && takenFn(i,'red',key);
    h += `<button class="crb r${on?' sel':''}${taken?' taken':''}" ${taken?'':`onclick="${pickFn}('${key}',${i},'red')"`}>${i}</button>`;
  }
  h += `</div><div class="card-row">`;
  for (let i=1;i<=10;i++) {
    const on = c.n===i && c.col==='yellow';
    const taken = !on && takenFn(i,'yellow',key);
    h += `<button class="crb y${on?' sel':''}${taken?' taken':''}" ${taken?'':`onclick="${pickFn}('${key}',${i},'yellow')"`}>${i}</button>`;
  }
  h += `</div>`;
  return h;
}

function slotMini(c, key, lbl, pickFn, takenFn, opts = {}) {
  const filledCls = !c || !c.n || !c.col ? '' : (c.col === 'red' ? ' filled-r' : ' filled-y');
  const markCls = opts.mark ? ` ${opts.mark}` : '';
  const tag = opts.tag ? `<span class="slot-mini-tag ${opts.mark || ''}">${opts.tag}</span>` : '';
  return `<div class="slot-mini${filledCls}${markCls}">
    <div class="slot-mini-hd">
      <span class="slot-mini-title">${lbl}${tag}</span>
      <span class="slot-mini-val">${cardCode(c)}</span>
    </div>
    ${cardRowsHTML(c, key, pickFn, takenFn)}
  </div>`;
}

function duoHandCase(a, b, opts = {}) {
  const title = opts.title || tx('myHand');
  const foldBtn = opts.foldBtn || '';
  return `<div class="cslot5">
    <div class="cslot5-hd">
      <span class="cslot5-lbl" style="margin-left:0">${title}</span>
      ${foldBtn}
    </div>
    ${opts.summary || ''}
    <div class="multi-slot slot-grid-2${opts.folded?' is-folded':''}" style="${opts.folded?'opacity:0.4;pointer-events:none;':''}">
      ${slotMini(a, opts.keyA, tx('c1'), 'pickCard', isTaken)}
      ${slotMini(b, opts.keyB, tx('c2'), 'pickCard', isTaken)}
    </div>
  </div>`;
}

function fiveHandCase(cards, idx, opts = {}) {
  const labels = S.lang === 'fr'
    ? ['Carte 1','Carte 2','Carte 3','Carte 4','Carte 5']
    : ['Card 1','Card 2','Card 3','Card 4','Card 5'];
  const foldBtn = opts.foldBtn || '';
  const baseIdxs = new Set(opts.baseIdxs || []);
  const handIdxs = new Set(opts.handIdxs || []);
  const keyPrefix = opts.keyPrefix || `o${idx}c`;
  const tagFor = cardIdx => {
    if (handIdxs.has(cardIdx)) return { mark:'hand', tag:'HAND' };
    if (baseIdxs.has(cardIdx)) return { mark:'base', tag:'BASE' };
    return {};
  };
  return `<div class="cslot5">
    <div class="cslot5-hd">
      <span class="cslot5-lbl" style="margin-left:0">${opts.title || tx('fedoraOpponent', idx + 1)}</span>
      ${foldBtn}
    </div>
    ${opts.summary || ''}
    <div class="multi-slot slot-grid-5cards" style="${opts.folded?'opacity:0.4;pointer-events:none;':''}">
      ${cards.map((card, cardIdx) => slotMini(card, `${keyPrefix}${cardIdx}`, labels[cardIdx], 'pickCard5', isTaken5, tagFor(cardIdx))).join('')}
    </div>
  </div>`;
}

function duoOpponentSelector(o, idx) {
  const foldBtn = `<button class="fold-btn${o.folded?' folded':''}" onclick="toggleFold(${idx})"><span class="ico">${o.folded?'undo':'block'}</span>${o.folded?tx('unfold'):tx('foldBtn')}</button>`;
  if (!S.fedora) {
    return selector(o, `o${idx}a`, tx('oppCard', idx + 1), true, idx, { slotNum:1, showFold:true });
  }
  const summary = o.n && o.col && o.n2 && o.col2
    ? `<div class="hand-pill-inline compact flush">${handName(evalHand({n:o.n,col:o.col},{n:o.n2,col:o.col2}))}</div>`
    : '';
  return duoHandCase(
    { n:o.n, col:o.col, folded:o.folded },
    { n:o.n2, col:o.col2, folded:o.folded },
    { title: tx('fedoraOpponent', idx + 1), keyA:`o${idx}a`, keyB:`o${idx}b`, foldBtn, folded:o.folded, summary }
  );
}

function fiveOpponentSelector(o, idx) {
  if (!S5.fedora) {
    return selector5({ ...o.cards[0], folded:o.folded }, `o${idx}c0`, tx('oppCard', idx + 1), true, idx, { slotNum:1, showFold:true });
  }
  const foldBtn = `<button class="fold-btn${o.folded?' folded':''}" onclick="toggleFold5(${idx})"><span class="ico">${o.folded?'undo':'block'}</span>${o.folded?tx('unfold'):tx('foldBtn')}</button>`;
  const resolved = o.cards.every(card => card.n && card.col) ? evalFiveCardHand(o.cards) : null;
  const baseIdxs = [];
  const handIdxs = [];
  if (resolved && !resolved.bust && resolved.base) {
    o.cards.forEach((card, cardIdx) => {
      if (resolved.base.includes(card)) baseIdxs.push(cardIdx);
      else handIdxs.push(cardIdx);
    });
  }
  return fiveHandCase(o.cards, idx, {
    title: tx('fedoraOpponent', idx + 1),
    foldBtn,
    folded:o.folded,
    baseIdxs,
    handIdxs,
    summary: resolved ? (() => {
      if (resolved.bust) return `<div class="hand-pill-inline compact flush" style="background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.35);color:#f87171">${S.lang==='fr'?'Échec — Défaite automatique':'Bust — Automatic loss'}</div>`;
      const baseStr = resolved.base.map(b=>(b.col==='red'?'R':(S.lang==='fr'?'J':'Y'))+b.n).join('+');
      const baseSum = resolved.base.reduce((s,b)=>s+b.n,0);
      return `<div class="hand-pill-inline compact flush">${handName(resolved.hand)}</div><div class="opp-meta"><strong>${S.lang==='fr'?'Base :':'Base:'}</strong> ${baseStr} = ${baseSum}</div>`;
    })() : ''
  });
}

// ── Odds bar ──────────────────────────────────────────────────────────────────
function obar(w,l,ti,tot) {
  if (!tot) return '';
  const wp=pct(w,tot), lp=pct(l,tot), tp=pct(ti,tot);
  return `<div class="obar">
    ${w>0?`<div class="ow" style="width:${wp}%"></div>`:''}
    ${ti>0?`<div class="ot" style="width:${tp}%"></div>`:''}
    ${l>0?`<div class="ol" style="width:${lp}%"></div>`:''}
  </div>
  <div class="oleg">
    <span style="color:var(--c-win)">${tx('win')} ${wp}%</span>
    <span style="color:var(--c-tie)">${tx('tie')} ${tp}%</span>
    <span style="color:var(--c-lose)">${tx('lose')} ${lp}%</span>
  </div>`;
}

// ── Stacked bar (center) ──────────────────────────────────────────────────────
function sbar(w,l,ti,tot) {
  if (!tot) return '';
  const wp=pct(w,tot), lp=pct(l,tot), tp=pct(ti,tot);
  return `<div class="sbar">
    ${w>0?`<div class="sw" style="width:${wp}%"></div>`:''}
    ${ti>0?`<div class="st" style="width:${tp}%"></div>`:''}
    ${l>0?`<div class="sl" style="width:${lp}%"></div>`:''}
  </div>
  <div class="sleg">
    <span style="color:var(--c-win)">${tx('win')} ${wp}%</span>
    <span style="color:var(--c-tie)">${tx('tie')} ${tp}%</span>
    <span style="color:var(--c-lose)">${tx('lose')} ${lp}%</span>
  </div>`;
}

function pct(v, t) { return ((v/t)*100).toFixed(1); }

// ── Advice ────────────────────────────────────────────────────────────────────
function advice(w, l, tot, raising, myH, visOpps) {
  return S.mode === 'cinq'
    ? adviceFive(w, l, tot, raising, myH, visOpps)
    : adviceDuo(w, l, tot, raising, myH, visOpps);
}

// ── Threat badge ──────────────────────────────────────────────────────────────
function threat(c, isTakenFn) {
  if (!c.n||!c.col) return '';
  const isR=c.col==='red', n=c.n;

  // Helper: is a specific card still available in the deck?
  const avail = (num, col) => !isTakenFn(num, col, '##threat##');

  let lbl,dtl,col2,ico;
  if (isR&&(n===1||n===3||n===8)) {
    // Can form Prime Pair (needs R3+R8) or Superior Pair (needs R1+R3 or R1+R8)
    const combos=[];
    if((n===3||n===8) && avail(n===3?8:3,'red')) combos.push('Prime Pair');
    if(n===3||n===8) { if(avail(1,'red')) combos.push('Superior Pair'); }
    else             { if(avail(3,'red')||avail(8,'red')) combos.push('Superior Pair'); }
    if(combos.length===0){ lbl=tx('tLow'); dtl=tx('tLowDtl'); col2='#4ade80'; ico='check_circle'; }
    else { lbl=tx('tkwHigh'); dtl=tx('tkwDtl',combos.join(' / ')); col2='#f87171'; ico='warning'; }
  } else if (isR&&n===4) {
    // Can form High Warden (needs R9), Executor (needs R7), Warden (needs any 9)
    const dangers=[];
    if(avail(9,'red'))    dangers.push('High Warden');
    if(avail(7,'red'))    dangers.push('Executor');
    if(avail(9,'yellow')) dangers.push('Warden');
    if(dangers.length===0){ lbl=tx('tLow'); dtl=tx('tLowDtl'); col2='#4ade80'; ico='check_circle'; }
    else { lbl=tx('tr4High'); dtl=tx('tr4Dtl'); col2='#f87171'; ico='warning'; }
  } else if (n===10) {
    // Can form Ten Pair only if the other 10 is still available
    const otherTenAvail = avail(10, isR?'yellow':'red') || avail(10, isR?'red':'yellow');
    // More precisely: the other colour 10 is available
    const canTenPair = isR ? avail(10,'yellow') : avail(10,'red');
    if(canTenPair){ lbl=tx('t10Med'); dtl=tx('t10Dtl'); col2='#e9c176'; ico='info'; }
    else { lbl=tx('tLow'); dtl=tx('tLowDtl'); col2='#4ade80'; ico='check_circle'; }
  } else if (n===1) {
    lbl=tx('t1Med'); dtl=tx('t1Dtl'); col2='#e9c176'; ico='info';
  } else if (n===9) {
    lbl=tx('t9Med'); dtl=tx('t9Dtl'); col2='#e9c176'; ico='info';
  } else {
    lbl=tx('tLow'); dtl=tx('tLowDtl'); col2='#4ade80'; ico='check_circle';
  }
  return `<div class="threat" style="background:${col2}0d;border:1px solid ${col2}25">
    <span class="ico" style="color:${col2}">${ico}</span>
    <div><div class="threat-ttl" style="color:${col2}">${lbl}</div><div class="threat-txt" style="color:${col2}99">${dtl}</div></div>
  </div>`;
}

// ── Rankings footer (Duo or Five-Card) ────────────────────────────────────────
function rankings() {
  const open = S.mode==='cinq' ? S5.showRanks5 : S.showRanks;
  const isDuo = S.mode!=='cinq';
  const title = S.mode==='cinq' ? tx('fiveRankings') : tx('duoRankings');
  const toggleFn = S.mode==='cinq' ? 'toggleRanks5()' : 'toggleRanks()';
  const n = k => HAND_NAMES[S.lang][k]||k;
  const fr = S.lang==='fr';
  const row = (num,name,combo,tag,tagCls) =>
    `<div class="rank-row"><div class="rank-badge-n" style="background:${tagCls==='tag-r'?'rgba(154,3,30,.2)':tagCls==='tag-g'?'rgba(233,193,118,.15)':'rgba(255,255,255,.06)'};color:${tagCls==='tag-r'?'#e07070':tagCls==='tag-g'?'var(--c-gold)':'var(--c-faint)'}">${num}</div><div style="flex:1;min-width:0"><div class="rank-name">${name}</div><div class="rank-combo">${combo}</div></div>${tag?`<span class="tag ${tagCls}">${tag}</span>`:''}</div>`;

  let body = '';
  if (isDuo) {
    const bullet = (lbl, txt) => `<div style="display:flex;gap:6px;margin-bottom:5px"><span style="color:var(--c-gold);font-weight:600;flex-shrink:0">${lbl}</span><span style="color:var(--c-muted);font-size:11px;line-height:1.5">${txt}</span></div>`;
    // Duo hand rankings
    body = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div>
      <div class="rank-sec">${tx('sCol')}</div>
      <div class="rank-grid" style="grid-template-columns:1fr 1fr">
        ${row('S',n('prime_pair'),'R3+R8',tx('nUnbeat'),'tag-r')}
        ${row('S',n('superior_pair'),'R1+R3 / R1+R8',fr?'2e plus forte':'2nd strongest','tag-r')}
        ${row('S',n('high_warden'),'R4+R9',tx('nRematch9'),'tag-r')}
        ${row('S',n('executor'),'R4+R7',tx('nExec'),'tag-r')}
      </div>
      <div class="rank-sec">${tx('sAny')}</div>
      <div class="rank-grid" style="grid-template-columns:1fr 1fr">
        ${row('S',n('ten_pair'),'10+10',tx('nAllStd'),'tag-g')}
        ${row('S',n('judge'),'3+7',tx('nPairs'),'tag-g')}
        ${row('S',n('warden'),'4+9',tx('nRematch2'),'tag-g')}
      </div>
      <div class="rank-sec">${tx('sRank')}</div>
      <div class="rank-grid" style="grid-template-columns:1fr 1fr">
        ${row('1',n('ten_pair'),'10+10',tx('nAllStd'),'')}
        ${row('2',fr?'Paires 9→1':'Pairs 9→1',fr?'Plus haute gagne':'Higher wins','','')}
        ${row('3',n('one_two'),'1+2','','')}
        ${row('4',n('one_four'),'1+4','','')}
        ${row('5',n('one_nine'),'1+9','','')}
        ${row('6',n('one_ten'),'1+10','','')}
        ${row('7',n('four_ten'),'4+10','','')}
        ${row('8',n('four_six'),'4+6','','')}
        ${row('9',n('perfect_nine'),fr?'Somme finit en 9':'Sum ends 9','','')}
        ${row('10',fr?'Points 8→1':'Points 8→1',fr?'Dernier chiffre':'Last digit','','')}
        ${row('11',n('zero'),fr?'Somme finit en 0':'Sum ends 0','','')}
      </div>
    </div>
    <div>
      <div class="rank-sec" style="margin-top:0">${tx('duoRulesTitle')}</div>
      <p style="font-size:11px;color:var(--c-muted);line-height:1.6;margin-bottom:10px">${tx('duoAbout')}</p>
      <div style="font-size:9px;font-weight:700;color:var(--c-gold);text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px">${tx('duoBets')}</div>
      ${[tx('duoBet1'),tx('duoBet2'),tx('duoBet3'),tx('duoBet4'),tx('duoBet5'),tx('duoBet6')].map(s=>bullet('•',s)).join('')}
      <p style="font-size:10px;color:var(--c-muted);line-height:1.5;margin-top:8px;margin-bottom:10px">${tx('duoExtra')}</p>
      <div style="font-size:9px;font-weight:700;color:var(--c-gold);text-transform:uppercase;letter-spacing:.14em;margin-bottom:6px">${tx('duoSpecialTitle')}</div>
      ${[tx('duoWarden'),tx('duoHWarden'),tx('duoJudge'),tx('duoExecutor')].map(s=>bullet('→',s)).join('')}
    </div>
    </div>`;
  } else {
    // Five-Card: hand rankings + rules side by side
    const rowDesc = (rank,name,combo,desc,cls) => `<div class="rank-row" style="flex-direction:column;align-items:flex-start;gap:3px;padding:7px 9px">
      <div style="display:flex;align-items:center;gap:7px;width:100%">
        <div class="rank-badge-n" style="background:${cls==='tag-r'?'rgba(154,3,30,.25)':cls==='tag-g'?'rgba(233,193,118,.15)':'rgba(255,255,255,.06)'};color:${cls==='tag-r'?'#e07070':cls==='tag-g'?'var(--c-gold)':'var(--c-faint)'}">${rank}</div>
        <div style="flex:1"><div class="rank-name" style="font-size:11px">${name}</div><div class="rank-combo">${combo}</div></div>
        ${cls?`<span class="tag ${cls}" style="font-size:8px">${cls==='tag-r'?(fr?'Couleur':'Color'):(fr?'Spéciale':'Special')}</span>`:''}
      </div>
      ${desc?`<div style="font-size:10px;color:var(--c-muted);line-height:1.4;padding-left:25px">${desc}</div>`:''}
    </div>`;

    const bullet = (lbl,txt) => `<div style="display:flex;gap:6px;margin-bottom:5px"><span style="font-size:11px;font-weight:600;color:var(--c-gold);flex-shrink:0">${lbl}</span><span style="font-size:11px;color:var(--c-muted);line-height:1.5">${txt}</span></div>`;
    const sec = (t,c) => `<div style="margin-bottom:14px"><div style="font-size:9px;font-weight:700;color:var(--c-gold);text-transform:uppercase;letter-spacing:.14em;margin-bottom:7px;padding-bottom:4px;border-bottom:1px solid var(--c-border)">${t}</div>${c}</div>`;

    body = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        ${sec(fr?'Combinaisons Standard':'Standard Combinations',
          rowDesc('1',fr?'Paire supérieure':'Superior Pair', 'R1 + R3 / R1 + R8', fr?'Exception documentée : la seule main qui bat la Paire de dix.':'Documented exception: the only hand that beats Ten Pair.','tag-r')+
          rowDesc('2',n('ten_pair'),'10 + 10', fr?'Bat toutes les autres mains sauf la Paire supérieure.':'Beats every other hand except Superior Pair.','')+
          rowDesc('3',fr?'Paires 9→1':'Pairs 9→1', fr?'Toute paire identique':'Any matching pair', fr?'Plus élevée gagne.':'Higher pair wins.','')+
          rowDesc('4',n('perfect_nine'),fr?'Somme = 9':'Sum = 9', fr?'Main la plus forte après les Paires.':'Strongest hand after Pairs.','')+
          rowDesc('5',fr?'Points 8→1':'Points 8→1', fr?'Chiffre des unités de la somme':'Units digit of the total sum', fr?'Le plus élevé gagne.':'Highest wins.','')+
          rowDesc('6',n('zero'),fr?'Somme = 0':'Sum = 0', fr?'Hors mains supérieures.':'Outside higher-ranked hands.','')+
          rowDesc('7',fr?'Échec':'Bust', fr?'Aucune combo 10/20/30':'No valid 10/20/30', fr?'Défaite automatique.':'Automatic loss.','')
        )}
      </div>
      <div>
        ${sec(tx('r5about'), `<p style="font-size:11px;color:var(--c-muted);line-height:1.6;margin-bottom:6px">${tx('r5about1')}</p><p style="font-size:11px;color:var(--c-muted);line-height:1.6">${tx('r5about2')}</p>`)}
        ${sec(tx('r5how'),
          [tx('r5how1'),tx('r5how2'),tx('r5how3')].map((s,i)=>`<div style="display:flex;gap:8px;margin-bottom:6px;align-items:flex-start"><span style="width:17px;height:17px;border-radius:50%;background:var(--c-red-dim);border:1px solid var(--c-red-line);color:#e07070;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">${i+1}</span><span style="font-size:11px;color:var(--c-muted);line-height:1.5">${s}</span></div>`).join('')
        )}
        ${sec(tx('r5bets'), [tx('r5b1'),tx('r5b2'),tx('r5b3'),tx('r5b4'),tx('r5b5'),tx('r5b6')].map(s=>bullet('•',s)).join(''))}
        ${sec(fr?'Règles supplémentaires':'Additional Rules',
          bullet('•', fr?'Les mains sont révélées lorsqu’il n’est plus possible de relancer ou que tous les joueurs ont misé la même somme.':'Hands are revealed when betting cannot increase further or all players have matched the same amount.') +
          bullet('•', fr?'Si vous dépassez 10 secondes, l’option Suivre est choisie automatiquement.':'If you exceed 10 seconds, Call is selected automatically.') +
          bullet('•', fr?'Si vos pièces passent sous la mise de départ, vous ne pouvez plus participer.':'If your funds fall below the buy-in, you cannot continue playing.')
        )}
        ${sec(tx('r5tips'), [tx('r5t1'),tx('r5t2'),tx('r5t3')].map((s,i)=>bullet(['🐾','🔄','👁️'][i],s)).join(''))}
      </div>
    </div>`;
  }

  return `
    <button class="rules-fab" onclick="${toggleFn}">
      <span class="ico">help</span>${tx('rulesBtn')}
    </button>
    ${open ? `<div class="rules-overlay" onclick="${toggleFn}">
      <div class="rules-panel" onclick="event.stopPropagation()">
        <div class="rules-panel-hd">
          <span class="col-ttl"><span class="ico">format_list_numbered</span>${title}</span>
          <button class="rules-close" onclick="${toggleFn}" aria-label="${tx('close')}"><span class="ico">close</span></button>
        </div>
        <div class="rank-body open" style="display:block;padding-top:14px">${body}</div>
      </div>
    </div>` : ''}`;
}

// ── Render ────────────────────────────────────────────────────────────────────
