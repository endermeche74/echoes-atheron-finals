/* ═══════════════════════════════════════
   ECHOES OF AETHON — Render Dispatcher
   Fixed: clears panels, try-catch on
   every view, shows error if JS fails.
   ════════════════════════════════════ */

function sv(v) {
  VIEW = v;
  sfxClick();
  document.querySelectorAll('.tab').forEach(function (t) {
    t.classList.toggle('on', t.dataset.v === v);
  });
  render();
}

function render() {
  /* Always update header first */
  updHdr();

  var M = document.getElementById('main');
  var S = document.getElementById('sinfo');
  if (!M || !S) return;

  /* Always wipe both panels before writing */
  M.innerHTML = '';
  S.innerHTML = '';

  /* Death */
  if (P && P.hp <= 0) {
    M.innerHTML = renderDeath();
    return;
  }

  /* Combat overrides everything */
  if (C && C.on) {
    _safeRender(M, renderCombat,     'Combat');
    _safeRender(S, renderCombatSide, 'CombatSide');
    return;
  }

  /* Dialogue overrides everything */
  if (DLG && DLG.on) {
    _safeRender(M, renderDialogue,     'Dialogue');
    _safeRender(S, renderDialogueSide, 'DialogueSide');
    return;
  }

  /* Normal views */
  switch (VIEW) {
    case 'explore':
      _safeRender(M, renderExplore,     'Explore');
      _safeRender(S, renderExploreSide, 'ExploreSide');
      break;
    case 'skills':
      _safeRender(M, renderSkills,      'Skills');
      _safeRender(S, renderSkillsSide,  'SkillsSide');
      break;
    case 'inventory':
      _safeRender(M, renderInventory,     'Inventory');
      _safeRender(S, renderInventorySide, 'InventorySide');
      break;
    case 'spellbook':
      _safeRender(M, renderSpellbook,     'Spellbook');
      _safeRender(S, renderSpellbookSide, 'SpellbookSide');
      break;
    case 'quests':
      _safeRender(M, renderQuests,     'Quests');
      _safeRender(S, renderQuestsSide, 'QuestsSide');
      break;
    case 'map':
      _safeRender(M, renderMap,     'Map');
      _safeRender(S, renderMapSide, 'MapSide');
      break;
    case 'factions':
      _safeRender(M, renderFactions,     'Factions');
      _safeRender(S, renderFactionsSide, 'FactionsSide');
      break;
    default:
      VIEW = 'explore';
      _safeRender(M, renderExplore,     'Explore');
      _safeRender(S, renderExploreSide, 'ExploreSide');
  }
}

/**
 * Call a render function and write its output to el.
 * If it throws, shows a readable error instead of a blank screen.
 */
function _safeRender(el, fn, label) {
  try {
    el.innerHTML = fn();
  } catch (e) {
    console.error('[Aethon] Render error in ' + label + ':', e);
    el.innerHTML = [
      '<div style="padding:16px;color:#ff8877;font-size:12px;line-height:1.8">',
      '<strong>⚠ Render error in ' + label + '</strong><br>',
      e.message + '<br><br>',
      '<small style="color:var(--mut)">Open the browser console (F12) for the full stack trace.</small>',
      '</div>'
    ].join('');
  }
}

/* ── DEATH SCREEN ── */
function renderDeath() {
  return [
    '<div class="death">',
    '<div style="font-family:Georgia,serif;font-size:30px;color:#8b2020;',
    'letter-spacing:5px;margin-bottom:14px">YOU HAVE FALLEN</div>',
    '<div style="font-family:Georgia,serif;font-style:italic;color:var(--mut);',
    'font-size:13px;margin-bottom:24px;line-height:2">',
    'The ruins of Aethon do not mourn.<br>',
    'They have seen this many times before.<br><br>',
    'The cycle continues.',
    '</div>',
    '<button class="btn" onclick="doRespawn()" ',
    'style="margin:0 auto;display:block;padding:12px 30px;font-size:14px">',
    '⟳ Rise Again</button>',
    '<div style="margin-top:12px;color:var(--mut);font-size:10px">',
    'Skills and equipment preserved.',
    '</div>',
    '</div>'
  ].join('');
}