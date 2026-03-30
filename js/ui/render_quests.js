/* ═══════════════════════════════════════
   ECHOES OF AETHON — Quest Journal Renderer
   ════════════════════════════════════ */

function renderQuests() {
  var html    = [];
  var qIds    = Object.keys(QUESTS);
  var active  = qIds.filter(function (id) { return questActive(id);   });
  var done    = qIds.filter(function (id) { return questDone(id);     });
  var inactive= qIds.filter(function (id) { return questInactive(id); });

  html.push('<div class="page-title">Quest Journal</div>');
  html.push('<div class="page-sub">' + active.length + ' active · ' + done.length + ' complete · ' + inactive.length + ' undiscovered</div>');

  /* ── Active ── */
  if (active.length > 0) {
    html.push('<div class="sec">Active Quests</div>');
    active.forEach(function (qid) {
      var q  = QUESTS[qid];
      var qs = questState(qid);
      html.push(
        '<div class="qcard">',
        '<div class="qname">' + q.name + '</div>',
        '<span class="q-active">Active — Stage ' + (qs.stage + 1) + '/' + (q.stages.length - 1) + '</span>',
        '<div style="font-size:11px;color:var(--mut);margin-bottom:8px;line-height:1.6">' + q.desc + '</div>',
        /* All stages */
        q.stages.slice(0, -1).map(function (s, i) {
          var done2 = i < qs.stage;
          var cur   = i === qs.stage;
          var col   = done2 ? 'var(--mut)' : cur ? '#44ee66' : 'var(--dim)';
          var pfx   = done2 ? '✓ ' : cur ? '▶ ' : '○ ';
          return '<div style="font-size:11px;color:' + col + ';margin-bottom:3px">' + pfx + s + '</div>';
        }).join(''),
        /* Reward preview */
        q.reward ? renderRewardPreview(q.reward) : '',
        '</div>'
      );
    });
  }

  /* ── Complete ── */
  if (done.length > 0) {
    html.push('<div class="sec">Completed Quests</div>');
    done.forEach(function (qid) {
      var q = QUESTS[qid];
      html.push(
        '<div class="qcard">',
        '<div class="qname" style="color:var(--mut)">' + q.name + '</div>',
        '<span class="q-complete">Complete</span>',
        '<div style="font-size:10px;color:var(--dim);margin-top:4px">' + q.desc + '</div>',
        '</div>'
      );
    });
  }

  /* ── Undiscovered ── */
  if (inactive.length > 0) {
    html.push('<div class="sec">Undiscovered Quests</div>');
    html.push(
      '<div style="font-size:11px;color:var(--mut);line-height:1.7">',
      inactive.length + ' quest' + (inactive.length !== 1 ? 's' : '') + ' not yet discovered.<br>',
      'Explore new areas and speak to the people you find there.',
      '</div>'
    );
  }

  return html.join('');
}

function renderQuestsSide() {
  var qIds   = Object.keys(QUESTS);
  var active = qIds.filter(function (id) { return questActive(id); }).length;
  var done   = qIds.filter(function (id) { return questDone(id);   }).length;
  var total  = qIds.length;

  return [
    '<div class="sec">Progress</div>',
    '<div style="font-size:11px;color:var(--mut);line-height:2">',
    'Active: <span style="color:#44ee66">' + active + '</span><br>',
    'Complete: <span style="color:var(--gold)">' + done + '</span><br>',
    'Total: <span style="color:var(--txt)">' + total + '</span>',
    '</div>',
    '<div class="sec" style="margin-top:12px">How to Get Quests</div>',
    '<div style="font-size:10px;color:var(--mut);line-height:1.7">',
    'Quests are offered during NPC conversations.<br><br>',
    'Explore new areas to meet new people.<br><br>',
    'Some quests only appear after you reach a certain point in another conversation.',
    '</div>'
  ].join('');
}

/* ── Helper: reward preview block ── */
function renderRewardPreview(reward) {
  var parts = [];
  if (reward.gold)  parts.push('<span style="color:var(--gold)">' + reward.gold + 'g</span>');
  if (reward.items) reward.items.forEach(function (iid) {
    var it = ITEMS[iid];
    if (it) parts.push('<span class="' + rarC(it.rar) + '">' + it.n + '</span>');
  });
  if (reward.xp) {
    Object.keys(reward.xp).forEach(function (sk) {
      parts.push('<span style="color:var(--xp)">' + reward.xp[sk] + ' ' + SKILLMETA[sk].n + ' XP</span>');
    });
  }
  if (parts.length === 0) return '';
  return [
    '<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--brd2)">',
    '<div style="font-size:9px;color:var(--mut);margin-bottom:4px;text-transform:uppercase;letter-spacing:1px">Reward</div>',
    '<div style="font-size:10px;display:flex;flex-wrap:wrap;gap:6px">' + parts.join('') + '</div>',
    '</div>'
  ].join('');
}