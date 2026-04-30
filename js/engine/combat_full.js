/*************************************************************
 * combat_full.js — Fear & Hunger Style Combat System
 * Tabs: ATTACK · SKILLS · ITEMS · OTHER
 * Canvas overlay, own RAF loop, AZERTY (ZQSD) controls
 *************************************************************/

const CombatFull = (function() {

    // ── LAYOUT ────────────────────────────────────────────────
    const W       = CONFIG.CANVAS_W;  // 624
    const H       = CONFIG.CANVAS_H;  // 336
    const SCENE_H = 235;              // top 70 % — combat scene
    const PANEL_Y = 235;              // bottom 30 % starts here
    const PANEL_H = H - PANEL_Y;     // 101
    const SEP_X   = 156;             // left / right panel split

    // ── STATIC DATA ───────────────────────────────────────────
    const TABS = ['Attack', 'Skills', 'Guard', 'Item'];

    const BODY_PARTS = [
        { id: 'head',  label: 'HEAD',   hit: 55, dmgMul: 1.8, maxHp: 20 },
        { id: 'torso', label: 'TORSO',  hit: 85, dmgMul: 1.0, maxHp: 60 },
        { id: 'larm',  label: 'L. ARM', hit: 65, dmgMul: 0.7, maxHp: 25 },
        { id: 'rarm',  label: 'R. ARM', hit: 65, dmgMul: 0.7, maxHp: 25 },
        { id: 'legs',  label: 'LEGS',   hit: 70, dmgMul: 0.8, maxHp: 30 },
    ];

    const DEFAULT_SKILLS = [
        { id: 'slash',         name: 'Slash',         mp: 0,  type: 'physical', dmgMul: 1.2, desc: 'A quick slash. Always hits.' },
        { id: 'heavy',         name: 'Heavy Strike',  mp: 8,  type: 'physical', dmgMul: 2.0, desc: 'Powerful blow. May stagger.' },
        { id: 'thrust',        name: 'Thrust',        mp: 5,  type: 'physical', dmgMul: 1.5, desc: 'Piercing. Ignores DEF.' },
        { id: '_sep1',         name: '── MAGIC ──',   sep: true },
        { id: 'fireball',      name: 'Fireball',      mp: 12, type: 'magic',    dmgMul: 2.5, desc: 'Hurls a ball of fire.' },
        { id: 'ice_shard',     name: 'Ice Shard',     mp: 10, type: 'magic',    dmgMul: 2.0, desc: 'Shards of ice. May slow.' },
        { id: '_sep2',         name: '── SUPPORT ──', sep: true },
        { id: 'heal',          name: 'Heal',          mp: 15, type: 'heal',     heal: 40,    desc: 'Restore 40 HP.' },
        { id: 'buff_atk',      name: 'Buff Attack',   mp: 8,  type: 'buff',                  desc: 'ATK +50 % for 3 turns.' },
    ];

    const OTHER_OPTIONS = [
        { id: 'defend',  label: 'Defend',   desc: 'Halve incoming damage this turn.' },
        { id: 'analyze', label: 'Analyze',  desc: 'Reveal enemy stats and weaknesses.' },
        { id: 'talk',    label: 'Talk',     desc: 'Attempt to communicate.' },
        { id: 'flee',    label: 'Flee',     desc: 'Escape attempt — 45 % success rate.' },
        { id: 'give_up', label: 'Give Up',  desc: 'Surrender. You will be defeated.' },
    ];

    // ── STATE ─────────────────────────────────────────────────
    // Phases: menu · animating · player_msg · enemy_turn · enemy_msg · victory · defeat
    let active    = false;
    let phase     = 'menu';
    let activeTab = 0;
    let selIndex  = 0;

    let enemy     = null;
    let defending = false;
    let buffed    = false;
    let buffTurns = 0;
    let analyzed  = false;
    let turnCount = 0;

    let msgQueue  = [];     // strings shown one at a time
    let msgTimer  = 0;
    const MSG_DUR = 1.6;

    let animState = null;   // { type, timer, dur, x, y }
    let flashTimer = 0;
    let flashColor = null;
    let shakeDur   = 0;
    let shakeX = 0, shakeY = 0;
    let floaters   = [];    // { text, x, y, vy, alpha, color, timer }

    // ctx is set by the public render(c) call from engine.js
    let ctx = null;

    // ── PUBLIC API ────────────────────────────────────────────
    function start(enemyData) {
        enemy = {
            name:  enemyData.name   || 'Enemy',
            hp:    enemyData.hp     || 60,
            maxHp: enemyData.maxHp  || enemyData.hp || 60,
            atk:   enemyData.atk    || 12,
            def:   enemyData.def    || 5,
            xp:    enemyData.xp     || 30,
            gold:  enemyData.gold   || 15,
            parts:  BODY_PARTS.map(p => ({ ...p, hp: p.maxHp })),
            sprite: enemyData.sprite || '',
        };

        active    = true;
        phase     = 'menu';
        activeTab = 0;
        selIndex  = 0;
        defending = false;
        buffed    = false;
        buffTurns = 0;
        analyzed  = false;
        turnCount = 0;
        msgQueue  = [];
        floaters  = [];
        flashTimer = 0;
        shakeDur   = 0;
        shakeX = 0; shakeY = 0;

        if (typeof Input !== 'undefined') Input.disable();
        console.log('[CombatFull] Start:', enemy.name);
    }

    function close() {
        active = false;
        enemy  = null;
        if (typeof Input !== 'undefined') Input.enable();
    }

    // ── UPDATE ────────────────────────────────────────────────
    function update(dt) {
        if (!active) return;

        // Shake
        if (shakeDur > 0) {
            shakeDur -= dt;
            const m = shakeDur * 4;
            shakeX = (Math.random() - 0.5) * m;
            shakeY = (Math.random() - 0.5) * m;
            if (shakeDur <= 0) { shakeX = 0; shakeY = 0; }
        }

        // Flash
        if (flashTimer > 0) flashTimer -= dt;

        // Floaters
        for (let i = floaters.length - 1; i >= 0; i--) {
            const f = floaters[i];
            f.timer -= dt;
            f.y     += f.vy * dt;
            f.alpha  = Math.max(0, f.timer / 1.2);
            if (f.timer <= 0) floaters.splice(i, 1);
        }

        // Animation → after done, push to message phase
        if (phase === 'animating') {
            animState.timer -= dt;
            if (animState.timer <= 0) {
                animState = null;
                _advanceToMessages('player_msg');
            }
            return;
        }

        // Message phases — auto-advance
        if (phase === 'player_msg' || phase === 'enemy_msg') {
            msgTimer -= dt;
            if (msgTimer <= 0) _nextMessage();
            return;
        }

        // Enemy turn — immediate
        if (phase === 'enemy_turn') {
            _doEnemyTurn();
        }
    }

    function _advanceToMessages(msgPhase) {
        if (msgQueue.length === 0) {
            if (msgPhase === 'player_msg') {
                if (!enemy || enemy.hp <= 0) { _endVictory(); return; }
                phase = 'enemy_turn';
            } else {
                if (_playerHp() <= 0) { phase = 'defeat'; return; }
                defending = false; turnCount++;
                phase = 'menu';
            }
            return;
        }
        phase    = msgPhase;
        msgTimer = MSG_DUR;
    }

    function _nextMessage() {
        msgQueue.shift();
        if (msgQueue.length === 0) {
            const wasPlayer = (phase === 'player_msg');
            if (!enemy || enemy.hp <= 0)    { _endVictory(); return; }
            if (_playerHp() <= 0)           { phase = 'defeat'; return; }
            if (wasPlayer)                  { phase = 'enemy_turn'; }
            else                            { defending = false; turnCount++; phase = 'menu'; }
        } else {
            msgTimer = MSG_DUR;
        }
    }

    // ── PLAYER STAT HELPERS ───────────────────────────────────
    function _hp()    { return typeof P !== 'undefined' ? (P.hp    || 0)  : 100; }
    function _mp()    { return typeof P !== 'undefined' ? (P.mp    || 0)  : 50;  }
    function _atk()   { return typeof P !== 'undefined' ? (P.atk   || 10) : 10;  }
    function _maxHp() { return typeof P !== 'undefined' ? (P.maxHp || P.hpMax || 100) : 100; }
    function _maxMp() { return typeof P !== 'undefined' ? (P.maxMp || P.mpMax || 50)  : 50;  }
    function _def()   { return typeof P !== 'undefined' ? (P.def   || 5)  : 5;   }
    function _playerHp() { return _hp(); }

    // ── COMBAT ACTIONS ────────────────────────────────────────
    function _doAttack(partIdx) {
        const part = enemy.parts[partIdx];
        const atk  = _atk() * (buffed ? 1.5 : 1);
        const hit  = part.hit;

        if (Math.random() * 100 > hit) {
            _floater('MISS', 400, 80, '#a0a0a0');
            msgQueue.push('Your attack missed!');
        } else {
            const crit = Math.random() < 0.10;
            let dmg = Math.max(1, Math.floor(atk * part.dmgMul - enemy.def * 0.5));
            if (crit) dmg = Math.floor(dmg * 1.8);

            part.hp = Math.max(0, part.hp - dmg);
            enemy.hp = Math.max(0, enemy.hp - dmg);

            _floater(crit ? '✦' + dmg + '!' : String(dmg), 400, 75, crit ? '#ffd700' : '#ff6060');
            msgQueue.push((crit ? '★ CRITICAL! ' : '') + dmg + ' damage to ' + part.label + '!');
            if (part.hp <= 0) msgQueue.push(enemy.name + "'s " + part.label + ' is destroyed!');
            if (enemy.hp <= 0) msgQueue.push(enemy.name + ' has been defeated!');

            if (crit) { flashTimer = 0.18; flashColor = 'rgba(255,220,0,0.3)'; }
            _shake(0.14);
        }

        animState = { type: 'slash', timer: 0.38, dur: 0.38, x: 400, y: 90 };
        phase = 'animating';
    }

    function _doSkill(skill) {
        if (skill.sep) return;
        if ((skill.mp || 0) > _mp()) {
            msgQueue.push('Not enough MP!');
            _advanceToMessages('player_msg');
            return;
        }
        if (typeof P !== 'undefined') P.mp = Math.max(0, _mp() - (skill.mp || 0));

        if (skill.type === 'heal') {
            const amt = skill.heal || 30;
            if (typeof P !== 'undefined') P.hp = Math.min(_maxHp(), _hp() + amt);
            _floater('+' + amt + ' HP', 85, 100, '#60ff80');
            msgQueue.push(skill.name + ': restored ' + amt + ' HP.');
            animState = { type: 'heal', timer: 0.45, dur: 0.45, x: 85, y: 100 };

        } else if (skill.type === 'buff') {
            buffed = true; buffTurns = 3;
            _floater('ATK UP!', 85, 100, '#ffd700');
            msgQueue.push(skill.name + ': attack power increased for 3 turns!');
            animState = { type: 'buff', timer: 0.45, dur: 0.45, x: 85, y: 100 };

        } else {
            const atk  = _atk() * (buffed ? 1.5 : 1);
            const crit = Math.random() < 0.12;
            const defMul = skill.type === 'magic' ? 0.15 : 0.5;
            let dmg = Math.max(1, Math.floor(atk * (skill.dmgMul || 1.2) - enemy.def * defMul));
            if (crit) dmg = Math.floor(dmg * 1.8);

            enemy.hp = Math.max(0, enemy.hp - dmg);
            enemy.parts[1].hp = Math.max(0, enemy.parts[1].hp - dmg);

            _floater(crit ? '✦' + dmg + '!' : String(dmg), 400, 75, crit ? '#ffd700' : skill.type === 'magic' ? '#80c0ff' : '#ff6060');
            msgQueue.push(skill.name + ': ' + dmg + ' damage!' + (crit ? ' CRITICAL!' : ''));
            if (enemy.hp <= 0) msgQueue.push(enemy.name + ' has been defeated!');

            flashTimer = 0.12;
            flashColor = skill.type === 'magic' ? 'rgba(80,120,255,0.22)' : 'rgba(255,80,80,0.18)';
            _shake(0.12);
            animState = { type: skill.type === 'magic' ? 'magic' : 'slash', timer: 0.38, dur: 0.38, x: 400, y: 90 };
        }

        phase = 'animating';
    }

    function _doItem(item) {
        if (!item) return;
        const inv = typeof P !== 'undefined' ? (P.inv || P.items) : null;

        const id = (item.id || '').toLowerCase();
        if (id.includes('potion') || id.includes('health')) {
            const amt = item.heal || item.hp || 30;
            if (typeof P !== 'undefined') P.hp = Math.min(_maxHp(), _hp() + amt);
            _floater('+' + amt + ' HP', 85, 100, '#60ff80');
            msgQueue.push('Used ' + (item.name || 'potion') + '. Restored ' + amt + ' HP.');
        } else if (id.includes('ether') || id.includes('mana')) {
            const amt = item.restore || item.mp || 25;
            if (typeof P !== 'undefined') P.mp = Math.min(_maxMp(), _mp() + amt);
            _floater('+' + amt + ' MP', 85, 100, '#6080ff');
            msgQueue.push('Used ' + (item.name || 'ether') + '. Restored ' + amt + ' MP.');
        } else if (id.includes('bomb')) {
            const dmg = 30 + Math.floor(Math.random() * 25);
            enemy.hp = Math.max(0, enemy.hp - dmg);
            _floater(String(dmg), 400, 75, '#ff8020');
            msgQueue.push((item.name || 'Bomb') + ': ' + dmg + ' fire damage!');
            flashTimer = 0.2; flashColor = 'rgba(255,100,0,0.3)';
            _shake(0.2);
            if (enemy.hp <= 0) msgQueue.push(enemy.name + ' has been defeated!');
        } else {
            msgQueue.push('Cannot use that here.');
        }

        // Consume one
        if (inv) {
            const qi = item.qty || item.count || 1;
            if (qi > 1) { item.qty = qi - 1; item.count = item.qty; }
            else        { const i = inv.indexOf(item); if (i !== -1) inv.splice(i, 1); }
        }

        animState = { type: 'item', timer: 0.38, dur: 0.38, x: 85, y: 100 };
        phase = 'animating';
    }

    function _doOther(opt) {
        switch (opt.id) {
            case 'defend':
                defending = true;
                msgQueue.push('You brace for impact. Incoming damage halved this turn.');
                break;
            case 'analyze':
                analyzed = true;
                msgQueue.push(enemy.name + '  HP:' + enemy.hp + '/' + enemy.maxHp + '  ATK:' + enemy.atk + '  DEF:' + enemy.def);
                break;
            case 'talk':
                msgQueue.push(Math.random() < 0.15
                    ? enemy.name + ' seems momentarily confused...'
                    : enemy.name + ' ignores your words.');
                break;
            case 'flee':
                if (Math.random() < 0.45) {
                    msgQueue.push('You fled successfully!');
                    enemy.hp = -999;   // sentinel — victory path will close
                } else {
                    msgQueue.push('Failed to escape!');
                }
                break;
            case 'give_up':
                if (typeof P !== 'undefined') P.hp = 0;
                msgQueue.push('You surrendered...');
                break;
        }
        animState = { type: 'other', timer: 0.25, dur: 0.25, x: 85, y: 90 };
        phase = 'animating';
    }

    function _doEnemyTurn() {
        if (!enemy || enemy.hp <= 0) { _endVictory(); return; }

        const hit = Math.random() < 0.78;
        if (!hit) {
            _floater('MISS', 85, 110, '#a0a0a0');
            msgQueue.push(enemy.name + "'s attack missed!");
        } else {
            const crit = Math.random() < 0.08;
            let dmg = Math.max(1, enemy.atk - Math.floor(_def() * 0.5));
            if (crit)      dmg = Math.floor(dmg * 1.7);
            if (defending) dmg = Math.max(1, Math.floor(dmg * 0.5));

            if (typeof P !== 'undefined') P.hp = Math.max(0, _hp() - dmg);
            _floater(crit ? '✦' + dmg + '!' : String(dmg), 85, 110, crit ? '#ff4040' : '#ffa0a0');
            msgQueue.push(enemy.name + ' attacks for ' + dmg + ' damage!' + (crit ? ' CRITICAL!' : '') + (defending ? ' (blocked)' : ''));
            _shake(0.10);
        }

        // Buff decay
        if (buffed && --buffTurns <= 0) { buffed = false; msgQueue.push('Attack buff faded.'); }

        if (_hp() <= 0) msgQueue.push('You were defeated...');

        _advanceToMessages('enemy_msg');
    }

    function _endVictory() {
        if (!enemy || enemy.gold == null) { close(); return; }
        const xp = enemy.xp || 0, gold = enemy.gold || 0;
        if (typeof P !== 'undefined') { P.xp = (P.xp || 0) + xp; P.gold = (P.gold || 0) + gold; }
        _floater('+' + xp + ' XP',    W / 2 - 30, H / 2 - 10, '#ffd700');
        _floater('+' + gold + ' Gold', W / 2 + 20, H / 2 + 14, '#c0a030');
        phase = 'victory';
        setTimeout(() => { if (active) close(); }, 3200);
    }

    // ── MINI HELPERS ──────────────────────────────────────────
    function _floater(text, x, y, color) {
        floaters.push({ text, x, y, vy: -26, alpha: 1, color: color || '#fff', timer: 1.2 });
    }
    function _shake(dur) { shakeDur = Math.max(shakeDur, dur); }

    function _getItems() {
        if (typeof P === 'undefined') return [];
        return (P.inv || P.items || []).filter(i => {
            const id = (i.id || '').toLowerCase();
            const t  = (i.type || i.category || '').toLowerCase();
            return t === 'consumable' || id.includes('bomb') || id.includes('potion') || id.includes('ether');
        });
    }

    function _getSkills() {
        if (typeof P !== 'undefined' && Array.isArray(P.skills) && P.skills.length) return P.skills;
        return DEFAULT_SKILLS;
    }

    function _listForTab() {
        switch (activeTab) {
            case 0: return enemy ? enemy.parts : [];
            case 1: return _getSkills().filter(s => !s.sep);
            case 2: return _getItems();
            case 3: return OTHER_OPTIONS;
        }
        return [];
    }

    // ── RENDER ────────────────────────────────────────────────
    // Public entry point — engine.js passes its canvas ctx
    function render(c) { ctx = c; _render(); }

    function _render() {
        ctx.clearRect(0, 0, W, H);
        if (!active) return;

        ctx.save();
        if (shakeX || shakeY) ctx.translate(shakeX, shakeY);

        _rBg();
        _rCombatants();
        _rHUD();
        _rPanel();

        if (flashTimer > 0 && flashColor) {
            ctx.fillStyle = flashColor;
            ctx.fillRect(0, 0, W, H);
        }

        _rFloaters();
        if (animState) _rAnim();

        if (phase === 'victory') _rVictory();
        if (phase === 'defeat')  _rDefeat();

        ctx.restore();
    }

    function _rBg() {
        // Scene area — dark painted base
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, W, SCENE_H);

        // Radial vignette: slightly lighter centre (~#1a1208), dark edges
        const vg = ctx.createRadialGradient(
            W * 0.5, SCENE_H * 0.42, SCENE_H * 0.06,
            W * 0.5, SCENE_H * 0.42, SCENE_H * 0.88
        );
        vg.addColorStop(0, 'rgba(26,18,8,0.55)');
        vg.addColorStop(1, 'rgba(0,0,0,0.84)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, SCENE_H);

        // Panel area
        ctx.fillStyle = '#0a0808';
        ctx.fillRect(0, PANEL_Y, W, PANEL_H);
    }

    function _rCombatants() {
        // ── PLAYER (bottom-left of scene) ─────────────────────
        const pX = 16, pY = SCENE_H - 96, pW = 66, pH = 90;
        ctx.fillStyle = '#1c1628';
        ctx.fillRect(pX, pY, pW, pH);
        ctx.strokeStyle = '#5a4878';
        ctx.lineWidth = 1;
        ctx.strokeRect(pX, pY, pW, pH);

        if (typeof SPRITES_48 !== 'undefined' && SPRITES_48.has('player_down')) {
            const sc = 1.3;
            ctx.save();
            ctx.translate(pX + ((pW - 48 * sc) / 2 | 0), pY + 4);
            ctx.scale(sc, sc);
            SPRITES_48.draw('player_down', ctx, 0, 0, 0);
            ctx.restore();
        } else {
            _drawPlayerSprite(ctx, pX + (pW >> 1), pY + pH - 2);
        }

        if (!enemy) return;

        // ── ENEMY (centred in scene) ──────────────────────────
        const eX = (W - 200) >> 1, eY = 10, eW = 200, eH = 162;
        ctx.fillStyle = '#140e1e';
        ctx.fillRect(eX, eY, eW, eH);
        ctx.strokeStyle = '#6a3040';
        ctx.lineWidth = 2;
        ctx.strokeRect(eX, eY, eW, eH);
        ctx.lineWidth = 1;

        const SPRITE_MAP = {
            enemy_wolf:     'wolf',    enemy_bandit:   'bandit',
            enemy_undead:   'undead',  enemy_spirit:   'spirit',
            enemy_boss:     'boss_guardian',
            giant_rat:      'giant_rat',
            enemy_rat:      'giant_rat',
            enemy_skeleton: 'skeleton',
            skeleton:       'skeleton',
            enemy_goblin:   'goblin',
            goblin:         'goblin',
        };
        const spName = SPRITE_MAP[enemy.sprite];
        const eCx = eX + (eW >> 1);
        const eCy = eY + (eH >> 1);

        if (spName && typeof SPRITES_48 !== 'undefined' && SPRITES_48.has(spName)) {
            const sc = 3;
            ctx.save();
            ctx.translate(eX + ((eW - 48 * sc) / 2 | 0), eY + ((eH - 48 * sc) / 2 | 0));
            ctx.scale(sc, sc);
            SPRITES_48.draw(spName, ctx, 0, 0, 0);
            ctx.restore();
        } else {
            const eName = (enemy.name || '').toLowerCase();
            if      (eName.includes('rat'))                                       _drawRat(ctx, eCx, eCy);
            else if (eName.includes('wolf'))                                      _drawWolf(ctx, eCx, eCy);
            else if (eName.includes('bandit') || eName.includes('gladiator'))     _drawBandit(ctx, eCx, eCy);
            else if (eName.includes('shade') || eName.includes('spirit') || eName.includes('sprite')) _drawSpirit(ctx, eCx, eCy);
            else                                                                  _drawDefaultEnemy(ctx, eCx, eCy);
        }

        // Body part HP indicators
        if (analyzed || activeTab === 0) {
            ctx.textAlign = 'center';
            enemy.parts.forEach((p, i) => {
                const ratio = p.hp / p.maxHp;
                ctx.fillStyle = ratio > 0.6 ? '#60c060' : ratio > 0.3 ? '#c0a030' : ratio > 0 ? '#c03030' : '#333';
                ctx.font = '7px monospace';
                ctx.fillText(p.label.slice(0, 4), eX + 8 + i * 38, eY + eH - 6);
            });
            ctx.textAlign = 'left';
        }

        // Targeting highlight on active tab 0
        if (activeTab === 0 && phase === 'menu') {
            const bx = eX + 6 + selIndex * 38;
            const by = eY + eH - 18;
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, by, 34, 12);
        }

        ctx.lineWidth = 1;
    }

    // ── SPRITE HELPERS ────────────────────────────────────────────

    function _drawPlayerSprite(ctx, cx, bot) {
        // Back-view player. bot = y of feet.
        ctx.fillStyle = '#2a1a0e';
        ctx.fillRect(cx - 18, bot - 10, 14, 10);   // left boot
        ctx.fillRect(cx + 4,  bot - 10, 14, 10);   // right boot
        ctx.fillStyle = '#1e1a14';
        ctx.fillRect(cx - 15, bot - 28, 12, 18);   // left leg
        ctx.fillRect(cx + 3,  bot - 28, 12, 18);   // right leg
        ctx.fillStyle = '#4a3018';
        ctx.fillRect(cx - 20, bot - 36, 40, 8);    // belt
        ctx.fillStyle = '#c0a040';
        ctx.fillRect(cx - 4,  bot - 36, 8, 8);     // buckle
        ctx.fillStyle = '#3a5a3a';
        ctx.fillRect(cx - 20, bot - 62, 40, 26);   // tunic body
        ctx.fillStyle = '#2a4a2a';
        ctx.fillRect(cx - 24, bot - 66, 48, 10);   // shoulders
        ctx.fillStyle = '#3a5a3a';
        ctx.fillRect(cx - 30, bot - 62, 10, 24);   // left arm
        ctx.fillRect(cx + 20, bot - 62, 10, 24);   // right arm
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(cx - 14, bot - 84, 28, 24);   // head/hair
        ctx.fillStyle = '#808090';
        ctx.fillRect(cx + 22, bot - 82, 4, 46);    // sword blade
        ctx.fillStyle = '#604020';
        ctx.fillRect(cx + 20, bot - 40, 8, 10);    // sword guard
    }

    function _drawRat(ctx, cx, cy) {
        // Body
        ctx.fillStyle = '#5a4a3a';
        ctx.beginPath(); ctx.ellipse(cx, cy, 58, 34, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6a5848';
        ctx.beginPath(); ctx.ellipse(cx + 8, cy - 6, 44, 24, 0, 0, Math.PI * 2); ctx.fill();
        // Head
        ctx.fillStyle = '#4a3a2a';
        ctx.beginPath(); ctx.ellipse(cx - 52, cy - 4, 26, 22, -0.2, 0, Math.PI * 2); ctx.fill();
        // Snout
        ctx.fillStyle = '#6a5848';
        ctx.beginPath(); ctx.ellipse(cx - 74, cy, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2a1818';
        ctx.fillRect(cx - 84, cy - 4, 8, 8);
        // Eyes
        ctx.fillStyle = '#ff2020';
        ctx.fillRect(cx - 66, cy - 16, 8, 8);
        ctx.fillStyle = '#ff8080';
        ctx.fillRect(cx - 64, cy - 14, 3, 3);
        // Ears
        ctx.fillStyle = '#4a3a2a';
        ctx.beginPath(); ctx.ellipse(cx - 38, cy - 32, 12, 18, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx - 22, cy - 34, 12, 18,  0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7a5a5a';
        ctx.beginPath(); ctx.ellipse(cx - 38, cy - 32, 7, 12, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx - 22, cy - 34, 7, 12,  0.2, 0, Math.PI * 2); ctx.fill();
        // Teeth
        ctx.fillStyle = '#e8e0c8';
        ctx.fillRect(cx - 80, cy + 4, 6, 10);
        ctx.fillRect(cx - 72, cy + 4, 6, 10);
        // Tail
        ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx + 54, cy + 4);
        ctx.quadraticCurveTo(cx + 80, cy - 22, cx + 88, cy + 14);
        ctx.stroke();
        ctx.lineWidth = 1;
        // Legs
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(cx - 28, cy + 30, 12, 18);
        ctx.fillRect(cx - 8,  cy + 32, 12, 18);
        ctx.fillRect(cx + 10, cy + 32, 12, 18);
        ctx.fillRect(cx + 26, cy + 28, 12, 16);
    }

    function _drawWolf(ctx, cx, cy) {
        // Body
        ctx.fillStyle = '#484848';
        ctx.beginPath(); ctx.ellipse(cx, cy, 64, 40, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#606060';
        ctx.beginPath(); ctx.ellipse(cx + 6, cy - 6, 48, 28, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#787878';
        ctx.beginPath(); ctx.ellipse(cx - 6, cy - 2, 26, 18, 0, 0, Math.PI * 2); ctx.fill();
        // Head
        ctx.fillStyle = '#484848';
        ctx.beginPath(); ctx.ellipse(cx - 56, cy - 12, 30, 26, -0.15, 0, Math.PI * 2); ctx.fill();
        // Snout
        ctx.fillStyle = '#585858';
        ctx.beginPath(); ctx.ellipse(cx - 82, cy - 6, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#181818';
        ctx.fillRect(cx - 98, cy - 10, 10, 10);
        // Eyes
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(cx - 72, cy - 22, 10, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(cx - 70, cy - 21, 4, 6);
        // Ears
        ctx.fillStyle = '#383838';
        ctx.beginPath();
        ctx.moveTo(cx - 40, cy - 36); ctx.lineTo(cx - 52, cy - 64); ctx.lineTo(cx - 66, cy - 36);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 38); ctx.lineTo(cx - 30, cy - 66); ctx.lineTo(cx - 46, cy - 38);
        ctx.fill();
        // Mouth / teeth
        ctx.fillStyle = '#200808';
        ctx.fillRect(cx - 96, cy - 2, 22, 10);
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(cx - 92, cy, 5, 8);
        ctx.fillRect(cx - 84, cy, 5, 8);
        ctx.fillRect(cx - 77, cy + 1, 4, 7);
        // Legs
        ctx.fillStyle = '#383838';
        ctx.fillRect(cx - 30, cy + 36, 14, 26);
        ctx.fillRect(cx - 6,  cy + 38, 14, 26);
        ctx.fillRect(cx + 18, cy + 36, 14, 26);
        ctx.fillRect(cx + 40, cy + 34, 14, 22);
        // Tail
        ctx.strokeStyle = '#505050'; ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(cx + 58, cy - 4);
        ctx.quadraticCurveTo(cx + 86, cy - 36, cx + 94, cy - 10);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    function _drawBandit(ctx, cx, cy) {
        // Legs
        ctx.fillStyle = '#252330';
        ctx.fillRect(cx - 20, cy + 18, 16, 34);
        ctx.fillRect(cx + 4,  cy + 18, 16, 34);
        // Boots
        ctx.fillStyle = '#181210';
        ctx.fillRect(cx - 22, cy + 44, 20, 12);
        ctx.fillRect(cx + 2,  cy + 44, 20, 12);
        // Body / armor
        ctx.fillStyle = '#3a2820';
        ctx.fillRect(cx - 26, cy - 32, 52, 50);
        ctx.fillStyle = '#4a3428';
        ctx.fillRect(cx - 24, cy - 30, 48, 46);
        // Belt
        ctx.fillStyle = '#5a3a18';
        ctx.fillRect(cx - 26, cy + 16, 52, 8);
        ctx.fillStyle = '#c0a030';
        ctx.fillRect(cx - 4,  cy + 16, 8, 8);
        // Arms
        ctx.fillStyle = '#3a2820';
        ctx.fillRect(cx - 40, cy - 28, 14, 40);
        ctx.fillRect(cx + 26, cy - 28, 14, 40);
        // Weapon
        ctx.fillStyle = '#808898';
        ctx.fillRect(cx + 36, cy - 52, 5, 58);
        ctx.fillStyle = '#8a7030';
        ctx.fillRect(cx + 30, cy + 2,  18, 8);
        ctx.fillStyle = '#5a3818';
        ctx.fillRect(cx + 37, cy + 8,  4, 12);
        // Head
        ctx.fillStyle = '#8a6a50';
        ctx.fillRect(cx - 18, cy - 62, 36, 32);
        // Hood
        ctx.fillStyle = '#242028';
        ctx.fillRect(cx - 20, cy - 68, 40, 22);
        ctx.fillRect(cx - 14, cy - 78, 28, 14);
        // Eyes
        ctx.fillStyle = '#cc2020';
        ctx.fillRect(cx - 10, cy - 54, 8, 7);
        ctx.fillRect(cx + 2,  cy - 54, 8, 7);
    }

    function _drawSpirit(ctx, cx, cy) {
        const t   = performance.now() / 800;
        const bob = Math.sin(t) * 5 | 0;
        const by  = cy + bob;
        // Outer glow
        ctx.fillStyle = 'rgba(80,140,255,0.10)';
        ctx.beginPath(); ctx.ellipse(cx, by, 58, 64, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(100,160,255,0.18)';
        ctx.beginPath(); ctx.ellipse(cx, by, 42, 50, 0, 0, Math.PI * 2); ctx.fill();
        // Body
        ctx.fillStyle = 'rgba(130,190,255,0.72)';
        ctx.beginPath(); ctx.ellipse(cx, by, 28, 40, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(200,230,255,0.5)';
        ctx.beginPath(); ctx.ellipse(cx - 6, by - 10, 14, 18, 0, 0, Math.PI * 2); ctx.fill();
        // Face
        ctx.fillStyle = 'rgba(10,10,50,0.92)';
        ctx.fillRect(cx - 14, by - 14, 10, 9);
        ctx.fillRect(cx + 4,  by - 14, 10, 9);
        ctx.fillRect(cx - 8,  by + 4,  16, 7);
        // Tendrils
        ctx.strokeStyle = 'rgba(150,210,255,0.55)'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 22, by + 38);
        ctx.quadraticCurveTo(cx - 36, by + 54, cx - 22, by + 68);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, by + 40);
        ctx.quadraticCurveTo(cx + 6, by + 60, cx - 2, by + 72);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 22, by + 38);
        ctx.quadraticCurveTo(cx + 36, by + 52, cx + 24, by + 66);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    function _drawDefaultEnemy(ctx, cx, cy) {
        ctx.fillStyle = '#604848';
        ctx.fillRect(cx - 28, cy - 50, 56, 70);
        ctx.fillStyle = '#705858';
        ctx.fillRect(cx - 22, cy - 46, 44, 62);
        ctx.fillStyle = '#504038';
        ctx.fillRect(cx - 22, cy - 68, 44, 22);
        ctx.fillStyle = '#ff3838';
        ctx.fillRect(cx - 10, cy - 60, 8, 7);
        ctx.fillRect(cx + 2,  cy - 60, 8, 7);
        ctx.fillStyle = '#402820';
        ctx.fillRect(cx - 18, cy + 20, 14, 26);
        ctx.fillRect(cx + 4,  cy + 20, 14, 26);
    }

    function _rHUD() {
        const hp = _hp(), maxHp = _maxHp();
        const mp = _mp(), maxMp = _maxMp();

        // Player stats — top-left of scene area
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(4, 4, 140, buffed ? 46 : 36);

        _bar(ctx, 4,  6, 140, 9, hp, maxHp, '#6a1a1a', '#1a0808');
        ctx.fillStyle = '#ff9999';
        ctx.font = '10px Georgia';
        ctx.fillText('HP ' + hp + '/' + maxHp, 6, 14);

        _bar(ctx, 4, 20, 140, 9, mp, maxMp, '#1a4a8b', '#08081a');
        ctx.fillStyle = '#6ab0ff';
        ctx.font = '10px Georgia';
        ctx.fillText('MP ' + mp + '/' + maxMp, 6, 28);

        if (buffed) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '9px Georgia';
            ctx.fillText('ATK+ (' + buffTurns + ' turns)', 6, 40);
        }
    }

    function _bar(c, x, y, w, h, val, max, fg, bg) {
        c.fillStyle = bg || '#111';
        c.fillRect(x, y, w, h);
        const f = max > 0 ? Math.max(0, Math.min(1, val / max)) : 0;
        c.fillStyle = fg || '#4a8a4a';
        c.fillRect(x, y, Math.floor(w * f), h);
        c.strokeStyle = 'rgba(255,255,255,0.08)';
        c.strokeRect(x, y, w, h);
    }

    function _rPanel() {
        // Top border
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, PANEL_Y);
        ctx.lineTo(W, PANEL_Y);
        ctx.stroke();

        // Vertical separator at x=156
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#3a2a1a';
        ctx.beginPath();
        ctx.moveTo(SEP_X, PANEL_Y);
        ctx.lineTo(SEP_X, H);
        ctx.stroke();
        ctx.lineWidth = 1;

        const isMsg = phase === 'player_msg' || phase === 'enemy_msg';
        if (isMsg) { _rMessage(); return; }

        _rLeftPanel();
        _rRightPanel();
    }

    function _rLeftPanel() {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, PANEL_Y, SEP_X, PANEL_H);
        ctx.clip();

        const lx = 8;

        // Current category header
        ctx.fillStyle = '#5a4a3a';
        ctx.font = '10px Georgia';
        ctx.fillText(TABS[activeTab].toUpperCase(), lx, PANEL_Y + 12);

        // Item list
        const items  = _listForTab();
        const startY = PANEL_Y + 26;
        const rowH   = 16;

        for (let i = 0; i < items.length; i++) {
            const it   = items[i];
            const sel  = i === selIndex;
            const y    = startY + i * rowH;
            if (y > H - 10) break;

            const dead = (activeTab === 0 && it.hp <= 0);
            let label  = (it.label || it.name || it.id || '').slice(0, 12);

            if (sel) {
                ctx.fillStyle = '#3d1a1a';
                ctx.fillRect(0, y - 12, SEP_X, rowH);
            }

            ctx.fillStyle = sel ? '#e8d5a0' : dead ? '#4a3030' : '#8a7a6a';
            ctx.font = '13px Georgia';
            ctx.fillText((sel ? '>' : ' ') + ' ' + label, lx, y);
        }

        if (items.length === 0) {
            ctx.fillStyle = '#4a3a2a';
            ctx.font = '12px Georgia';
            ctx.fillText('  — empty —', lx, startY);
        }

        // Nav hint
        ctx.fillStyle = '#3a2a1a';
        ctx.font = '9px Georgia';
        ctx.fillText('Z/S nav  Q/D tab  E ok', lx, H - 3);

        ctx.restore();
    }

    function _rRightPanel() {
        if (!enemy) return;

        const rx = SEP_X + 12;
        let   y  = PANEL_Y + 16;

        // Enemy name
        ctx.fillStyle = '#c89a7a';
        ctx.font = 'bold 14px Georgia';
        ctx.fillText(enemy.name.toUpperCase(), rx, y);
        y += 22;

        // Body bar (HP)
        ctx.fillStyle = '#ff9999';
        ctx.font = '12px Georgia';
        ctx.fillText('BODY', rx, y);
        _bar(ctx, rx + 36, y - 9, 200, 10, enemy.hp, enemy.maxHp, '#8b1a1a', '#1a0a0a');
        ctx.fillStyle = '#7a5a5a';
        ctx.font = '11px Georgia';
        ctx.fillText(enemy.hp + '/' + enemy.maxHp, rx + 242, y);
        y += 18;

        // Mind bar (uses enemy.mind if present, else derives from maxHp)
        const maxMind = enemy.maxMind || Math.ceil(enemy.maxHp * 0.5);
        const mind    = enemy.mind !== undefined ? enemy.mind : maxMind;
        ctx.fillStyle = '#6ab0ff';
        ctx.font = '12px Georgia';
        ctx.fillText('MIND', rx, y);
        _bar(ctx, rx + 36, y - 9, 200, 10, mind, maxMind, '#1a4a8b', '#080a1a');
        ctx.fillStyle = '#5a7a9a';
        ctx.font = '11px Georgia';
        ctx.fillText(mind + '/' + maxMind, rx + 242, y);
        y += 20;

        _rContextInfo(rx, y);
    }

    function _rContextInfo(rx, y) {
        if (!enemy) return;
        ctx.font = '12px Georgia';

        switch (activeTab) {
            case 0: {
                if (selIndex >= BODY_PARTS.length) break;
                const bp  = BODY_PARTS[selIndex];
                const ep  = enemy.parts[selIndex];
                const atk = _atk() * (buffed ? 1.5 : 1);
                const lo  = Math.max(1, Math.floor(atk * bp.dmgMul * 0.8 - enemy.def * 0.5));
                const hi  = Math.max(1, Math.floor(atk * bp.dmgMul * 1.2 - enemy.def * 0.5));
                ctx.fillStyle = ep.hp <= 0 ? '#7a3030' : '#8a7a6a';
                ctx.fillText('Hit ' + bp.hit + '%   Dmg ' + lo + '–' + hi +
                    (ep.hp <= 0 ? '   [DESTROYED]' : ''), rx, y);
                break;
            }
            case 1: {
                const sk = _getSkills().filter(s => !s.sep)[selIndex];
                if (!sk) break;
                const grey = (sk.mp || 0) > _mp();
                ctx.fillStyle = grey ? '#883030' : '#8a8070';
                ctx.fillText((sk.desc || '') + (sk.mp ? '  (' + sk.mp + ' MP)' : ''), rx, y);
                if (grey) {
                    y += 14;
                    ctx.fillStyle = '#aa3030';
                    ctx.fillText('Not enough MP!', rx, y);
                }
                break;
            }
            case 2: {
                const it = _getItems()[selIndex];
                if (it && it.desc) {
                    ctx.fillStyle = '#8a8070';
                    ctx.fillText(it.desc, rx, y);
                }
                break;
            }
            case 3: {
                const opt = OTHER_OPTIONS[selIndex];
                if (opt) {
                    ctx.fillStyle = opt.id === 'give_up' ? '#aa3030' : '#8a8070';
                    ctx.fillText(opt.desc || '', rx, y);
                }
                break;
            }
        }

        if (analyzed) {
            ctx.fillStyle = '#7a7a9a';
            ctx.font = '11px Georgia';
            ctx.fillText('ATK ' + enemy.atk + '   DEF ' + enemy.def, rx, y + 14);
        }
    }

    function _rMessage() {
        const msg = msgQueue[0] || '';

        // Left panel stays visible (dimmed)
        _rLeftPanel();

        // Message in right panel
        ctx.fillStyle = '#c0b0a0';
        ctx.font = '13px Georgia';

        const maxW = W - SEP_X - 24;
        let words  = msg.split(' '), line = '', my = PANEL_Y + 22;
        for (const w of words) {
            const test = line ? line + ' ' + w : w;
            if (ctx.measureText(test).width > maxW && line) {
                ctx.fillText(line, SEP_X + 12, my);
                line = w; my += 16;
            } else { line = test; }
        }
        if (line) ctx.fillText(line, SEP_X + 12, my);

        // Continue prompt
        if (Math.floor(performance.now() / 450) % 2 === 0) {
            ctx.fillStyle = '#5a4a3a';
            ctx.font = '11px Georgia';
            ctx.fillText('▼ E', SEP_X + 12, H - 5);
        }
    }

    function _rFloaters() {
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        for (const f of floaters) {
            ctx.globalAlpha = f.alpha;
            ctx.fillStyle   = f.color;
            ctx.fillText(f.text, f.x, f.y);
        }
        ctx.globalAlpha = 1;
        ctx.textAlign   = 'left';
    }

    function _rAnim() {
        if (!animState) return;
        const t = 1 - animState.timer / animState.dur;

        ctx.save();

        if (animState.type === 'slash') {
            ctx.globalAlpha = Math.max(0, 1 - t * 2.2);
            ctx.strokeStyle = '#ff7050';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(animState.x - 28, animState.y - 18);
            ctx.lineTo(animState.x + 28, animState.y + 18);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(animState.x + 28, animState.y - 18);
            ctx.lineTo(animState.x - 18, animState.y + 18);
            ctx.stroke();

        } else if (animState.type === 'magic') {
            ctx.globalAlpha = Math.max(0, 1 - t * 1.6);
            ctx.strokeStyle = '#80c0ff';
            ctx.lineWidth = 2;
            const r = t * 44;
            ctx.beginPath();
            ctx.arc(animState.x, animState.y + 68, r, 0, Math.PI * 2);
            ctx.stroke();

        } else if (animState.type === 'heal') {
            ctx.globalAlpha = Math.max(0, 1 - t * 1.6);
            ctx.fillStyle = '#60ff80';
            ctx.font = '18px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('✦', animState.x + 33, animState.y - t * 22);

        } else if (animState.type === 'buff') {
            ctx.globalAlpha = Math.max(0, 1 - t * 1.6);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('↑ ATK ↑', animState.x + 33, animState.y - t * 18);
        }

        ctx.globalAlpha = 1;
        ctx.lineWidth   = 1;
        ctx.textAlign   = 'left';
        ctx.restore();
    }

    function _rVictory() {
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VICTORY', W / 2, H / 2 - 12);
        ctx.fillStyle = '#c0b8a0';
        ctx.font = '11px monospace';
        ctx.fillText('+' + (enemy?.xp || 0) + ' XP     +' + (enemy?.gold || 0) + ' Gold', W / 2, H / 2 + 12);
        ctx.textAlign = 'left';
    }

    function _rDefeat() {
        ctx.fillStyle = 'rgba(0,0,0,0.82)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#c03040';
        ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DEFEAT', W / 2, H / 2 - 12);
        ctx.fillStyle = '#806878';
        ctx.font = '11px monospace';
        ctx.fillText('You have fallen...', W / 2, H / 2 + 12);
        ctx.textAlign = 'left';
        setTimeout(() => { if (active) close(); }, 3200);
    }

    // ── KEYBOARD ──────────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if (!active) return;

        // Skip text during message phases
        if (phase === 'player_msg' || phase === 'enemy_msg') {
            if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                _nextMessage();
            }
            return;
        }

        if (phase !== 'menu') return;

        switch (e.code) {
            case 'KeyZ': case 'ArrowUp': {
                e.preventDefault();
                selIndex = Math.max(0, selIndex - 1);
                break;
            }
            case 'KeyS': case 'ArrowDown': {
                e.preventDefault();
                const max = Math.max(0, _listForTab().length - 1);
                selIndex = Math.min(max, selIndex + 1);
                break;
            }
            case 'KeyQ': case 'ArrowLeft':
                e.preventDefault();
                activeTab = (activeTab - 1 + TABS.length) % TABS.length;
                selIndex  = 0;
                break;
            case 'KeyD': case 'ArrowRight':
                e.preventDefault();
                activeTab = (activeTab + 1) % TABS.length;
                selIndex  = 0;
                break;
            case 'KeyE': case 'Space': case 'Enter':
                e.preventDefault();
                _confirm();
                break;
            case 'Escape':
                e.preventDefault();
                selIndex  = 0;
                activeTab = 0;
                break;
        }
    });

    function _confirm() {
        switch (activeTab) {
            case 0:
                _doAttack(selIndex);
                break;
            case 1: {
                const sk = _getSkills().filter(s => !s.sep)[selIndex];
                if (sk) _doSkill(sk);
                break;
            }
            case 2: {
                const it = _getItems()[selIndex];
                if (it) _doItem(it);
                break;
            }
            case 3:
                _doOther(OTHER_OPTIONS[selIndex]);
                break;
        }
    }

    return { start, close, update, render, isActive: () => active };

})();

console.log('[CombatFull] Loaded');
