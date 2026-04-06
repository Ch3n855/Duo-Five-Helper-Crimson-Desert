function render() {
  // Save scroll positions before re-rendering
  const scrollL = document.querySelector('.col-l')?.scrollTop || 0;
  const scrollR = document.querySelector('.col-r')?.scrollTop || 0;
  const scrollC = document.querySelector('.col-c')?.scrollTop || 0;

  function restoreScroll() {
    requestAnimationFrame(() => {
      const l = document.querySelector('.col-l'); if(l) l.scrollTop = scrollL;
      const r = document.querySelector('.col-r'); if(r) r.scrollTop = scrollR;
      const c = document.querySelector('.col-c'); if(c) c.scrollTop = scrollC;
    });
  }

  // My hand
  const myFull = S.c1.n&&S.c1.col&&S.c2.n&&S.c2.col;
  const myH = myFull ? evalHand(S.c1,S.c2) : null;
  const anyMy = S.c1.n||S.c1.col||S.c2.n||S.c2.col;
  const missing = [];
  if (!S.c1.n||!S.c1.col) missing.push(tx('c1'));
  if (!S.c2.n||!S.c2.col) missing.push(tx('c2'));

  const leftHTML = `<div class="col col-l">
    <div class="col-hd"><span class="col-ttl"><span class="ico">style</span>${tx('myHand')}</span></div>
    <div class="col-bd">
      <div class="chips">${chip(S.c1,tx('c1'))}${chip(S.c2,tx('c2'))}</div>
      ${!anyMy?`<div class="hint" style="margin-bottom:10px">${tx('selectYours')}</div>`:''}
      ${selector(S.c1,'c1',tx('c1'), false)}
      ${selector(S.c2,'c2',tx('c2'), false)}
      ${myH?`<div class="hand-pill-inline">${handName(myH)}</div><div class="hint" style="text-align:left"><strong>${tx('handBehavior')}:</strong> ${handBehaviorNote(myH,'duo')}</div>`:anyMy&&missing.length?`<div class="hint">${tx('selectMissing',missing.join(' & '))}</div>`:''}
    </div>
  </div>`;

  // Opponents
  const validOpps = S.opps.filter(o=>o.n&&o.col&&!o.folded);
  const anyUnfoldedOpps = S.opps.filter(o=>!o.folded);
  
  // ── Five-Card / Cinq-Cartes mode — full calculator ──
  if (S.mode === 'cinq') {
    document.getElementById('tab-cinq').textContent = S.lang==='fr' ? 'Cinq-Cartes' : 'Five-Card';
    document.getElementById('tab-duo').className = 'mode-tab';
    document.getElementById('tab-cinq').className = 'mode-tab on';
    document.getElementById('tab-cheat').className = 'mode-tab';

    const filledCount = S5.cards.filter(c=>c.n&&c.col).length;
    const result5 = filledCount===5 ? evalFiveCardHand(S5.cards) : null;
    const myH5 = result5&&!result5.bust ? result5.hand : null;
    const validOpps5 = S5.opps.filter(o=>o.n&&o.col&&!o.folded);
    const anyUnfolded5 = S5.opps.filter(o=>!o.folded);

    // ── Left: My Hand (5 cards) ──────────────────────────────
    const chips5 = S5.cards.map((c,i) => {
      const ok=c.n&&c.col, isR=c.col==='red';
      const isBase = result5&&!result5.bust&&result5.base.some(b=>b===c);
      const isHandCard = result5&&!result5.bust&&!isBase&&ok;
      const nc = ok?(isR?'#e07070':'#d4b84a'):'var(--c-faint)';
      const pfx = isR?'R':(S.lang==='fr'?'J':'Y');
      if (ok) {
        const extraStyle = isBase?'opacity:.38;filter:grayscale(.4);':isHandCard?'box-shadow:0 0 12px rgba(233,193,118,.35);':'' ;
        const borderStyle = isHandCard?'border-color:rgba(233,193,118,.7);':'';
        return `<div class="chip${isR?' r':' y'} filled" style="background:${cardSurfaceStyle(c,{muted:isBase,accent:isHandCard})};flex:1;min-height:68px;${extraStyle}${borderStyle}">
          <span class="chip-corner">${pfx}</span>
          <span class="chip-n" style="color:${nc};font-size:22px">${c.n}</span>
          <span class="chip-c" style="color:${nc};font-size:8px">${tx(isR?'red':'yellow')}</span>
          ${isBase?`<span style="position:absolute;bottom:3px;font-size:7px;color:var(--c-faint);letter-spacing:.05em;text-transform:uppercase">BASE</span>`:''}
          ${isHandCard?`<span style="position:absolute;bottom:3px;font-size:7px;color:var(--c-gold);letter-spacing:.05em;text-transform:uppercase;font-weight:700">HAND</span>`:''}
        </div>`;
      }
      return `<div class="chip" style="flex:1;min-height:68px"><span class="chip-e" style="font-size:9px">${S.lang==='fr'?'C':'C'}${i+1}</span></div>`;
    }).join('');

    const labels5 = S.lang==='fr'
      ? ['Carte 1','Carte 2','Carte 3','Carte 4','Carte 5']
      : ['Card 1','Card 2','Card 3','Card 4','Card 5'];
    let selectors5 = '';
    S5.cards.forEach((c,i) => {
      selectors5 += selector5(c,'c'+i,labels5[i],false);
    });

    let resultBadge = '';
    if (result5) {
      if (result5.bust) {
        resultBadge = `<div class="hand-pill-inline" style="background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.35);color:#f87171">⚠ ${S.lang==='fr'?'Échec — Défaite automatique':'Bust — Automatic loss'}</div>`;
      } else {
        const baseStr = result5.base.map(b=>(b.col==='red'?'R':(S.lang==='fr'?'J':'Y'))+b.n).join('+');
        const baseSum = result5.base.reduce((s,b)=>s+b.n,0);
        resultBadge = `<div class="hand-pill-inline">${handName(result5.hand)}</div>
          <div class="hint" style="text-align:left"><strong>${tx('handBehavior')}:</strong> ${handBehaviorNote(result5.hand,'cinq')}</div>
          <div style="font-size:10px;color:var(--c-faint);text-align:center;margin-top:4px;letter-spacing:.05em">
            ${S.lang==='fr'?'Base :':'Base:'} ${baseStr} = ${baseSum}
          </div>`;
      }
    } else if (filledCount>0) {
      const rem = 5-filledCount;
      resultBadge = `<div class="hint">${S.lang==='fr'?`Sélectionnez ${rem} carte${rem>1?'s':''} de plus`:`Select ${rem} more card${rem>1?'s':''}`}</div>`;
    }

    const left5 = `<div class="col col-l">
      <div class="col-hd"><span class="col-ttl"><span class="ico">style</span>${tx('f5hand')}</span></div>
      <div class="col-bd">
        <div class="chips" style="gap:5px;margin-bottom:12px">${chips5}</div>
        ${!filledCount?`<div class="hint" style="margin-bottom:10px">${S.lang==='fr'?'Sélectionnez vos 5 cartes':'Select your 5 cards'}</div>`:''}
        ${selectors5}
        ${resultBadge}
      </div>
    </div>`;

    // ── Right: Opponents (1 visible card each) ───────────────
    let right5 = `<div class="col col-r">
      <div class="col-hd">
        <span class="col-ttl"><span class="ico">groups</span>${tx('f5opp').split('(')[0].trim()}(s)</span>
        <div class="opp-count-sel"><div class="opp-count-btns">
          ${[1,2,3].map(n=>`<button class="ocb${S5.opps.length===n?' on':''}" onclick="setOppCount5(${n})">${n}</button>`).join('')}
        </div></div>
      </div>
      <div class="col-bd">`;
    S5.opps.forEach((o,i) => {
      if (S5.opps.length > 1) right5 += `<div style="display:flex;justify-content:flex-end;margin-bottom:4px"><button class="opp-cross" onclick="removeOppAt5(${i})"><span class="ico">close</span></button></div>`;
      right5 += selector5(o,'o'+i,tx('oppCard',i+1),true,i);
    });
    if (myH5 && validOpps5.length) {
      const {perOpp:po5} = computeOdds5(myH5, validOpps5);
      right5 += '<div style="margin-top:14px">';
      S5.opps.forEach((o,i) => {
        if (!o.n||!o.col||o.folded) return;
        const r = po5[validOpps5.indexOf(o)];
        right5 += `<div class="res-block">
          ${obar(r.w,r.l,r.ti,r.tot)}
          <button class="dtl-btn" onclick="togDtl5(${i})"><span class="ico">${S5.dtl[i]?'expand_less':'expand_more'}</span>${S5.dtl[i]?tx('hideDtl'):tx('showDtl')}</button>
          ${S5.dtl[i]?`<div class="dtl-scroll"><table class="dtl-tbl">
            <thead><tr><th>${tx('thHand')}</th><th>${tx('thRes')}</th><th>${tx('thChance')}</th></tr></thead>
            <tbody>${[...r.dtl].sort((a,b)=>{const o={lose:0,tie:1,win:2}; return o[a.res]-o[b.res] || handSortRank5(b.hand)-handSortRank5(a.hand) || b.count-a.count;}).map(d=>`<tr>
              <td style="color:var(--c-muted)">${detailHandName(d)}</td>
              <td><span style="color:${rCol(d.res)}">${rIco(d.res)}</span></td>
              <td>${pct(d.count,r.tot)}%</td>
            </tr>`).join('')}</tbody>
          </table></div>`:''}
        </div>`;
      });
      right5 += '</div>';
    }
    right5 += '</div></div>';

    // ── Center: Win % ────────────────────────────────────────
    let center5 = '<div class="col-c"><div class="stage-bg"></div>';
    if (!result5) {
      center5 += `<div class="stage-empty"><span class="ico">playing_cards</span><p>${S.lang==='fr'?'Sélectionnez vos 5 cartes pour commencer':'Select your 5 cards to begin'}</p></div>`;
    } else if (result5.bust) {
      center5 = '<div class="col-c stack"><div class="stage-bg"></div>';
      center5 += `<div class="center-stack"><div class="stage-empty" style="opacity:1"><span class="ico" style="color:#f87171;font-size:54px">block</span><p style="color:#f87171;font-size:15px">${S.lang==='fr'?'Échec — Défaite automatique':'Bust — Automatic loss'}</p></div>
      <div class="acts" style="margin-top:20px">
        <button class="btn-next" onclick="nextTour5()"><span class="ico">skip_next</span>${tx('next')}</button>
      </div></div>`;
    } else if (!anyUnfolded5.length) {
      center5 += `<div class="stage-empty"><span class="ico" style="color:var(--c-win);font-size:54px">emoji_events</span><p style="color:var(--c-win);font-size:16px">${tx('allFolded')}</p></div>`;
    } else if (!validOpps5.length) {
      center5 += `<div class="stage-empty"><span class="ico">person_search</span><p>${tx('f5promptOpp')}</p></div>`;
    } else {
      center5 = '<div class="col-c stack"><div class="stage-bg"></div>';
      const {perOpp:po5c,combo:combo5} = computeOdds5(myH5, validOpps5);
      const src5 = combo5||po5c[0];
      const wr5 = src5.w/src5.tot;
      const wp5 = pct(src5.w,src5.tot);
      const cls5 = wr5>=0.55?'win':wr5>=0.35?'caution':'danger';
      const lbl5 = combo5?tx('f5winVsAll',validOpps5.length):tx('f5winVs');
      center5 += `<div class="center-stack">
        <div class="prob-lbl">${lbl5}</div>
        <div class="prob-num ${cls5}"><span class="n">${wp5}</span><span class="s">%</span></div>
        <div class="sbar-wrap">${sbar(src5.w,src5.l,src5.ti,src5.tot)}</div>
        <div class="sit-wrap">
          <div class="sit-lbl">${tx('f5situation')}</div>
          <div class="sit-seg">
            <button class="${!S5.raising?'on':''}" onclick="setSit5(false)"><span class="ico">flag</span>${tx('first')}</button>
            <button class="${S5.raising?'on':''}" onclick="setSit5(true)"><span class="ico">trending_up</span>${tx('raise')}</button>
          </div>
        </div>
        <div class="advice-wrap">${advice(src5.w,src5.l,src5.tot,S5.raising,myH5,validOpps5)}</div>
        <div class="acts">
          <button class="btn-next" onclick="nextTour5()"><span class="ico">skip_next</span>${tx('next')}</button>
        </div></div>`;
    }
    center5 += '</div>';

    document.getElementById('arena').innerHTML = left5 + center5 + right5 + rankings();
    restoreScroll();
    document.getElementById('bar-right').innerHTML = renderBarRight('cinq');
    return;
  }

  // ── Spot Cheaters mode ────────────────────────────────────
  if (S.mode === 'cheat') {
    const isFr = S.lang === 'fr';
    document.getElementById('tab-duo').className = 'mode-tab';
    document.getElementById('tab-cinq').textContent = isFr ? 'Cinq-Cartes' : 'Five-Card';
    document.getElementById('tab-cinq').className = 'mode-tab';
    document.getElementById('tab-cheat').className = 'mode-tab on';
    document.getElementById('arena').innerHTML = `
      <div class="cheat-page">
        <div class="col-hd">
          <span class="col-ttl"><span class="ico">visibility</span>${tx('cheatTitle')}</span>
          <span style="font-size:10px;color:var(--c-faint);text-transform:uppercase;letter-spacing:.14em">${tx('cheatSubtitle')}</span>
        </div>
        <div class="cheat-scroll">
          <div class="cheat-section-title">${tx('cheatWhenDealing')}</div>
          <div class="cheat-card">
            <div class="cheat-card-text">
              <div class="cheat-card-label normal"><span class="ico">check_circle</span>${tx('cheatNormalLabel')}</div>
              <div class="cheat-card-desc">${tx('cheatNormalDesc')}</div>
            </div>
            <div class="cheat-gif">
              <img src="Images/Normal.gif" alt="Normal dealing" />
              <div class="cheat-gif-label normal">${tx('cheatNormalLabel')}</div>
            </div>
          </div>
          <div class="cheat-divider"></div>
          <div class="cheat-card">
            <div class="cheat-card-text">
              <div class="cheat-card-label cheating"><span class="ico">warning</span>${tx('cheatCheatLabel')}</div>
              <div class="cheat-card-desc">${tx('cheatCheatDesc')}</div>
            </div>
            <div class="cheat-gif">
              <img src="Images/Cheat.gif" alt="Bottom dealing" />
              <div class="cheat-gif-label cheating">${tx('cheatCheatLabel')}</div>
            </div>
          </div>

          <div class="cheat-divider" style="margin-top:32px"></div>

          <div class="cheat-section-title" style="margin-top:28px">${tx('cheatWhenPlacing')}</div>
          <div class="cheat-card">
            <div class="cheat-card-text">
              <div class="cheat-card-label normal"><span class="ico">check_circle</span>${tx('cheatNormalLabel')}</div>
              <div class="cheat-card-desc">${tx('cheatPlaceNormalDesc')}</div>
            </div>
            <div class="cheat-gif">
              <img src="Images/Normal_drop.gif" alt="Normal placing" />
              <div class="cheat-gif-label normal">${tx('cheatNormalLabel')}</div>
            </div>
          </div>
          <div class="cheat-divider"></div>
          <div class="cheat-card">
            <div class="cheat-card-text">
              <div class="cheat-card-label cheating"><span class="ico">warning</span>${tx('cheatCheatLabel')}</div>
              <div class="cheat-card-desc">${tx('cheatPlaceCheatDesc')}</div>
            </div>
            <div class="cheat-gif">
              <img src="Images/Cheat_drop.gif" alt="Cheating — careful placing" />
              <div class="cheat-gif-label cheating">${tx('cheatCheatLabel')}</div>
            </div>
          </div>

          <div class="cheat-divider" style="margin-top:32px"></div>
          <div class="cheat-tip centered">
            <span class="ico">lightbulb</span>
            <div class="cheat-tip-text">${tx('cheatTip')}</div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('bar-right').innerHTML = renderBarRight('cheat');
    return;
  }

  // Restore tab labels for Duo mode
  document.getElementById('tab-cinq').textContent = S.lang==='fr' ? 'Cinq-Cartes' : 'Five-Card';
  document.getElementById('tab-duo').className = 'mode-tab on';
  document.getElementById('tab-cinq').className = 'mode-tab';
  document.getElementById('tab-cheat').className = 'mode-tab';

  let rightHTML = `<div class="col col-r">
    <div class="col-hd">
      <span class="col-ttl"><span class="ico">groups</span>${tx('opponent')}(s)</span>
      <div class="opp-count-sel">
        <div class="opp-count-btns">
          ${[1,2,3].map(n=>`<button class="ocb${S.opps.length===n?' on':''}" onclick="setOppCount(${n})">${n}</button>`).join('')}
        </div>
      </div>
    </div>
    <div class="col-bd">`;

  S.opps.forEach((o,i) => {
    if (S.opps.length > 1) {
      rightHTML += `<div style="display:flex;justify-content:flex-end;margin-bottom:4px"><button class="opp-cross" onclick="removeOppAt(${i})" title="Remove"><span class="ico">close</span></button></div>`;
    }
    rightHTML += selector(o,'o'+i,tx('oppCard',i+1), true, i) + (!o.folded ? threat(o, isTaken) : '');
  });

  // Per-opponent odds blocks — NO VS labels, NO combined section
  if (myH && validOpps.length) {
    const { perOpp } = computeOdds(myH, validOpps);
    rightHTML += '<div style="margin-top:14px">';
    S.opps.forEach((o,i) => {
      if (!o.n || !o.col || o.folded) return;
      const vIdx = validOpps.indexOf(o);
      const r = perOpp[vIdx];
      rightHTML += `<div class="res-block">
        ${obar(r.w,r.l,r.ti,r.tot)}
        <button class="dtl-btn" onclick="togDtl(${i})"><span class="ico">${S.dtl[i]?'expand_less':'expand_more'}</span>${S.dtl[i]?tx('hideDtl'):tx('showDtl')}</button>
        ${S.dtl[i]?`<div class="dtl-scroll"><table class="dtl-tbl">
          <thead><tr><th>${tx('th2')}</th><th>${tx('thHand')}</th><th>${tx('thRes')}</th></tr></thead>
          <tbody>${[...r.dtl].sort((a,b)=>{const o={lose:0,tie:1,win:2};return o[a.res]-o[b.res];}).map(d=>`<tr>
            <td><span style="color:${d.card.col==='red'?'#d46b6b':'#d4b84a'};font-weight:600">${d.card.col==='red'?'R':(S.lang==='fr'?'J':'Y')}${d.card.n}</span></td>
            <td style="color:var(--c-muted)">${handName(d.oh)}</td>
            <td><span style="color:${rCol(d.res)}">${rIco(d.res)}</span></td>
          </tr>`).join('')}</tbody>
        </table></div>`:''}
      </div>`;
    });
    rightHTML += '</div>';
  }
  rightHTML += '</div></div>';

  // Center
  let centerHTML = '<div class="col-c"><div class="stage-bg"></div>';
  if (!myH) {
    centerHTML += `<div class="stage-empty"><span class="ico">playing_cards</span><p>${tx('promptCards')}</p></div>`;
  } else if (!anyUnfoldedOpps.length) {
    centerHTML += `<div class="stage-empty"><span class="ico" style="color:var(--c-win); font-size:54px;">emoji_events</span><p style="color:var(--c-win); font-size:16px; ">${tx('allFolded')}</p></div>`;
  } else if (!validOpps.length) {
    centerHTML += `<div class="stage-empty"><span class="ico">person_search</span><p>${tx('promptOpp')}</p></div>`;
  } else {
    centerHTML = '<div class="col-c stack"><div class="stage-bg"></div>';
    const { perOpp, combo } = computeOdds(myH, validOpps);
    const src = combo || perOpp[0];
    const wr = src.w/src.tot;
    const wp = pct(src.w, src.tot);
    const cls = wr>=0.55?'win':wr>=0.35?'caution':'danger';
    const lbl = combo ? tx('winVsAll',validOpps.length) : tx('winVs');
    centerHTML += `<div class="center-stack">
      <div class="prob-lbl">${lbl}</div>
      <div class="prob-num ${cls}"><span class="n">${wp}</span><span class="s">%</span></div>
      <div class="sbar-wrap">${sbar(src.w,src.l,src.ti,src.tot)}</div>
      <div class="sit-wrap">
        <div class="sit-lbl">${tx('situation')}</div>
        <div class="sit-seg">
          <button class="${!S.raising?'on':''}" onclick="setSit(false)"><span class="ico">flag</span>${tx('first')}</button>
          <button class="${S.raising?'on':''}" onclick="setSit(true)"><span class="ico">trending_up</span>${tx('raise')}</button>
        </div>
      </div>
      <div class="advice-wrap">${advice(src.w,src.l,src.tot,S.raising,myH,validOpps)}</div>
      <div class="acts">
        <button class="btn-next" onclick="nextTour()"><span class="ico">skip_next</span>${tx('next')}</button>
      </div></div>`;
  }
  centerHTML += '</div>';

  // Update DOM
  document.getElementById('arena').innerHTML = leftHTML + centerHTML + rightHTML + rankings();
  restoreScroll();
  document.getElementById('bar-right').innerHTML = renderBarRight('duo');
}

// ── Event handlers ────────────────────────────────────────────────────────────
function runRuleTests() {
  const failures = [];
  const expect = (name, actual, expected) => {
    if (actual !== expected) failures.push(`${name}: expected ${expected}, got ${actual}`);
  };

  expect('Duo Ten Pair vs Prime Pair', cmp(evalHand({n:10,col:'red'},{n:10,col:'yellow'}), evalHand({n:3,col:'red'},{n:8,col:'red'})), 'lose');
  expect('Duo Ten Pair vs Superior Pair', cmp(evalHand({n:10,col:'red'},{n:10,col:'yellow'}), evalHand({n:1,col:'red'},{n:3,col:'red'})), 'lose');
  expect('Duo High Warden vs Pair 9', cmp(evalHand({n:4,col:'red'},{n:9,col:'red'}), evalHand({n:9,col:'red'},{n:9,col:'yellow'})), 'tie');
  expect('Duo High Warden vs Pair 10', cmp(evalHand({n:4,col:'red'},{n:9,col:'red'}), evalHand({n:10,col:'red'},{n:10,col:'yellow'})), 'lose');
  expect('Duo Executor vs Superior Pair', cmp(evalHand({n:4,col:'red'},{n:7,col:'red'}), evalHand({n:1,col:'red'},{n:3,col:'red'})), 'win');
  expect('Five Ten Pair vs Superior Pair', cmp5(evalHand5({n:10,col:'red'},{n:10,col:'yellow'}), evalHand5({n:1,col:'red'},{n:3,col:'red'})), 'lose');
  expect('Five Pair 9 vs Perfect Nine', cmp5(evalHand5({n:9,col:'red'},{n:9,col:'yellow'}), evalHand5({n:4,col:'red'},{n:5,col:'yellow'})), 'win');

  testStatus = { ok: failures.length === 0, count: 7, failed: failures };
  if (!testStatus.ok) console.warn('Rule test failures:', failures);
  return testStatus;
}

window.pickCard = (key, n, col) => { 
  bustCache(); 
  const obj = (key==='c1'?S.c1:key==='c2'?S.c2:S.opps[+key.slice(1)]); 
  if (obj.n === n && obj.col === col) {
    obj.n = null; 
    obj.col = null;
  } else {
    obj.n = n; 
    obj.col = col;
  }
  render(); 
};
window.setOppCount = n => {
  // Grow or shrink to the requested count, preserving existing opp data
  while (S.opps.length < n) S.opps.push({n:null,col:null,folded:false});
  while (S.opps.length > n) { delete S.dtl[S.opps.length-1]; S.opps.pop(); }
  bustCache(); render();
};
window.removeOppAt = i => {
  if (S.opps.length <= 1) return;
  S.opps.splice(i, 1);
  // Rebuild dtl keys
  const newDtl = {};
  Object.keys(S.dtl).forEach(k => { if (+k < i) newDtl[k]=S.dtl[k]; else if (+k > i) newDtl[+k-1]=S.dtl[k]; });
  S.dtl = newDtl;
  bustCache(); render();
};
window.togDtl  = i         => { S.dtl[i]=!S.dtl[i]; render(); };
window.setSit  = v         => { S.raising=v; render(); };
window.setLang = l => { S.lang=l; localStorage.setItem('duo5_lang', l); render(); };
window.toggleRanks = ()    => { S.showRanks=!S.showRanks; render(); };
window.toggleRanks5 = ()   => { S5.showRanks5=!S5.showRanks5; render(); };
window.toggleFold = i      => { S.opps[i].folded=!S.opps[i].folded; bustCache(); render(); };
window.toggleFold5 = i     => { S5.opps[i].folded=!S5.opps[i].folded; bustCache(); render(); };
window.setMode = m         => { S.mode=m; render(); };

// Five-Card specific handlers
window.pickCard5 = (key, n, col) => {
  bustCache();
  const obj = key.startsWith('o') ? S5.opps[+key.slice(1)] : S5.cards[+key.slice(1)];
  if (obj.n===n && obj.col===col) { obj.n=null; obj.col=null; } else { obj.n=n; obj.col=col; }
  render();
};
window.setOppCount5 = n => {
  while (S5.opps.length < n) S5.opps.push({n:null,col:null,folded:false});
  while (S5.opps.length > n) { delete S5.dtl[S5.opps.length-1]; S5.opps.pop(); }
  bustCache(); render();
};
window.removeOppAt5 = i => {
  if (S5.opps.length <= 1) return;
  S5.opps.splice(i,1);
  const nd={}; Object.keys(S5.dtl).forEach(k=>{if(+k<i)nd[k]=S5.dtl[k];else if(+k>i)nd[+k-1]=S5.dtl[k];}); S5.dtl=nd;
  bustCache(); render();
};
window.togDtl5 = i   => { S5.dtl[i]=!S5.dtl[i]; render(); };
window.setSit5 = v   => { S5.raising=v; render(); };
window.nextTour5 = () => {
  const n=S5.opps.length;
  S5.cards=Array.from({length:5},()=>({n:null,col:null}));
  S5.opps=Array.from({length:n},()=>({n:null,col:null,folded:false}));
  S5.dtl={}; S5.raising=false; bustCache(); render();
};
window.resetAll5 = () => {
  S5.cards=Array.from({length:5},()=>({n:null,col:null}));
  S5.opps=[{n:null,col:null,folded:false}];
  S5.dtl={}; S5.raising=false; bustCache(); render();
};
window.nextTour = () => {
  const n=S.opps.length;
  S.c1={n:null,col:null}; S.c2={n:null,col:null};
  S.opps=Array.from({length:n},()=>({n:null,col:null,folded:false}));
  S.dtl={}; S.raising=false; bustCache(); render();
};
window.resetAll = () => {
  S.c1={n:null,col:null}; S.c2={n:null,col:null};
  S.opps=[{n:null,col:null,folded:false}];
  S.dtl={}; S.raising=false; bustCache(); render();
};

runRuleTests();
render();
