/* ═══════════════════════════════════════
   ECHOES OF AETHON — Render Dispatcher
   ════════════════════════════════════ */

function sv(v) {
  VIEW = v;
  if (typeof sfxClick === 'function') sfxClick();
  document.querySelectorAll('.tab').forEach(function (t) {
    t.classList.toggle('on', t.dataset.v === v);
  });
  render();
}

function render() {
  if (typeof updHdr === 'function') {
    try { updHdr(); } catch(e) { console.error('[Aethon] updHdr:', e); }
  }

  var M = document.getElementById('main');
  var S = document.getElementById('sinfo');
  if (!M || !S) { console.error('[Aethon] #main or #sinfo missing'); return; }

  M.innerHTML = '';
  S.innerHTML = '';

  /* Death */
  if (typeof P !== 'undefined' && P.hp <= 0) {
    M.innerHTML = renderDeath();
    return;
  }

  /* Combat overrides */
  if (typeof C !== 'undefined' && C.on) {
    _safe(M, renderCombat,     'renderCombat');
    _safe(S, renderCombatSide, 'renderCombatSide');
    return;
  }

  /* Dialogue overrides */
  if (typeof DLG !== 'undefined' && DLG.on) {
    _safe(M, renderDialogue,     'renderDialogue');
    _safe(S, renderDialogueSide, 'renderDialogueSide');
    return;
  }

  /* Normal views
     Key = VIEW string
     Value = [mainFn, sideFn]
     These names MUST match the function names
     defined inside your ui/*.js files exactly. */
  var VIEWS = {
    explore:   [renderExplore,   renderExploreSide],
    skills:    [renderSkills,    renderSkillsSide],
    inventory: [renderInventory, renderInventorySide],
    spellbook: [renderSpellbook, renderSpellbookSide],
    quests:    [renderQuests,    renderQuestsSide],
    map:       [renderMap,       renderMapSide],
    factions:  [renderFactions,  renderFactionsSide]
  };

  var pair = VIEWS[VIEW];

  /* Unknown VIEW — fall back to explore */
  if (!pair) {
    console.warn('[Aethon] Unknown VIEW: "' + VIEW + '" — falling back to explore');
    VIEW = 'explore';
    pair = VIEWS['explore'];
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('on', t.dataset.v === 'explore');
    });
  }

  _safe(M, pair[0], String(VIEW) + ' main');
  _safe(S, pair[1], String(VIEW) + ' side');
}

/* ── SAFE CALL ───────────────────────── */
function _safe(el, fn, label) {
  try {
    if (typeof fn !== 'function') {
      el.innerHTML = _errBox(
        'Function for <strong>' + label + '</strong> is not defined.<br>' +
        'The file that contains it probably has a 404 or a syntax error.<br>' +
        'Check F12 → Console for red errors.'
      );
      return;
    }
    var html = fn();
    el.innerHTML = (typeof html === 'string') ? html : '';
  } catch (e) {
    console.error('[Aethon] Error rendering ' + label + ':', e);
    el.innerHTML = _errBox('<strong>' + label + '</strong>: ' + String(e.message || e));
  }
}

function _errBox(msg) {
  return '<div style="margin:12px;padding:14px;color:#ff8877;font-size:12px;' +
         'line-height:1.9;border:1px solid #4a1a1a;background:#0e0505">' +
         '⚠ ' + msg + '<br>' +
         '<small style="color:var(--mut)">F12 → Console for full details.</small>' +
         '</div>';
}

/* ── DEATH ───────────────────────────── */
function renderDeath() {
  return '<div class="death">' +
    '<div style="font-family:Georgia,serif;font-size:28px;color:#8b2020;' +
    'letter-spacing:4px;margin-bottom:12px">YOU HAVE FALLEN</div>' +
    '<div style="font-family:Georgia,serif;font-style:italic;color:var(--mut);' +
    'font-size:13px;margin-bottom:22px;line-height:2">' +
    'The ruins of Aethon do not mourn.<br>' +
    'They have seen this many times before.<br><br>' +
    'The cycle continues.' +
    '</div>' +
    '<button class="btn" onclick="doRespawn()" ' +
    'style="margin:0 auto;display:block;padding:11px 28px;font-size:13px">' +
    '⟳ Rise Again</button>' +
    '<div style="margin-top:10px;color:var(--mut);font-size:10px">' +
    'Skills and equipment preserved.' +
    '</div></div>';
}