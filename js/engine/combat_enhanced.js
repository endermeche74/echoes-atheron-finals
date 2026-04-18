/*************************************************************
 * combat_enhanced.js — HD Canvas Combat System
 * Replaces combat_canvas_integration's rendering with
 * a full UI_HD-styled combat overlay.
 * Load after: ui_hd.js, sprites_48.js, engine.js
 *************************************************************/

const CombatEnhanced = (function() {
    'use strict';

    // ── CONFIG ────────────────────────────────────────────────
    const W  = () => CONFIG.CANVAS_W;
    const H  = () => CONFIG.CANVAS_H;

    const ACTIONS = [
        { id: 'attack', label: 'Attack',  key: 'Z', needsLimb: true  },
        { id: 'defend', label: 'Defend',  key: 'Q', needsLimb: false },
        { id: 'item',   label: 'Item',    key: 'S', needsLimb: false },
        { id: 'flee',   label: 'Flee',    key: 'D', needsLimb: false },
    ];

    const LIMBS = [
        { key: 'HEAD',      label: 'Head',  dmg: 1.5, hit: 0.60, crit: 0.30 },
        { key: 'L_ARM',     label: 'L.Arm', dmg: 0.8, hit: 0.75, crit: 0.05 },
        { key: 'TORSO',     label: 'Torso', dmg: 1.0, hit: 0.90, crit: 0.10 },
        { key: 'R_ARM',     label: 'R.Arm', dmg: 0.8, hit: 0.75, crit: 0.05 },
        { key: 'LEGS',      label: 'Legs',  dmg: 0.7, hit: 0.80, crit: 0.05 },
    ];

    // ── STATE ─────────────────────────────────────────────────
    let active      = false;
    let phase       = 'select';   // select | limb | animate | enemy_turn | result
    let menuIdx     = 0;
    let limbIdx     = 2;          // default TORSO
    let combatLog   = [];
    let turnCount   = 0;

    let player      = null;
    let enemy       = null;
    let selectedAct = null;

    // Animation
    let animTimer   = 0;
    let animType    = null;   // 'hit'|'crit'|'miss'|'block'|'enemy_hit'
    let animValue   = 0;
    let shakeT      = 0;

    // Popup floaters [{text, x, y, vy, alpha, color}]
    let floaters    = [];

    // Callbacks
    let onVictory   = null;
    let onDefeat    = null;

    // Overlay canvas
    let canvas      = null;
    let ctx         = null;

    // ── INIT / OVERLAY ────────────────────────────────────────
    function createOverlay() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.id = 'combat-enhanced-canvas';
        canvas.width  = CONFIG.CANVAS_W;
        canvas.height = CONFIG.CANVAS_H;
        canvas.style.cssText = `
            position: absolute; top:0; left:0;
            width:100%; height:100%;
            pointer-events:none;
            image-rendering:pixelated;
            display:none; z-index:15;
        `;
        const container = document.getElementById('canvas-container');
        if (container) container.appendChild(canvas);
        ctx = canvas.getContext('2d');
        startLoop();
    }

    // ── START / END ───────────────────────────────────────────
    function start(enemyData, victoryFn, defeatFn) {
        onVictory = victoryFn || null;
        onDefeat  = defeatFn  || null;

        player = {
            name:  'Hero',
            hp:    100, maxHp: 100,
            mp:    60,  maxMp: 60,
            atk:   18,  def:   6,
            limbs: buildLimbs(30, 50, 25, 25, 30),
            defending: false,
        };
        // Sync with game state
        if (typeof P !== 'undefined') {
            player.hp    = P.hp    || 100;
            player.maxHp = P.maxHP || P.maxHp || 100;
            player.mp    = P.mp    || 60;
            player.maxMp = P.maxMP || P.maxMp || 60;
            player.atk   = P.atk   || 18;
            player.def   = P.def   || 6;
        }

        enemy = {
            name:    enemyData.name    || 'Enemy',
            hp:      enemyData.hp      || 50,
            maxHp:   enemyData.maxHp   || enemyData.hp || 50,
            atk:     enemyData.atk     || 10,
            def:     enemyData.def     || 3,
            sprite:  enemyData.sprite  || null,
            boss:    enemyData.boss    || false,
            limbs:   buildLimbs(
                enemyData.headHp  || 15,
                enemyData.torsoHp || 25,
                enemyData.armHp   || 12,
                enemyData.armHp   || 12,
                enemyData.legHp   || 15,
            ),
        };

        active     = true;
        phase      = 'select';
        menuIdx    = 0;
        limbIdx    = 2;
        turnCount  = 0;
        combatLog  = [`Combat vs ${enemy.name}!`];
        floaters   = [];
        shakeT     = 0;
        animTimer  = 0;
        animType   = null;

        if (canvas) canvas.style.display = 'block';
        if (typeof Input !== 'undefined') Input.disable();
        console.log('[CombatEnhanced] Started vs', enemy.name);
    }

    function buildLimbs(headHp, torsoHp, lArmHp, rArmHp, legHp) {
        return {
            HEAD:  { hp: headHp,  maxHp: headHp,  broken: false },
            L_ARM: { hp: lArmHp,  maxHp: lArmHp,  broken: false },
            TORSO: { hp: torsoHp, maxHp: torsoHp,  broken: false },
            R_ARM: { hp: rArmHp,  maxHp: rArmHp,  broken: false },
            LEGS:  { hp: legHp,   maxHp: legHp,   broken: false },
        };
    }

    function end(victory) {
        active = false;
        if (canvas) canvas.style.display = 'none';
        if (typeof Input !== 'undefined') Input.enable();

        if (victory) {
            if (onVictory) onVictory(enemy);
            addLog(`Victory! ${enemy.name} defeated.`, 'system');
        } else {
            if (onDefeat) onDefeat();
            addLog('Defeated...', 'system');
        }

        // Sync HP back to game state
        if (typeof P !== 'undefined') {
            P.hp = player.hp;
            P.mp = player.mp;
        }
    }

    // ── UPDATE ────────────────────────────────────────────────
    function update(dt) {
        if (!active) return;

        shakeT = Math.max(0, shakeT - dt);

        // Floater animation
        for (const f of floaters) {
            f.y  -= 28 * dt;
            f.alpha -= 1.4 * dt;
        }
        floaters = floaters.filter(f => f.alpha > 0);

        if (phase === 'animate') {
            animTimer -= dt;
            if (animTimer <= 0) {
                phase = 'enemy_turn';
                animType = null;
                setTimeout(doEnemyTurn, 400);
            }
            return;
        }
        if (phase === 'enemy_turn' || phase === 'result') return;

        handleInput();
    }

    function handleInput() {
        if (typeof Input === 'undefined') return;

        if (phase === 'select') {
            if (Input.wasPressed('up'))    menuIdx = (menuIdx - 1 + ACTIONS.length) % ACTIONS.length;
            if (Input.wasPressed('down'))  menuIdx = (menuIdx + 1) % ACTIONS.length;
            if (Input.wasPressed('interact')) confirmAction();
        } else if (phase === 'limb') {
            if (Input.wasPressed('up'))    limbIdx = (limbIdx - 1 + LIMBS.length) % LIMBS.length;
            if (Input.wasPressed('down'))  limbIdx = (limbIdx + 1) % LIMBS.length;
            if (Input.wasPressed('interact')) confirmLimb();
            if (Input.wasPressed('cancel')) { phase = 'select'; }
        }
    }

    function confirmAction() {
        selectedAct = ACTIONS[menuIdx];
        if (selectedAct.id === 'flee') {
            doFlee();
        } else if (selectedAct.id === 'defend') {
            doDefend();
        } else if (selectedAct.id === 'item') {
            doItem();
        } else if (selectedAct.needsLimb) {
            phase = 'limb';
        }
    }

    function confirmLimb() {
        const limb = LIMBS[limbIdx];
        doAttack(limb);
    }

    // ── COMBAT LOGIC ──────────────────────────────────────────
    function doAttack(limb) {
        const hit = Math.random() < limb.hit;
        if (!hit) {
            addLog(`Attack missed!`, 'miss');
            spawnFloater('MISS', 300, 100, '#808080');
            phase = 'animate'; animTimer = 0.6; animType = 'miss';
            return;
        }

        const isCrit = Math.random() < limb.crit;
        const base   = player.atk;
        const raw    = (base + Math.random() * base * 0.4 | 0) * limb.dmg;
        const dmg    = Math.max(1, raw - enemy.def / 2 | 0) * (isCrit ? 2 : 1);

        // Apply to limb
        const enemyLimb = enemy.limbs[limb.key];
        if (enemyLimb && !enemyLimb.broken) {
            enemyLimb.hp = Math.max(0, enemyLimb.hp - dmg);
            if (enemyLimb.hp === 0) {
                enemyLimb.broken = true;
                addLog(`${enemy.name}'s ${limb.label} is broken!`, 'crit');
            }
        }
        enemy.hp = Math.max(0, enemy.hp - dmg);

        if (isCrit) {
            addLog(`CRITICAL HIT on ${limb.label}! -${dmg} HP`, 'crit');
            spawnFloater(`CRIT -${dmg}`, 290, 90, '#ff6040');
            shakeT = 0.25;
        } else {
            addLog(`Hit ${enemy.name}'s ${limb.label} for ${dmg} HP`, 'hit');
            spawnFloater(`-${dmg}`, 300, 100, '#e8c040');
        }

        phase = 'animate';
        animTimer = isCrit ? 0.8 : 0.55;
        animType  = isCrit ? 'crit' : 'hit';
        animValue = dmg;

        if (enemy.hp <= 0) {
            setTimeout(() => end(true), 800);
            phase = 'result';
        }
    }

    function doDefend() {
        player.defending = true;
        addLog('You brace for impact. Defence +50% this turn.', 'system');
        phase = 'animate'; animTimer = 0.4; animType = 'block';
        setTimeout(doEnemyTurn, 600);
    }

    function doItem() {
        // Simple: use a health potion if player has one
        const healed = Math.min(player.maxHp - player.hp, 30);
        if (healed > 0) {
            player.hp += healed;
            addLog(`Used Health Potion. Restored ${healed} HP.`, 'heal');
            spawnFloater(`+${healed} HP`, 60, 160, '#40cc60');
        } else {
            addLog('No usable item.', 'system');
        }
        phase = 'animate'; animTimer = 0.4; animType = null;
        setTimeout(doEnemyTurn, 600);
    }

    function doFlee() {
        const success = Math.random() < 0.5;
        if (success) {
            addLog('You fled from combat!', 'system');
            setTimeout(() => end(false), 600);
            phase = 'result';
        } else {
            addLog('Flee failed!', 'miss');
            phase = 'animate'; animTimer = 0.4; animType = null;
            setTimeout(doEnemyTurn, 500);
        }
    }

    function doEnemyTurn() {
        if (!active || enemy.hp <= 0 || phase === 'result') return;

        player.defending = false;
        turnCount++;

        // Simple AI: attack random limb
        const lKeys = Object.keys(player.limbs).filter(k => !player.limbs[k].broken);
        const tKey  = lKeys[Math.floor(Math.random() * lKeys.length)] || 'TORSO';
        const tLimb = player.limbs[tKey];

        const hit   = Math.random() < 0.8;
        if (!hit) {
            addLog(`${enemy.name} missed!`, 'miss');
            phase = 'select';
            return;
        }

        const isCrit = Math.random() < 0.08;
        const defMul = player.defending ? 0.5 : 1;
        const raw    = enemy.atk + Math.random() * enemy.atk * 0.3 | 0;
        const dmg    = Math.max(1, (raw - player.def / 2 | 0) * defMul * (isCrit ? 1.8 : 1) | 0);

        tLimb.hp   = Math.max(0, tLimb.hp - dmg);
        player.hp  = Math.max(0, player.hp - dmg);
        if (tLimb.hp === 0) tLimb.broken = true;

        const limbName = tKey.replace('_', ' ').toLowerCase();
        if (isCrit) {
            addLog(`${enemy.name} crits your ${limbName}! -${dmg} HP`, 'damage');
            shakeT = 0.2;
        } else {
            addLog(`${enemy.name} attacks your ${limbName} for ${dmg} HP`, 'normal');
        }
        spawnFloater(`-${dmg}`, 60, 160, isCrit ? '#ff6040' : '#e05050');
        animType = 'enemy_hit'; animTimer = 0.4;

        if (player.hp <= 0) {
            setTimeout(() => end(false), 800);
            phase = 'result';
            return;
        }
        phase = 'select';
    }

    function addLog(text, type = 'normal') {
        combatLog.push({ text, type });
        if (combatLog.length > 8) combatLog.shift();
    }

    function spawnFloater(text, x, y, color) {
        floaters.push({ text, x, y, vy: 1, alpha: 1, color });
    }

    // ── RENDER ────────────────────────────────────────────────
    function startLoop() {
        let lastT = performance.now();
        function loop(now) {
            const dt = Math.min((now - lastT) / 1000, 0.1);
            lastT = now;
            if (active) {
                update(dt);
                render();
            } else if (ctx) {
                ctx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
            }
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    function render() {
        if (!ctx || !active) return;
        const cw = CONFIG.CANVAS_W;
        const ch = CONFIG.CANVAS_H;

        ctx.clearRect(0, 0, cw, ch);

        // Camera shake
        let sx = 0, sy = 0;
        if (shakeT > 0) {
            sx = (Math.random() - 0.5) * 6;
            sy = (Math.random() - 0.5) * 4;
        }
        ctx.save();
        ctx.translate(sx, sy);

        // Full screen dim
        UI_HD.darkenScreen(ctx, 0.72);

        // ── Layout constants ──
        const PAD   = 8;
        const leftW = 158;
        const rightW= 162;
        const midW  = cw - leftW - rightW - PAD * 4;
        const topY  = PAD;
        const botH  = 28;
        const contH = ch - topY - botH - PAD;
        const leftX = PAD;
        const midX  = leftX + leftW + PAD;
        const rightX= midX + midW + PAD;

        renderHeader(ctx, cw, ch);
        renderPlayerPanel(ctx, leftX, topY + 26, leftW, contH);
        renderEnemyPanel(ctx, rightX, topY + 26, rightW, contH);
        renderCenter(ctx, midX, topY + 26, midW, contH);
        renderFloaters(ctx);

        ctx.restore();
    }

    function renderHeader(ctx, cw, ch) {
        ctx.fillStyle = 'rgba(40,24,8,0.92)';
        ctx.fillRect(0, 0, cw, 26);
        ctx.strokeStyle = UI_HD.C.borderGold;
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, cw, 26);

        ctx.fillStyle = UI_HD.C.gold;
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`⚔  COMBAT  —  ${enemy ? enemy.name.toUpperCase() : ''}`, 12, 17);

        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`Turn ${turnCount + 1}`, cw - 12, 17);
        ctx.textAlign = 'left';
        ctx.lineWidth = 1;
    }

    function renderPlayerPanel(ctx, x, y, w, h) {
        UI_HD.drawPanel(ctx, x, y, w, h, { title: 'YOU' });

        const P = player;
        const iy = y + 16;

        // HP bar
        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '10px monospace';
        ctx.fillText('HP', x + 10, iy + 10);
        UI_HD.drawBar(ctx, x + 28, iy, w - 38, 16, P.hp, P.maxHp, 'health');

        // MP bar
        ctx.fillText('MP', x + 10, iy + 30);
        UI_HD.drawBar(ctx, x + 28, iy + 20, w - 38, 16, P.mp, P.maxMp, 'mana');

        UI_HD.drawSeparator(ctx, x + 8, iy + 42, w - 16);

        // Stats
        const sx = x + 10, sy2 = iy + 56;
        UI_HD.drawStat(ctx, sx, sy2,      'ATK', P.atk, UI_HD.C.gold);
        UI_HD.drawStat(ctx, sx, sy2 + 14, 'DEF', P.def);
        UI_HD.drawStat(ctx, sx, sy2 + 28, 'HP',  `${P.hp}/${P.maxHp}`, UI_HD.C.health);

        UI_HD.drawSeparator(ctx, x + 8, sy2 + 40, w - 16);

        // Limb status
        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '10px monospace';
        ctx.fillText('LIMBS', x + 10, sy2 + 54);
        let lRow = 0;
        for (const [key, limb] of Object.entries(P.limbs)) {
            const ly = sy2 + 66 + lRow * 13;
            if (ly > y + h - 14) break;
            const col = limb.broken ? '#662020'
                      : limb.hp / limb.maxHp < 0.4 ? UI_HD.C.healthMid
                      : UI_HD.C.text;
            ctx.fillStyle = col;
            ctx.font = '10px monospace';
            const label = key.replace('_', '.').substring(0, 6).padEnd(6);
            ctx.fillText(`${label} ${limb.hp}/${limb.maxHp}`, x + 10, ly);
            lRow++;
        }

        UI_HD.drawSeparator(ctx, x + 8, y + h - 116, w - 16);

        // Action menu
        const actY  = y + h - 110;
        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '10px monospace';
        ctx.fillText('ACTIONS', x + 10, actY);

        for (let i = 0; i < ACTIONS.length; i++) {
            const act   = ACTIONS[i];
            const by    = actY + 8 + i * 22;
            const isSel = (phase === 'select' && menuIdx === i)
                       || (phase === 'limb'   && menuIdx === i);
            UI_HD.drawButton(ctx, x + 8, by, w - 16, 20, act.label, isSel);
        }

        // Defending indicator
        if (P.defending) {
            ctx.fillStyle = UI_HD.C.mana;
            ctx.font = 'bold 10px monospace';
            ctx.fillText('DEFENDING', x + 10, y + h - 8);
        }
    }

    function renderEnemyPanel(ctx, x, y, w, h) {
        UI_HD.drawPanel(ctx, x, y, w, h, { title: 'ENEMY' });

        const E = enemy;
        const iy = y + 16;

        // Enemy HP
        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '10px monospace';
        ctx.fillText('HP', x + 10, iy + 10);
        UI_HD.drawBar(ctx, x + 28, iy, w - 38, 16, E.hp, E.maxHp, 'enemy');

        ctx.fillStyle = E.boss ? UI_HD.C.gold : UI_HD.C.textBright;
        ctx.font = `bold ${E.boss ? 12 : 11}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(E.name, x + w / 2, iy + 32);
        ctx.textAlign = 'left';

        UI_HD.drawSeparator(ctx, x + 8, iy + 38, w - 16);

        // Stats
        const ss = x + 10, sy2 = iy + 52;
        UI_HD.drawStat(ctx, ss, sy2,      'ATK', E.atk, UI_HD.C.gold);
        UI_HD.drawStat(ctx, ss, sy2 + 14, 'DEF', E.def);

        UI_HD.drawSeparator(ctx, x + 8, sy2 + 24, w - 16);

        // Enemy limbs
        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '10px monospace';
        ctx.fillText('LIMBS', x + 10, sy2 + 38);

        let lRow = 0;
        for (const [key, limb] of Object.entries(E.limbs)) {
            const ly = sy2 + 50 + lRow * 13;
            if (ly > y + h - 14) break;

            const pct = limb.hp / limb.maxHp;
            const col = limb.broken ? '#662020' : pct < 0.4 ? UI_HD.C.healthMid : UI_HD.C.text;
            const sel = (phase === 'limb' && LIMBS[limbIdx].key === key);

            // Highlight selected limb
            if (sel) {
                ctx.fillStyle = 'rgba(80,60,16,0.6)';
                ctx.fillRect(x + 8, ly - 10, w - 16, 13);
                ctx.fillStyle = UI_HD.C.gold;
            } else {
                ctx.fillStyle = col;
            }

            ctx.font = sel ? 'bold 10px monospace' : '10px monospace';
            const label = key.replace('_', '.').substring(0, 6).padEnd(6);
            ctx.fillText(`${label} ${limb.hp}/${limb.maxHp}`, x + 10, ly);

            // Mini bar
            const bw = w - 52;
            ctx.fillStyle = '#1a1020';
            ctx.fillRect(x + 10, ly + 1, bw, 4);
            ctx.fillStyle = limb.broken ? '#662020' : pct > 0.5 ? '#286428' : pct > 0.25 ? '#887020' : '#882020';
            ctx.fillRect(x + 10, ly + 1, bw * pct | 0, 4);

            lRow++;
        }

        // Phase hints
        if (phase === 'limb') {
            ctx.fillStyle = UI_HD.C.gold;
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('↑↓ Target  E:Confirm', x + w / 2, y + h - 8);
            ctx.textAlign = 'left';
        }
    }

    function renderCenter(ctx, x, y, w, h) {
        // Center panel: enemy sprite + hit flash + combat log
        UI_HD.drawPanel(ctx, x, y, w, h);

        const spriteSize = 96;
        const spriteX    = x + (w - spriteSize) / 2 | 0;
        const spriteY    = y + 14;

        // Hit flash behind sprite
        if (animType === 'hit' && animTimer > 0.3) {
            ctx.fillStyle = 'rgba(220,120,20,0.25)';
            ctx.fillRect(spriteX - 10, spriteY - 10, spriteSize + 20, spriteSize + 20);
        }
        if (animType === 'crit' && animTimer > 0.4) {
            ctx.fillStyle = 'rgba(255,60,20,0.35)';
            ctx.fillRect(spriteX - 16, spriteY - 16, spriteSize + 32, spriteSize + 32);
        }
        if (animType === 'enemy_hit') {
            ctx.fillStyle = 'rgba(220,40,40,0.2)';
            ctx.fillRect(x, y, w, h / 2);
        }

        // Enemy sprite at 2× (48×48 → 96×96)
        if (enemy) {
            const spriteMap = {
                enemy_wolf:   'wolf',   enemy_bandit: 'bandit',
                enemy_undead: 'undead', enemy_spirit: 'spirit',
                enemy_boss:   'boss_guardian',
            };
            const spName = spriteMap[enemy.sprite] || 'bandit';

            if (typeof SPRITES_48 !== 'undefined' && SPRITES_48.has(spName)) {
                // Scale up 2× for combat view
                ctx.save();
                ctx.translate(spriteX, spriteY);
                ctx.scale(2, 2);
                SPRITES_48.draw(spName, ctx, 0, 0, 0);
                ctx.restore();
            } else {
                // Fallback placeholder
                ctx.fillStyle = '#3a2020';
                ctx.fillRect(spriteX, spriteY, spriteSize, spriteSize);
                ctx.fillStyle = UI_HD.C.textDim;
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(enemy.name, spriteX + spriteSize / 2, spriteY + spriteSize / 2);
                ctx.textAlign = 'left';
            }
        }

        // Death slash
        if (enemy && enemy.hp <= 0) {
            ctx.fillStyle = 'rgba(180,20,20,0.5)';
            ctx.fillRect(spriteX, spriteY, spriteSize, spriteSize);
            ctx.fillStyle = '#ff2020';
            ctx.font = 'bold 18px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('DEFEATED', spriteX + spriteSize / 2, spriteY + spriteSize / 2 + 6);
            ctx.textAlign = 'left';
        }

        // Separator
        const logY = spriteY + spriteSize + 10;
        UI_HD.drawSeparator(ctx, x + 8, logY, w - 16);

        // Combat log
        ctx.font = '10px monospace';
        const maxLines = Math.floor((y + h - logY - 14) / 13);
        const startIdx = Math.max(0, combatLog.length - maxLines);
        for (let i = startIdx; i < combatLog.length; i++) {
            const entry  = combatLog[i];
            const text   = typeof entry === 'string' ? entry : entry.text;
            const type   = typeof entry === 'object'  ? entry.type : 'normal';
            const alpha  = 0.5 + (i - startIdx) / Math.max(1, combatLog.length - startIdx) * 0.5;
            ctx.globalAlpha = alpha;
            UI_HD.drawLogLine(ctx, x + 10, logY + 13 + (i - startIdx) * 13, w - 20, text, type);
        }
        ctx.globalAlpha = 1;

        // Phase instruction at bottom
        const instY = y + h - 6;
        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        if (phase === 'select') {
            ctx.fillText('Z/S: Navigate   E: Confirm', x + w / 2, instY);
        } else if (phase === 'limb') {
            ctx.fillText('Z/S: Target limb   E: Attack   Esc: Back', x + w / 2, instY);
        } else if (phase === 'animate' || phase === 'enemy_turn') {
            ctx.fillText('...', x + w / 2, instY);
        } else if (phase === 'result') {
            ctx.fillStyle = UI_HD.C.gold;
            ctx.fillText('Press E to continue', x + w / 2, instY);
        }
        ctx.textAlign = 'left';
    }

    function renderFloaters(ctx) {
        for (const f of floaters) {
            ctx.globalAlpha = Math.max(0, f.alpha);
            UI_HD.drawDamagePopup(ctx, f.x, f.y, f.text,
                f.text.startsWith('CRIT') ? 'crit' :
                f.text.startsWith('+')    ? 'heal' : 'hit');
        }
        ctx.globalAlpha = 1;
    }

    // ── KEYBOARD HANDLER ─────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if (!active) return;
        if (e.code === 'Escape' && phase === 'limb') {
            phase = 'select';
            e.preventDefault();
        }
        if (phase === 'result' && (e.code === 'KeyE' || e.code === 'Space')) {
            if (player.hp <= 0) end(false);
            else if (enemy.hp <= 0) end(true);
        }
    });

    // ── PUBLIC API ────────────────────────────────────────────
    function init() {
        const container = document.getElementById('canvas-container');
        if (container) {
            createOverlay();
        } else {
            let tries = 0;
            const wait = setInterval(() => {
                if (document.getElementById('canvas-container') || ++tries > 40) {
                    clearInterval(wait);
                    createOverlay();
                }
            }, 100);
        }

        // Hook into Engine.triggerCombat
        if (typeof Engine !== 'undefined') {
            Engine.triggerCombat = function(enemyId) {
                const ENEMIES = {
                    wolf:           { name:'Wolf',            hp:35, atk:8,  def:2, sprite:'enemy_wolf'   },
                    ash_wolf:       { name:'Ash Wolf',        hp:40, atk:10, def:3, sprite:'enemy_wolf'   },
                    bandit:         { name:'Bandit',          hp:45, atk:12, def:4, sprite:'enemy_bandit' },
                    shade:          { name:'Shade',           hp:30, atk:14, def:2, sprite:'enemy_spirit' },
                    undead_monk:    { name:'Undead Monk',     hp:50, atk:11, def:5, sprite:'enemy_undead' },
                    gladiator:      { name:'Gladiator',       hp:60, atk:14, def:6, sprite:'enemy_bandit' },
                    cinder_sprite:  { name:'Cinder Sprite',   hp:25, atk:15, def:1, sprite:'enemy_spirit' },
                    rock_golem:     { name:'Rock Golem',      hp:80, atk:12, def:10, sprite:'enemy_boss'  },
                    the_watcher:    { name:'The Watcher',     hp:120,atk:18, def:8,  sprite:'enemy_boss', boss:true },
                    vault_guardian: { name:'Vault Guardian',  hp:150,atk:20, def:10, sprite:'enemy_boss', boss:true },
                };
                const data = ENEMIES[enemyId] || { name: enemyId, hp: 40, atk: 10, def: 3 };
                CombatEnhanced.start(data);
            };
        }
        console.log('[CombatEnhanced] Ready — testCombat("bandit") to test');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { start, end, isActive: () => active,
             setCallbacks: (v, d) => { onVictory = v; onDefeat = d; } };
})();

// Console test alias
window.testCombat         = (id = 'bandit') => Engine.triggerCombat(id);
window.testEnhancedCombat = window.testCombat;
