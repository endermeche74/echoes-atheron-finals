/*************************************************************
 * combat_full.js — Fear & Hunger Style Combat System
 * Tabs: ATTACK · SKILLS · ITEMS · OTHER
 * Canvas overlay, own RAF loop, AZERTY (ZQSD) controls
 *************************************************************/

const CombatFull = (function() {

    // ── LAYOUT ────────────────────────────────────────────────
    const W        = CONFIG.CANVAS_W;   // 624
    const H        = CONFIG.CANVAS_H;   // 336
    const PANEL_Y  = 192;
    const PANEL_H  = H - PANEL_Y - 4;  // 140
    const PANEL_X  = 6;
    const PANEL_W  = W - 12;
    const TAB_H    = 22;
    const CON_Y    = PANEL_Y + TAB_H + 2;   // content top
    const CON_H    = PANEL_H - TAB_H - 14;  // content height (leave hint bar)

    // ── STATIC DATA ───────────────────────────────────────────
    const TABS = ['ATTACK', 'SKILLS', 'ITEMS', 'OTHER'];

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

    // ── OVERLAY CANVAS ────────────────────────────────────────
    let canvas = null;
    let ctx    = null;

    function _createOverlay() {
        if (canvas) return;
        const container = document.getElementById('canvas-container');
        if (!container) return;
        canvas = document.createElement('canvas');
        canvas.id     = 'combat-full-canvas';
        canvas.width  = W;
        canvas.height = H;
        canvas.style.cssText = `
            position:absolute;top:0;left:0;
            width:100%;height:100%;
            pointer-events:none;
            image-rendering:pixelated;
            z-index:15;
        `;
        container.appendChild(canvas);
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        let lastT = performance.now();
        (function loop(now) {
            const dt = Math.min((now - lastT) / 1000, 0.1);
            lastT = now;
            _update(dt);
            _render();
            requestAnimationFrame(loop);
        })(lastT);
    }

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
            parts: BODY_PARTS.map(p => ({ ...p, hp: p.maxHp })),
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
    function _update(dt) {
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
    function _render() {
        ctx.clearRect(0, 0, W, H);
        if (!active) return;

        ctx.save();
        if (shakeX || shakeY) ctx.translate(shakeX, shakeY);

        if (flashTimer > 0 && flashColor) {
            ctx.fillStyle = flashColor;
            ctx.fillRect(0, 0, W, H);
        }

        _rBg();
        _rCombatants();
        _rHUD();
        _rPanel();
        _rFloaters();
        if (animState) _rAnim();

        if (phase === 'victory') _rVictory();
        if (phase === 'defeat')  _rDefeat();

        ctx.restore();
    }

    function _rBg() {
        const g = ctx.createLinearGradient(0, 0, 0, PANEL_Y);
        g.addColorStop(0, '#090710');
        g.addColorStop(1, '#180e24');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        const v = ctx.createRadialGradient(W/2, H*0.4, H*0.1, W/2, H*0.4, H*0.75);
        v.addColorStop(0, 'rgba(0,0,0,0)');
        v.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, W, PANEL_Y);
    }

    function _rCombatants() {
        // Player silhouette (left)
        const pX = 38, pY = 88, pW = 66, pH = 90;
        ctx.fillStyle = '#1c1628';
        ctx.fillRect(pX, pY, pW, pH);
        ctx.strokeStyle = '#5a4878';
        ctx.lineWidth = 1;
        ctx.strokeRect(pX, pY, pW, pH);
        ctx.fillStyle = '#7a6a90';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOU', pX + pW/2, pY + pH/2 + 3);

        if (!enemy) return;

        // Enemy sprite (right)
        const eX = 355, eY = 18, eW = 200, eH = 162;
        ctx.fillStyle = '#140e1e';
        ctx.fillRect(eX, eY, eW, eH);
        ctx.strokeStyle = '#6a3040';
        ctx.lineWidth = 2;
        ctx.strokeRect(eX, eY, eW, eH);
        ctx.lineWidth = 1;

        ctx.fillStyle = '#c08090';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.name.toUpperCase(), eX + eW/2, eY + eH/2 - 4);

        // Part HP dots along the enemy base
        if (analyzed || activeTab === 0) {
            enemy.parts.forEach((p, i) => {
                const ratio = p.hp / p.maxHp;
                ctx.fillStyle = ratio > 0.6 ? '#60c060' : ratio > 0.3 ? '#c0a030' : ratio > 0 ? '#c03030' : '#333';
                ctx.font = '7px monospace';
                ctx.fillText(p.label.slice(0,4), eX + 8 + i * 38, eY + eH - 6);
            });
        }

        // Targeting highlight on active tab 0
        if (activeTab === 0 && phase === 'menu' && enemy) {
            const bx = eX + 6 + selIndex * 38;
            const by = eY + eH - 18;
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, by, 34, 12);
        }

        ctx.textAlign = 'left';
        ctx.lineWidth = 1;
    }

    function _rHUD() {
        const hp = _hp(), maxHp = _maxHp();
        const mp = _mp(), maxMp = _maxMp();

        // Player HP/MP (top left)
        ctx.fillStyle = 'rgba(8,6,16,0.86)';
        ctx.fillRect(4, 4, 172, buffed ? 48 : 38);
        ctx.strokeStyle = '#2e2c44';
        ctx.strokeRect(4, 4, 172, buffed ? 48 : 38);

        _bar(ctx, 26, 8,  142, 10, hp, maxHp, '#3a8040', '#0e1a0e');
        ctx.fillStyle = '#a0b8a0'; ctx.font = '8px monospace';
        ctx.fillText('HP ' + hp + '/' + maxHp, 28, 17);

        _bar(ctx, 26, 22, 142, 10, mp, maxMp, '#3a5a90', '#0e0e1a');
        ctx.fillStyle = '#a0a0c0';
        ctx.fillText('MP ' + mp + '/' + maxMp, 28, 31);

        if (buffed) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '8px monospace';
            ctx.fillText('ATK+ (' + buffTurns + ' turns)', 8, 46);
        }

        if (!enemy) return;

        // Enemy HP (top right)
        const ew = 192, ex = W - ew - 4;
        ctx.fillStyle = 'rgba(8,6,16,0.86)';
        ctx.fillRect(ex, 4, ew, analyzed ? 38 : 28);
        ctx.strokeStyle = '#2e2c44';
        ctx.strokeRect(ex, 4, ew, analyzed ? 38 : 28);

        ctx.fillStyle = '#c07080';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(enemy.name.toUpperCase(), ex + 6, 14);

        _bar(ctx, ex + 6, 17, ew - 12, 9, enemy.hp, enemy.maxHp, '#8a3040', '#2a0e10');
        ctx.fillStyle = '#a09090'; ctx.font = '8px monospace';
        ctx.fillText(enemy.hp + '/' + enemy.maxHp, ex + 8, 25);

        if (analyzed) {
            ctx.fillStyle = '#8888aa';
            ctx.font = '7px monospace';
            ctx.fillText('ATK:' + enemy.atk + '  DEF:' + enemy.def, ex + 6, 36);
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
        // Background
        ctx.fillStyle = 'rgba(6,5,14,0.97)';
        ctx.fillRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
        ctx.strokeStyle = '#302e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);
        ctx.lineWidth = 1;

        // Separator between tabs and content
        ctx.strokeStyle = '#302e50';
        ctx.beginPath();
        ctx.moveTo(PANEL_X, PANEL_Y + TAB_H);
        ctx.lineTo(PANEL_X + PANEL_W, PANEL_Y + TAB_H);
        ctx.stroke();

        // Tabs
        const tw = Math.floor(PANEL_W / TABS.length);
        for (let i = 0; i < TABS.length; i++) {
            const tx  = PANEL_X + i * tw;
            const sel = i === activeTab;
            ctx.fillStyle = sel ? 'rgba(45,35,75,0.95)' : 'rgba(16,13,28,0.7)';
            ctx.fillRect(tx, PANEL_Y, tw, TAB_H);
            if (sel) {
                ctx.fillStyle = '#8060c0';
                ctx.fillRect(tx, PANEL_Y, tw, 2);
            }
            ctx.strokeStyle = sel ? '#7050b0' : '#2a2840';
            ctx.strokeRect(tx, PANEL_Y, tw, TAB_H);
            ctx.fillStyle = sel ? '#d4a840' : '#605868';
            ctx.font = sel ? 'bold 10px monospace' : '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(TABS[i], tx + tw / 2, PANEL_Y + 14);
        }
        ctx.textAlign = 'left';

        // Content
        const isMsg = phase === 'player_msg' || phase === 'enemy_msg';
        if (isMsg) {
            _rMessage();
        } else {
            switch (activeTab) {
                case 0: _rAttackTab(); break;
                case 1: _rSkillsTab(); break;
                case 2: _rItemsTab();  break;
                case 3: _rOtherTab();  break;
            }
        }

        // Hint bar
        ctx.fillStyle = '#2e2c40';
        ctx.font = '8px monospace';
        ctx.fillText('Z/S: Navigate   Q/D: Tab   E: Confirm   Esc: Back', PANEL_X + 8, PANEL_Y + PANEL_H - 5);
    }

    function _rMessage() {
        const msg = msgQueue[0] || '';
        ctx.fillStyle = '#c0b8a0';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(msg, W / 2, CON_Y + CON_H / 2);
        if (Math.floor(performance.now() / 450) % 2 === 0) {
            ctx.fillStyle = '#5050a0';
            ctx.fillText('▼ E to continue', W / 2, CON_Y + CON_H / 2 + 18);
        }
        ctx.textAlign = 'left';
    }

    function _rAttackTab() {
        const lx = PANEL_X + 8;
        const rx = PANEL_X + Math.floor(PANEL_W * 0.56);
        let y = CON_Y + 14;

        for (let i = 0; i < BODY_PARTS.length; i++) {
            const bp  = BODY_PARTS[i];
            const ep  = enemy.parts[i];
            const sel = i === selIndex;
            const dead = ep.hp <= 0;

            if (sel) {
                ctx.fillStyle = 'rgba(70,55,18,0.55)';
                ctx.fillRect(lx - 2, y - 11, Math.floor(PANEL_W * 0.53), 14);
            }

            ctx.fillStyle = sel ? '#ffd700' : dead ? '#3a3840' : '#b0a898';
            ctx.font = sel ? 'bold 10px monospace' : '10px monospace';
            ctx.fillText((sel ? '► ' : '  ') + bp.label, lx, y);

            _bar(ctx, lx + 74, y - 9, 62, 8, ep.hp, ep.maxHp,
                ep.hp > ep.maxHp * 0.5 ? '#3a8040' : ep.hp > ep.maxHp * 0.2 ? '#8a7820' : '#8a2820',
                '#120e0e');
            ctx.fillStyle = dead ? '#3a3840' : '#706870';
            ctx.font = '8px monospace';
            ctx.fillText(ep.hp + '/' + ep.maxHp, lx + 138, y);

            y += 16;
        }

        // Detail panel (right column)
        if (enemy && selIndex < BODY_PARTS.length) {
            const bp  = BODY_PARTS[selIndex];
            const ep  = enemy.parts[selIndex];
            const atk = _atk() * (buffed ? 1.5 : 1);
            const lo  = Math.max(1, Math.floor(atk * bp.dmgMul * 0.8 - enemy.def * 0.5));
            const hi  = Math.max(1, Math.floor(atk * bp.dmgMul * 1.2 - enemy.def * 0.5));

            ctx.fillStyle = '#5a5468';
            ctx.font = '9px monospace';
            ctx.fillText('Target:   ' + bp.label,         rx, CON_Y + 14);
            ctx.fillStyle = ep.hp <= 0 ? '#444' : '#a0a0b8';
            ctx.fillText('Hit rate: ' + bp.hit + '%',     rx, CON_Y + 28);
            ctx.fillText('Damage:   ' + lo + ' – ' + hi, rx, CON_Y + 42);
            ctx.fillStyle = '#c0a030';
            ctx.fillText('Crit ×1.8: ~' + Math.floor(hi * 1.8), rx, CON_Y + 56);
            if (ep.hp <= 0) {
                ctx.fillStyle = '#aa3030';
                ctx.fillText('DESTROYED', rx, CON_Y + 72);
            }
        }
    }

    function _rSkillsTab() {
        const skills = _getSkills();
        const lx = PANEL_X + 8;
        const rx = PANEL_X + Math.floor(PANEL_W * 0.56);
        let y = CON_Y + 14;
        let ri = 0;   // real index (non-sep)

        for (let i = 0; i < skills.length; i++) {
            const sk = skills[i];
            if (sk.sep) {
                ctx.fillStyle = '#302e48';
                ctx.font = '9px monospace';
                ctx.fillText(sk.name, lx + 18, y);
                y += 13; continue;
            }
            const sel  = ri === selIndex;
            const grey = (sk.mp || 0) > _mp();

            if (sel) {
                ctx.fillStyle = 'rgba(70,55,18,0.55)';
                ctx.fillRect(lx - 2, y - 11, Math.floor(PANEL_W * 0.53), 14);
            }

            ctx.fillStyle = grey ? '#3a3840' : sel ? '#ffd700' : '#b0a898';
            ctx.font = sel ? 'bold 10px monospace' : '10px monospace';
            ctx.fillText((sel ? '► ' : '  ') + sk.name, lx, y);

            ctx.fillStyle = grey ? '#3a3840' : '#507090';
            ctx.font = '9px monospace';
            ctx.fillText(sk.mp + ' MP', lx + 178, y);

            if (sel) {
                ctx.fillStyle = '#908898';
                ctx.font = '9px monospace';
                ctx.fillText(sk.desc || '', rx, CON_Y + 18);
                if (grey) { ctx.fillStyle = '#883030'; ctx.fillText('Not enough MP!', rx, CON_Y + 32); }
            }

            y += 15; ri++;
        }
    }

    function _rItemsTab() {
        const items = _getItems();
        const lx = PANEL_X + 8;
        const rx = PANEL_X + Math.floor(PANEL_W * 0.56);
        let y = CON_Y + 14;

        if (items.length === 0) {
            ctx.fillStyle = '#484050';
            ctx.font = '10px monospace';
            ctx.fillText('  No usable items.', lx, y);
            return;
        }

        for (let i = 0; i < items.length; i++) {
            const it  = items[i];
            const sel = i === selIndex;

            if (sel) {
                ctx.fillStyle = 'rgba(70,55,18,0.55)';
                ctx.fillRect(lx - 2, y - 11, Math.floor(PANEL_W * 0.53), 14);
            }

            ctx.fillStyle = sel ? '#ffd700' : '#b0a898';
            ctx.font = sel ? 'bold 10px monospace' : '10px monospace';
            ctx.fillText((sel ? '► ' : '  ') + (it.name || it.id), lx, y);

            const qty = it.qty || it.count || 1;
            ctx.fillStyle = '#607080';
            ctx.font = '9px monospace';
            ctx.fillText('x' + qty, lx + 178, y);

            if (sel && it.desc) {
                ctx.fillStyle = '#908898';
                ctx.font = '9px monospace';
                ctx.fillText(it.desc, rx, CON_Y + 18);
            }

            y += 15;
        }
    }

    function _rOtherTab() {
        const lx = PANEL_X + 8;
        const rx = PANEL_X + Math.floor(PANEL_W * 0.56);
        let y = CON_Y + 14;

        for (let i = 0; i < OTHER_OPTIONS.length; i++) {
            const opt = OTHER_OPTIONS[i];
            const sel = i === selIndex;

            if (sel) {
                ctx.fillStyle = 'rgba(70,55,18,0.55)';
                ctx.fillRect(lx - 2, y - 11, Math.floor(PANEL_W * 0.53), 14);
            }

            ctx.fillStyle = (opt.id === 'give_up') ? (sel ? '#ff6060' : '#7a3030')
                           : sel ? '#ffd700' : '#b0a898';
            ctx.font = sel ? 'bold 10px monospace' : '10px monospace';
            ctx.fillText((sel ? '► ' : '  ') + opt.label, lx, y);

            if (opt.id === 'flee') {
                ctx.fillStyle = '#507090';
                ctx.font = '9px monospace';
                ctx.fillText('45 %', lx + 178, y);
            }

            if (sel) {
                ctx.fillStyle = '#908898';
                ctx.font = '9px monospace';
                ctx.fillText(opt.desc, rx, CON_Y + 18);
            }

            y += 15;
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

    // ── INIT ──────────────────────────────────────────────────
    function init() {
        const c = document.getElementById('canvas-container');
        if (c) { _createOverlay(); return; }
        let n = 0;
        const t = setInterval(() => {
            if (document.getElementById('canvas-container') || ++n > 40) {
                clearInterval(t); _createOverlay();
            }
        }, 100);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    return { start, close, isActive: () => active };

})();

console.log('[CombatFull] Loaded');
