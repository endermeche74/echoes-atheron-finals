/*************************************************************
 * combat_canvas.js — Canvas Combat System
 * Fear & Hunger style turn-based combat with limb targeting
 *************************************************************/

const CombatCanvas = (function() {
    
    // === COMBAT STATE ===
    let active = false;
    let turn = 'player'; // 'player', 'enemy'
    let phase = 'select'; // 'select', 'target', 'animate', 'result', 'enemy_turn'
    
    let player = null;
    let enemy = null;
    let selectedAction = null;
    let selectedLimb = null;
    
    // Animation state
    let animTimer = 0;
    let animCallback = null;
    
    // UI state
    let menuIndex = 0;
    let limbIndex = 0;
    
    // === LIMB SYSTEM ===
    const LIMBS = {
        HEAD: { name: 'Head', dmgMult: 1.5, hitChance: 0.6, crit: 0.3 },
        TORSO: { name: 'Torso', dmgMult: 1.0, hitChance: 0.9, crit: 0.1 },
        LEFT_ARM: { name: 'L.Arm', dmgMult: 0.8, hitChance: 0.75, crit: 0.05 },
        RIGHT_ARM: { name: 'R.Arm', dmgMult: 0.8, hitChance: 0.75, crit: 0.05 },
        LEGS: { name: 'Legs', dmgMult: 0.7, hitChance: 0.8, crit: 0.05 }
    };
    
    const LIMB_ORDER = ['HEAD', 'LEFT_ARM', 'TORSO', 'RIGHT_ARM', 'LEGS'];
    
    // === ACTIONS ===
    const ACTIONS = [
        { id: 'attack', name: 'Attack', needsTarget: true },
        { id: 'defend', name: 'Defend', needsTarget: false },
        { id: 'item', name: 'Item', needsTarget: false },
        { id: 'flee', name: 'Flee', needsTarget: false }
    ];
    
    // === START COMBAT ===
    function start(enemyData) {
        active = true;
        turn = 'player';
        phase = 'select';
        menuIndex = 0;
        limbIndex = 2; // Start on torso
        
        // Setup player
        player = {
            name: 'Player',
            hp: 100,
            maxHp: 100,
            atk: 15,
            def: 5,
            limbs: {
                HEAD: { hp: 30, maxHp: 30 },
                TORSO: { hp: 50, maxHp: 50 },
                LEFT_ARM: { hp: 25, maxHp: 25 },
                RIGHT_ARM: { hp: 25, maxHp: 25 },
                LEGS: { hp: 30, maxHp: 30 }
            },
            defending: false
        };
        
        // Sync with game state if available
        if (typeof State !== 'undefined' && State.player) {
            player.hp = State.player.hp || 100;
            player.maxHp = State.player.maxHp || 100;
            player.atk = State.player.atk || 15;
            player.def = State.player.def || 5;
        }
        
        // Setup enemy
        enemy = {
            name: enemyData.name || 'Enemy',
            hp: enemyData.hp || 50,
            maxHp: enemyData.maxHp || enemyData.hp || 50,
            atk: enemyData.atk || 10,
            def: enemyData.def || 3,
            limbs: {
                HEAD: { hp: enemyData.headHp || 15, maxHp: enemyData.headHp || 15 },
                TORSO: { hp: enemyData.torsoHp || 25, maxHp: enemyData.torsoHp || 25 },
                LEFT_ARM: { hp: enemyData.armHp || 12, maxHp: enemyData.armHp || 12 },
                RIGHT_ARM: { hp: enemyData.armHp || 12, maxHp: enemyData.armHp || 12 },
                LEGS: { hp: enemyData.legHp || 15, maxHp: enemyData.legHp || 15 }
            },
            sprite: enemyData.sprite || 'enemy_bandit',
            ai: enemyData.ai || 'basic'
        };
        
        // Disable normal input
        if (typeof Input !== 'undefined' && Input.disable) {
            Input.disable();
        }
        
        // Boss effect
        if (enemyData.boss) {
            if (typeof Effects !== 'undefined') {
                Effects.presets.bossAppear();
            }
        }
        
        console.log('[CombatCanvas] Started vs', enemy.name);
    }
    
    // === END COMBAT ===
    function end(victory) {
        active = false;
        
        // Re-enable input
        if (typeof Input !== 'undefined' && Input.enable) {
            Input.enable();
        }
        
        // Sync player HP back
        if (typeof State !== 'undefined' && State.player) {
            State.player.hp = player.hp;
        }
        
        // Trigger callbacks
        if (victory) {
            if (typeof CombatEffects !== 'undefined') {
                CombatEffects.enemyDeath(200, 80);
            }
            if (onVictory) onVictory(enemy);
        } else {
            if (typeof Effects !== 'undefined') {
                Effects.presets.playerDeath();
            }
            if (onDefeat) onDefeat();
        }
    }
    
    let onVictory = null;
    let onDefeat = null;
    
    function setCallbacks(victory, defeat) {
        onVictory = victory;
        onDefeat = defeat;
    }
    
    // === INPUT HANDLING ===
    function handleInput(key) {
        if (!active) return;
        
        if (phase === 'select') {
            if (key === 'up') {
                menuIndex = (menuIndex - 1 + ACTIONS.length) % ACTIONS.length;
            } else if (key === 'down') {
                menuIndex = (menuIndex + 1) % ACTIONS.length;
            } else if (key === 'confirm') {
                selectedAction = ACTIONS[menuIndex];
                if (selectedAction.needsTarget) {
                    phase = 'target';
                } else {
                    executeAction();
                }
            }
        } else if (phase === 'target') {
            if (key === 'up' && limbIndex > 0) {
                limbIndex--;
                if (limbIndex === 1) limbIndex = 0; // Skip to head
            } else if (key === 'down' && limbIndex < 4) {
                limbIndex++;
                if (limbIndex === 3) limbIndex = 4; // Skip to legs
            } else if (key === 'left' && limbIndex === 3) {
                limbIndex = 1;
            } else if (key === 'right' && limbIndex === 1) {
                limbIndex = 3;
            } else if (key === 'left' && limbIndex === 2) {
                limbIndex = 1;
            } else if (key === 'right' && limbIndex === 2) {
                limbIndex = 3;
            } else if (key === 'confirm') {
                selectedLimb = LIMB_ORDER[limbIndex];
                executeAction();
            } else if (key === 'cancel') {
                phase = 'select';
            }
        }
    }
    
    // === EXECUTE ACTION ===
    function executeAction() {
        phase = 'animate';
        animTimer = 0;
        
        if (selectedAction.id === 'attack') {
            doAttack(player, enemy, selectedLimb);
        } else if (selectedAction.id === 'defend') {
            player.defending = true;
            showMessage('Defending...');
            setTimeout(() => endPlayerTurn(), 500);
        } else if (selectedAction.id === 'item') {
            // TODO: Item menu
            showMessage('No items!');
            setTimeout(() => { phase = 'select'; }, 500);
        } else if (selectedAction.id === 'flee') {
            if (Math.random() < 0.4) {
                showMessage('Escaped!');
                setTimeout(() => end(false), 500);
            } else {
                showMessage('Cannot escape!');
                setTimeout(() => endPlayerTurn(), 500);
            }
        }
    }
    
    // === ATTACK ===
    function doAttack(attacker, defender, limbKey) {
        const limb = LIMBS[limbKey];
        const limbState = defender.limbs[limbKey];
        
        // Already destroyed?
        if (limbState.hp <= 0) {
            showMessage('Already destroyed!');
            setTimeout(() => { phase = 'select'; }, 400);
            return;
        }
        
        // Hit check
        if (Math.random() > limb.hitChance) {
            showMessage('MISS!');
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.miss(200, 60);
            }
            setTimeout(() => endPlayerTurn(), 600);
            return;
        }
        
        // Calculate damage
        let damage = Math.max(1, attacker.atk - defender.def);
        damage = Math.floor(damage * limb.dmgMult);
        
        // Crit check
        const isCrit = Math.random() < limb.crit;
        if (isCrit) {
            damage = Math.floor(damage * 2);
        }
        
        // Variance
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        
        // Apply damage
        limbState.hp = Math.max(0, limbState.hp - damage);
        defender.hp = Math.max(0, defender.hp - damage);
        
        // Effects
        if (typeof CombatEffects !== 'undefined') {
            CombatEffects.playerAttack(200, 60, damage, isCrit);
        }
        
        // Limb destroyed?
        if (limbState.hp <= 0) {
            showMessage(limb.name + ' destroyed!');
            applyLimbEffect(defender, limbKey);
        }
        
        // Check death
        if (defender.hp <= 0) {
            setTimeout(() => end(true), 800);
            return;
        }
        
        setTimeout(() => endPlayerTurn(), 600);
    }
    
    function applyLimbEffect(target, limbKey) {
        if (limbKey === 'HEAD') {
            // Instant kill or massive damage
            target.hp = 0;
        } else if (limbKey === 'LEFT_ARM' || limbKey === 'RIGHT_ARM') {
            target.atk = Math.floor(target.atk * 0.7);
        } else if (limbKey === 'LEGS') {
            // Can't flee
        }
    }
    
    // === ENEMY TURN ===
    function endPlayerTurn() {
        if (!active) return;
        
        turn = 'enemy';
        phase = 'enemy_turn';
        player.defending = false;
        
        setTimeout(() => doEnemyTurn(), 500);
    }
    
    function doEnemyTurn() {
        if (!active) return;
        
        // Simple AI: attack random limb
        const targetLimbs = LIMB_ORDER.filter(l => player.limbs[l].hp > 0);
        if (targetLimbs.length === 0) {
            end(false);
            return;
        }
        
        const targetLimb = targetLimbs[Math.floor(Math.random() * targetLimbs.length)];
        const limb = LIMBS[targetLimb];
        const limbState = player.limbs[targetLimb];
        
        // Hit check (player can dodge)
        if (Math.random() > 0.8) {
            showMessage('Dodged!');
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.miss(100, 100);
            }
            setTimeout(() => endEnemyTurn(), 600);
            return;
        }
        
        // Calculate damage
        let damage = Math.max(1, enemy.atk - player.def);
        if (player.defending) {
            damage = Math.floor(damage * 0.5);
        }
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        
        // Apply
        limbState.hp = Math.max(0, limbState.hp - damage);
        player.hp = Math.max(0, player.hp - damage);
        
        // Effects
        if (typeof Player !== 'undefined' && Player.onHit) {
            Player.onHit(damage, false);
        } else if (typeof CombatEffects !== 'undefined') {
            CombatEffects.enemyAttack(damage, false);
        }
        
        showMessage(enemy.name + ' attacks ' + limb.name + '!');
        
        // Check death
        if (player.hp <= 0) {
            setTimeout(() => end(false), 800);
            return;
        }
        
        setTimeout(() => endEnemyTurn(), 800);
    }
    
    function endEnemyTurn() {
        if (!active) return;
        turn = 'player';
        phase = 'select';
        menuIndex = 0;
    }
    
    // === MESSAGE ===
    let currentMessage = '';
    let messageTimer = 0;
    
    function showMessage(msg) {
        currentMessage = msg;
        messageTimer = 2;
    }
    
    // === UPDATE ===
    function update(dt) {
        if (!active) return;
        
        if (messageTimer > 0) {
            messageTimer -= dt;
        }
        
        animTimer += dt;
    }
    
    // === RENDER ===
    function render(ctx) {
        if (!active) return;
        
        const W = CONFIG.CANVAS_W, H = CONFIG.CANVAS_H;
        
        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, W, H);
        
        // Floor line
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(0, 180);
        ctx.lineTo(W, 180);
        ctx.stroke();
        
        // === ENEMY ===
        renderEnemy(ctx, 180, 60);
        
        // === PLAYER (back view) ===
        renderPlayerBack(ctx, 60, 120);
        
        // === LIMB TARGET UI ===
        if (phase === 'target') {
            renderLimbTarget(ctx, 180, 60);
        }
        
        // === MENU ===
        renderMenu(ctx);
        
        // === HP BARS ===
        renderHPBars(ctx);
        
        // === MESSAGE ===
        if (messageTimer > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(currentMessage, W/2, 30);
            ctx.textAlign = 'left';
        }
    }
    
    function renderEnemy(ctx, x, y) {
        // Use sprite system if available
        if (typeof Sprites !== 'undefined') {
            const anim = Sprites.createAnimController(enemy.sprite);
            anim.setDirection(0); // Facing down
            Sprites.render(ctx, enemy.sprite, x - 8, y - 8, anim);
        } else {
            ctx.fillStyle = '#8a4a4a';
            ctx.fillRect(x - 12, y - 16, 24, 32);
        }
        
        // Enemy name
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.name, x, y - 24);
        ctx.textAlign = 'left';
    }
    
    function renderPlayerBack(ctx, x, y) {
        // Simple back view
        ctx.fillStyle = '#5a6a5a';
        ctx.fillRect(x - 8, y - 12, 16, 24);
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(x - 6, y - 18, 12, 8);
    }
    
    function renderLimbTarget(ctx, x, y) {
        // Draw limb hitboxes
        const limbPositions = {
            HEAD: { x: 0, y: -20, w: 12, h: 12 },
            TORSO: { x: 0, y: -4, w: 16, h: 16 },
            LEFT_ARM: { x: -14, y: -4, w: 8, h: 14 },
            RIGHT_ARM: { x: 14, y: -4, w: 8, h: 14 },
            LEGS: { x: 0, y: 14, w: 14, h: 12 }
        };
        
        for (let i = 0; i < LIMB_ORDER.length; i++) {
            const limbKey = LIMB_ORDER[i];
            const pos = limbPositions[limbKey];
            const limbState = enemy.limbs[limbKey];
            const isSelected = i === limbIndex;
            const isDestroyed = limbState.hp <= 0;
            
            const lx = x + pos.x - pos.w/2;
            const ly = y + pos.y - pos.h/2;
            
            // Background
            if (isDestroyed) {
                ctx.fillStyle = '#333';
            } else if (isSelected) {
                ctx.fillStyle = '#aa4444';
            } else {
                ctx.fillStyle = '#444';
            }
            ctx.fillRect(lx, ly, pos.w, pos.h);
            
            // Border
            ctx.strokeStyle = isSelected ? '#ff6666' : '#666';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(lx, ly, pos.w, pos.h);
            
            // HP text
            if (!isDestroyed) {
                ctx.fillStyle = '#fff';
                ctx.font = '6px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(limbState.hp, x + pos.x, y + pos.y + 2);
            }
        }
        
        ctx.textAlign = 'left';
        ctx.lineWidth = 1;
        
        // Selected limb name
        const sel = LIMBS[LIMB_ORDER[limbIndex]];
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.fillText('Target: ' + sel.name, 140, 130);
    }
    
    function renderMenu(ctx) {
        const menuX = 10, menuY = 185;
        
        // Box
        ctx.fillStyle = '#222';
        ctx.fillRect(menuX, menuY, 80, 50);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(menuX, menuY, 80, 50);
        
        // Actions
        ctx.font = '8px monospace';
        for (let i = 0; i < ACTIONS.length; i++) {
            const action = ACTIONS[i];
            const isSelected = phase === 'select' && i === menuIndex;
            
            ctx.fillStyle = isSelected ? '#ffcc00' : '#aaa';
            const prefix = isSelected ? '> ' : '  ';
            ctx.fillText(prefix + action.name, menuX + 4, menuY + 12 + i * 11);
        }
    }
    
    function renderHPBars(ctx) {
        // Player HP
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.fillText('HP', 10, 16);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(26, 8, 60, 10);
        ctx.fillStyle = '#44aa44';
        ctx.fillRect(26, 8, 60 * (player.hp / player.maxHp), 10);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(26, 8, 60, 10);
        
        ctx.fillStyle = '#fff';
        ctx.fillText(player.hp + '/' + player.maxHp, 90, 16);
        
        // Enemy HP
        ctx.fillStyle = '#fff';
        ctx.fillText(enemy.name, 200, 16);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(200, 20, 80, 8);
        ctx.fillStyle = '#aa4444';
        ctx.fillRect(200, 20, 80 * (enemy.hp / enemy.maxHp), 8);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(200, 20, 80, 8);
    }
    
    // === KEY HANDLER ===
    function onKeyDown(e) {
        if (!active) return;
        
        const keyMap = {
            'ArrowUp': 'up', 'KeyW': 'up', 'KeyZ': 'up',
            'ArrowDown': 'down', 'KeyS': 'down',
            'ArrowLeft': 'left', 'KeyA': 'left', 'KeyQ': 'left',
            'ArrowRight': 'right', 'KeyD': 'right',
            'Enter': 'confirm', 'Space': 'confirm', 'KeyE': 'confirm',
            'Escape': 'cancel', 'Backspace': 'cancel'
        };
        
        const action = keyMap[e.code];
        if (action) {
            e.preventDefault();
            handleInput(action);
        }
    }
    
    // Add listener
    document.addEventListener('keydown', onKeyDown);
    
    // === PUBLIC API ===
    return {
        start,
        end,
        update,
        render,
        isActive: () => active,
        setCallbacks,
        handleInput,

        // State snapshot for external renderers
        getState: () => ({
            player, enemy, phase, turn,
            menuIndex, limbIndex,
            message: currentMessage,
            messageTimer,
            actions: ACTIONS,
            limbs: LIMBS,
            limbOrder: LIMB_ORDER
        })
    };
    
})();

console.log('[CombatCanvas] Initialized');