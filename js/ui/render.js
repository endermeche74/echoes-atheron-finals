/* ═══════════════════════════════════════
   ECHOES OF AETHON — Render Dispatcher
   Ultra-defensive: every call wrapped,
   missing functions show named errors,
   never leaves screen blank.
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
  /* Header */
  if (typeof updHdr === 'function') {
    try { updHdr(); } catch (e) { console.error('[Aethon] updHdr:', e); }
  }

  var M = document.getElementById('main');
  var S = document.getElementById('sinfo');
  if (!M || !S) { console.error('[Aethon] #main or #sinfo not found in DOM'); return; }

  /* Always clear first */
  M.innerHTML = '';
  S.innerHTML = '';

  /* Death */
  if (typeof P !== 'undefined' && P.hp <= 0) {
    M.innerHTML = (typeof renderDeath === 'function') ? renderDeath() : '<div style="padding:20px;color:#ff8877">You have fallen.</div>';
    return;
  }

  /* Combat */
  if (typeof C !== 'undefined' && C.on) {
    _safe(M, renderCombat,     'renderCombat');
    _safe(S, renderCombatSide, 'renderCombatSide');
    return;
  }

  /* Dialogue */
  if (typeof DLG !== 'undefined' && DLG.on) {
    _safe(M, renderDialogue,     'renderDialogue');
    _safe(S, renderDialogueSide, 'renderDialogueSide');
    return;
  }

  /* Normal views — map of view-name → [mainFn, sideFn] */
  var MAP = {
    explore:   [renderExplore,   renderExploreSide],
    skills:    [renderSkills,    renderSkillsSide],
    inventory: [renderInventory, renderInventorySide],
    spellbook: [renderSpellbook, renderSpellbookSide],
    quests:    [renderQuests,    renderQuestsSide],
    map:       [renderMap,       renderMapSide],
    factions:  [renderFactions,  renderFactionsSide]
  };

  var pair = MAP[VIEW] || MAP['explore'];
  _safe(M, pair[0], pair[0] ? pair[0].name || VIEW      : VIEW);
  _safe(S, pair[1], pair[1] ? pair[1].name || VIEW+'Side': VIEW+'Side');
}

/* ── SAFE WRAPPER ────────────────────── */
function _safe(el, fn, label) {
  try {
    if (typeof fn !== 'function') {
      el.innerHTML = _errBox(
        'Function <code>' + label + '</code> is not defined.<br>' +
        'A script file may have failed to load — check F12 Console for red errors.'
      );
      return;
    }
    var html = fn();
    el.innerHTML = (typeof html === 'string' && html.length > 0) ? html : '';
  } catch (e) {
    console.error('[Aethon] Error in ' + label + ':', e);
    el.innerHTML = _errBox('<strong>' + label + '</strong>: ' + String(e.message || e));
  }
}

function _errBox(msg) {
  return [
    '<div style="margin:12px;padding:14px;color:#ff8877;font-size:12px;',
    'line-height:1.9;border:1px solid #4a1a1a;background:#0e0505">',
    '⚠ ' + msg,
    '<br><small style="color:var(--mut)">Press F12 → Console to see the full error.</small>',
    '</div>'
  ].join('');
}

/* ── DEATH ───────────────────────────── */
function renderDeath() {
  return [
    '<div class="death">',
    '<div style="font-family:Georgia,serif;font-size:28px;color:#8b2020;',
    'letter-spacing:4px;margin-bottom:12px">YOU HAVE FALLEN</div>',
    '<div style="font-family:Georgia,serif;font-style:italic;color:var(--mut);',
    'font-size:13px;margin-bottom:22px;line-height:2">',
    'The ruins of Aethon do not mourn.<br>',
    'They have seen this many times before.<br><br>',
    'The cycle continues.',
    '</div>',
    '<button class="btn" onclick="doRespawn()" ',
    'style="margin:0 auto;display:block;padding:11px 28px;font-size:13px">',
    '⟳ Rise Again</button>',
    '<div style="margin-top:10px;color:var(--mut);font-size:10px">',
    'Skills and equipment preserved.',
    '</div></div>'
  ].join('');
}