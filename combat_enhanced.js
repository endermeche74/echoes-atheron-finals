/*************************************************************
 * combat_enhanced.js — Enhanced Combat with Skills & Inventory
 * Replaces combat_canvas.js
 *************************************************************/

const CombatEnhanced = (function() {
    
    // === STATE ===
    let active = false;
    let phase = 'select'; // select, target, skill_select, item_select, animate, enemy_turn
    let turn = 'player';
    
    let menuIndex = 0;
    let subMenuIndex = 0;
    let limbIndex = 2; // Start on torso
    
    let player = null;
    let enemy = null;
    let selectedAction = null;
    let selectedSkill = null;
    let selectedItem = null;
    
    let message = '';
    let messageTimer = 0;
    
    // === PLAYER STATS ===
    function initPlayer() {
        return {
            name: 'Wanderer',
            hp: 100, maxHp: 100,
            mp: 50, maxMp: 50,
            atk: 15, def: 5, mag: 10,
            skills: [
                { id: 'slash', name: 'Slash', mp: 0, type: 'physical', power: 1.0, desc: 'Basic attack' },
                { id: 'heavy', name: 'Heavy Strike', mp: 8, type: 'physical', power: 1.8, desc: 'Powerful blow' },
                { id: 'thrust', name: 'Thrust', mp: 5, type: 'physical', power: 1.2, acc: 1.2, desc: 'Precise stab' },
                { id: 'fireball', name: 'Fireball', mp: 12, type: 'magic', power: 1.5, desc: 'Fire damage' },
                { id: 'heal', name: 'Heal', mp: 15, type: 'heal', power: 30, desc: 'Restore HP' },
                { id: 'drain', name: 'Life Drain', mp: 10, type: 'drain', power: 0.8, desc: 'Steal HP' }
            ],
            inventory: [
                { id: 'potion', name: 'Health Potion', count: 3, effect: 'heal', value: 30 },
                { id: 'ether', name: 'Mana Elixir', count: 2, effect: 'mp', value: 25 },
                { id: 'antidote', name: 'Antidote', count: 1, effect: 'cure', value: 'poison' },
                { id: 'bomb', name: 'Fire Bomb', count: 2, effect: 'damage', value: 40 }
            ],
            limbs: {
                HEAD: { hp: 30, maxHp: 30 },
                TORSO: { hp: 50, maxHp: 50 },
                L_ARM: { hp: 25, maxHp: 25 },
                R_ARM: { hp: 25, maxHp: 25 },
                LEGS: { hp: 30, maxHp: 30 }
            },
            defending: false
        };
    }
    
    // === ACTIONS ===
    const ACTIONS = [
        { id: 'attack', name: 'Attack', icon: '⚔' },
        { id: 'skills', name: 'Skills', icon: '✦' },
        { id: 'items', name: 'Items', icon: '◆' },
        { id: 'defend', name: 'Defend', icon: '🛡' },
        { id: 'flee', name: 'Flee', icon: '↩' }
    ];
    
    // === LIMBS ===
    const LIMBS = {
        HEAD: { name: 'Head', dmg: 1.5, hit: 0.6, crit: 0.3, pos: { x: 0, y: -24 } },
        TORSO: { name: 'Torso', dmg: 1.0, hit: 0.9, crit: 0.1, pos: { x: 0, y: -8 } },
        L_ARM: { name: 'L.Arm', dmg: 0.8, hit: 0.75, crit: 0.05, pos: { x: -18, y: -8 } },
        R_ARM: { name: 'R.Arm', dmg: 0.8, hit: 0.75, crit: 0.05, pos: { x: 18, y: -8 } },
        LEGS: { name: 'Legs', dmg: 0.7, hit: 0.8, crit: 0.05, pos: { x: 0, y: 10 } }
    };
    const LIMB_ORDER = ['HEAD', 'L_ARM', 'TORSO', 'R_ARM', 'LEGS'];
    
    // === START COMBAT ===
    function start(enemyData) {
        active = true;
        phase = 'select';
        turn = 'player';
        menuIndex = 0;
        subMenuIndex = 0;
        limbIndex = 2;
        
        player = initPlayer();
        
        enemy = {
            name: enemyData.name || 'Enemy',
            hp: enemyData.hp || 50,
            maxHp: enemyData.maxHp || enemyData.hp || 50,
            atk: enemyData.atk || 10,
            def: enemyData.def || 3,
            sprite: enemyData.sprite || 'bandit',
            boss: enemyData.boss || false,
            limbs: {
                HEAD: { hp: 15, maxHp: 15 },
                TORSO: { hp: 25, maxHp: 25 },
                L_ARM: { hp: 12, maxHp: 12 },
                R_ARM: { hp: 12, maxHp: 12 },
                LEGS: { hp: 15, maxHp: 15 }
            }
        };
        
        showMessage(enemy.name + ' appears!');
        
        if (typeof Input !== 'undefined') Input.disable();
        
        console.log('[Combat] Started vs', enemy.name);
    }
    
    function end(victory) {
        active = false;
        if (typeof Input !== 'undefined') Input.enable();
        
        if (victory) {
            const xp = enemy.maxHp;
            const gold = Math.floor(enemy.maxHp / 2);
            showMessage('Victory! +' + xp + ' XP, +' + gold + ' Gold');
        }
    }
    
    // === INPUT ===
    function handleInput(key) {
        if (!active) return;
        
        switch (phase) {
            case 'select':
                handleMenuInput(key);
                break;
            case 'skill_select':
                handleSkillInput(key);
                break;
            case 'item_select':
                handleItemInput(key);
                break;
            case 'target':
                handleTargetInput(key);
                break;
        }
    }
    
    function handleMenuInput(key) {
        if (key === 'up') menuIndex = (menuIndex - 1 + ACTIONS.length) % ACTIONS.length;
        else if (key === 'down') menuIndex = (menuIndex + 1) % ACTIONS.length;
        else if (key === 'confirm') selectAction(ACTIONS[menuIndex]);
        playSound('menu_move');
    }
    
    function handleSkillInput(key) {
        const skills = player.skills.filter(s => s.mp <= player.mp);
        if (key === 'up') subMenuIndex = (subMenuIndex - 1 + skills.length) % skills.length;
        else if (key === 'down') subMenuIndex = (subMenuIndex + 1) % skills.length;
        else if (key === 'confirm') {
            selectedSkill = skills[subMenuIndex];
            if (selectedSkill.type === 'heal') {
                executeSkill();
            } else {
                phase = 'target';
            }
        }
        else if (key === 'cancel') { phase = 'select'; subMenuIndex = 0; }
    }
    
    function handleItemInput(key) {
        const items = player.inventory.filter(i => i.count > 0);
        if (key === 'up') subMenuIndex = (subMenuIndex - 1 + items.length) % items.length;
        else if (key === 'down') subMenuIndex = (subMenuIndex + 1) % items.length;
        else if (key === 'confirm') {
            selectedItem = items[subMenuIndex];
            useItem();
        }
        else if (key === 'cancel') { phase = 'select'; subMenuIndex = 0; }
    }
    
    function handleTargetInput(key) {
        if (key === 'up' && limbIndex > 0) limbIndex--;
        else if (key === 'down' && limbIndex < 4) limbIndex++;
        else if (key === 'left' && (limbIndex === 2 || limbIndex === 3)) limbIndex = 1;
        else if (key === 'right' && (limbIndex === 1 || limbIndex === 2)) limbIndex = 3;
        else if (key === 'confirm') executeAttack();
        else if (key === 'cancel') { 
            phase = selectedSkill ? 'skill_select' : 'select'; 
            selectedSkill = null;
        }
    }
    
    function selectAction(action) {
        selectedAction = action;
        
        switch (action.id) {
            case 'attack':
                phase = 'target';
                break;
            case 'skills':
                phase = 'skill_select';
                subMenuIndex = 0;
                break;
            case 'items':
                phase = 'item_select';
                subMenuIndex = 0;
                break;
            case 'defend':
                player.defending = true;
                showMessage('Defending!');
                endPlayerTurn();
                break;
            case 'flee':
                if (Math.random() < 0.4) {
                    showMessage('Escaped!');
                    setTimeout(() => end(false), 800);
                } else {
                    showMessage('Cannot escape!');
                    endPlayerTurn();
                }
                break;
        }
    }
    
    // === COMBAT ACTIONS ===
    function executeAttack() {
        const limbKey = LIMB_ORDER[limbIndex];
        const limb = LIMBS[limbKey];
        const limbState = enemy.limbs[limbKey];
        
        if (limbState.hp <= 0) {
            showMessage('Already destroyed!');
            return;
        }
        
        // Hit check
        const hitChance = selectedSkill ? (limb.hit * (selectedSkill.acc || 1)) : limb.hit;
        if (Math.random() > hitChance) {
            showMessage('MISS!');
            playSound('miss');
            endPlayerTurn();
            return;
        }
        
        // Damage calc
        let power = selectedSkill ? selectedSkill.power : 1.0;
        let baseDmg = selectedSkill?.type === 'magic' ? player.mag : player.atk;
        let damage = Math.floor((baseDmg - enemy.def * 0.5) * power * limb.dmg);
        
        // Crit
        const isCrit = Math.random() < limb.crit;
        if (isCrit) damage = Math.floor(damage * 2);
        
        // Variance
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        damage = Math.max(1, damage);
        
        // Apply
        limbState.hp = Math.max(0, limbState.hp - damage);
        enemy.hp = Math.max(0, enemy.hp - damage);
        
        // MP cost
        if (selectedSkill) {
            player.mp -= selectedSkill.mp;
        }
        
        // Effects
        showMessage((isCrit ? 'CRITICAL! ' : '') + damage + ' damage!');
        playSound(isCrit ? 'hit_crit' : 'hit');
        
        // Life drain
        if (selectedSkill?.type === 'drain') {
            const heal = Math.floor(damage * 0.5);
            player.hp = Math.min(player.maxHp, player.hp + heal);
            showMessage('Drained ' + heal + ' HP!');
        }
        
        // Limb destroyed
        if (limbState.hp <= 0) {
            showMessage(limb.name + ' destroyed!');
            if (limbKey === 'HEAD') enemy.hp = 0;
            else if (limbKey === 'L_ARM' || limbKey === 'R_ARM') enemy.atk *= 0.7;
        }
        
        // Check death
        if (enemy.hp <= 0) {
            setTimeout(() => end(true), 1000);
            return;
        }
        
        selectedSkill = null;
        endPlayerTurn();
    }
    
    function executeSkill() {
        if (selectedSkill.type === 'heal') {
            player.mp -= selectedSkill.mp;
            player.hp = Math.min(player.maxHp, player.hp + selectedSkill.power);
            showMessage('Healed ' + selectedSkill.power + ' HP!');
            playSound('heal');
            selectedSkill = null;
            endPlayerTurn();
        }
    }
    
    function useItem() {
        selectedItem.count--;
        
        switch (selectedItem.effect) {
            case 'heal':
                player.hp = Math.min(player.maxHp, player.hp + selectedItem.value);
                showMessage('Restored ' + selectedItem.value + ' HP!');
                playSound('heal');
                break;
            case 'mp':
                player.mp = Math.min(player.maxMp, player.mp + selectedItem.value);
                showMessage('Restored ' + selectedItem.value + ' MP!');
                break;
            case 'damage':
                enemy.hp = Math.max(0, enemy.hp - selectedItem.value);
                showMessage(selectedItem.value + ' damage!');
                playSound('explosion');
                if (enemy.hp <= 0) {
                    setTimeout(() => end(true), 800);
                    return;
                }
                break;
        }
        
        selectedItem = null;
        phase = 'select';
        endPlayerTurn();
    }
    
    function endPlayerTurn() {
        phase = 'animate';
        turn = 'enemy';
        setTimeout(enemyTurn, 800);
    }
    
    function enemyTurn() {
        player.defending = false;
        
        // Simple AI
        const validLimbs = LIMB_ORDER.filter(l => player.limbs[l].hp > 0);
        if (validLimbs.length === 0) {
            end(false);
            return;
        }
        
        const targetLimb = validLimbs[Math.floor(Math.random() * validLimbs.length)];
        const limb = LIMBS[targetLimb];
        
        // Hit check
        if (Math.random() > 0.75) {
            showMessage('Dodged!');
            endEnemyTurn();
            return;
        }
        
        // Damage
        let damage = Math.max(1, enemy.atk - player.def);
        if (player.defending) damage = Math.floor(damage * 0.5);
        damage = Math.floor(damage * (0.9 + Math.random() * 0.2));
        
        player.limbs[targetLimb].hp = Math.max(0, player.limbs[targetLimb].hp - damage);
        player.hp = Math.max(0, player.hp - damage);
        
        showMessage(enemy.name + ' hits ' + limb.name + ' for ' + damage + '!');
        playSound('hurt');
        
        if (player.hp <= 0) {
            showMessage('Defeated...');
            setTimeout(() => end(false), 1000);
            return;
        }
        
        endEnemyTurn();
    }
    
    function endEnemyTurn() {
        setTimeout(() => {
            turn = 'player';
            phase = 'select';
            menuIndex = 0;
        }, 600);
    }
    
    // === HELPERS ===
    function showMessage(msg) {
        message = msg;
        messageTimer = 2;
    }
    
    function playSound(name) {
        if (typeof GameAudio !== 'undefined') GameAudio.playSFX(name);
    }
    
    // === UPDATE ===
    function update(dt) {
        if (!active) return;
        if (messageTimer > 0) messageTimer -= dt;
    }
    
    // === RENDER ===
    function render(ctx) {
        if (!active) return;
        
        const W = 320, H = 240;
        
        // Background
        ctx.fillStyle = '#0a0a10';
        ctx.fillRect(0, 0, W, H);
        
        // Ground line
        ctx.fillStyle = '#1a1a20';
        ctx.fillRect(0, 150, W, 90);
        ctx.strokeStyle = '#2a2a30';
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(W, 150);
        ctx.stroke();
        
        // Enemy
        renderEnemy(ctx, 200, 100);
        
        // Player (back view)
        renderPlayerBack(ctx, 80, 130);
        
        // Target UI
        if (phase === 'target') {
            renderTargetUI(ctx, 200, 100);
        }
        
        // UI Panels
        renderPlayerStatus(ctx);
        renderEnemyStatus(ctx);
        renderActionMenu(ctx);
        
        // Message
        if (messageTimer > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(60, 60, 200, 30);
            ctx.strokeStyle = '#666';
            ctx.strokeRect(60, 60, 200, 30);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(message, 160, 80);
            ctx.textAlign = 'left';
        }
    }
    
    function renderEnemy(ctx, x, y) {
        // Use detailed sprite if available
        if (typeof SpriteSheet !== 'undefined') {
            // Scale up 2x for combat view
            ctx.save();
            ctx.translate(x - 16, y - 16);
            ctx.scale(2, 2);
            SpriteSheet.render(ctx, enemy.sprite, 0, 0);
            ctx.restore();
        } else {
            ctx.fillStyle = '#804040';
            ctx.fillRect(x - 16, y - 24, 32, 40);
        }
        
        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.name, x, y - 36);
        ctx.textAlign = 'left';
    }
    
    function renderPlayerBack(ctx, x, y) {
        // Back of player
        ctx.fillStyle = '#3a4a3a';
        ctx.fillRect(x - 12, y - 20, 24, 36);
        // Head
        ctx.fillStyle = '#c0a080';
        ctx.fillRect(x - 8, y - 28, 16, 10);
        // Hair
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(x - 8, y - 30, 16, 6);
    }
    
    function renderTargetUI(ctx, ex, ey) {
        // Draw limb hitboxes on enemy
        for (let i = 0; i < LIMB_ORDER.length; i++) {
            const limbKey = LIMB_ORDER[i];
            const limb = LIMBS[limbKey];
            const limbState = enemy.limbs[limbKey];
            const isSelected = i === limbIndex;
            const isDead = limbState.hp <= 0;
            
            const lx = ex + limb.pos.x - 10;
            const ly = ey + limb.pos.y - 8;
            const w = limbKey === 'TORSO' ? 20 : 16;
            const h = limbKey === 'HEAD' ? 12 : 16;
            
            // Box
            ctx.fillStyle = isDead ? '#333' : (isSelected ? 'rgba(255,80,80,0.5)' : 'rgba(100,100,100,0.3)');
            ctx.fillRect(lx, ly, w, h);
            ctx.strokeStyle = isSelected ? '#ff6666' : '#666';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.strokeRect(lx, ly, w, h);
            
            // HP
            if (!isDead) {
                ctx.fillStyle = '#fff';
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(limbState.hp, ex + limb.pos.x, ey + limb.pos.y + 2);
            }
        }
        ctx.textAlign = 'left';
        ctx.lineWidth = 1;
        
        // Selected name
        const sel = LIMBS[LIMB_ORDER[limbIndex]];
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText('Target: ' + sel.name, 120, 160);
    }
    
    function renderPlayerStatus(ctx) {
        // Panel
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(4, 4, 100, 50);
        ctx.strokeStyle = '#444';
        ctx.strokeRect(4, 4, 100, 50);
        
        ctx.font = '9px monospace';
        
        // HP
        ctx.fillStyle = '#888';
        ctx.fillText('HP', 8, 18);
        ctx.fillStyle = '#222';
        ctx.fillRect(24, 10, 74, 10);
        ctx.fillStyle = player.hp < player.maxHp * 0.3 ? '#a03030' : '#30a030';
        ctx.fillRect(24, 10, 74 * (player.hp / player.maxHp), 10);
        ctx.fillStyle = '#fff';
        ctx.fillText(player.hp + '/' + player.maxHp, 28, 18);
        
        // MP
        ctx.fillStyle = '#888';
        ctx.fillText('MP', 8, 32);
        ctx.fillStyle = '#222';
        ctx.fillRect(24, 24, 74, 10);
        ctx.fillStyle = '#3050a0';
        ctx.fillRect(24, 24, 74 * (player.mp / player.maxMp), 10);
        ctx.fillStyle = '#fff';
        ctx.fillText(player.mp + '/' + player.maxMp, 28, 32);
        
        // Status
        if (player.defending) {
            ctx.fillStyle = '#80a0ff';
            ctx.fillText('DEFENDING', 8, 48);
        }
    }
    
    function renderEnemyStatus(ctx) {
        // Panel
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(216, 4, 100, 30);
        ctx.strokeStyle = '#444';
        ctx.strokeRect(216, 4, 100, 30);
        
        ctx.fillStyle = '#c0a0a0';
        ctx.font = '10px monospace';
        ctx.fillText(enemy.name, 220, 16);
        
        // HP bar
        ctx.fillStyle = '#222';
        ctx.fillRect(220, 20, 90, 8);
        ctx.fillStyle = '#a03030';
        ctx.fillRect(220, 20, 90 * (enemy.hp / enemy.maxHp), 8);
    }
    
    function renderActionMenu(ctx) {
        const menuX = 4, menuY = 180;
        const menuW = 80, menuH = 56;
        
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.fillRect(menuX, menuY, menuW, menuH);
        ctx.strokeStyle = '#555';
        ctx.strokeRect(menuX, menuY, menuW, menuH);
        
        ctx.font = '9px monospace';
        
        if (phase === 'select') {
            for (let i = 0; i < ACTIONS.length; i++) {
                const a = ACTIONS[i];
                const isSelected = i === menuIndex;
                ctx.fillStyle = isSelected ? '#ffcc00' : '#888';
                ctx.fillText((isSelected ? '▶ ' : '  ') + a.name, menuX + 4, menuY + 12 + i * 10);
            }
        } else if (phase === 'skill_select') {
            ctx.fillStyle = '#80a0ff';
            ctx.fillText('= Skills =', menuX + 4, menuY + 10);
            
            const skills = player.skills;
            for (let i = 0; i < skills.length; i++) {
                const s = skills[i];
                const canUse = s.mp <= player.mp;
                const isSelected = i === subMenuIndex;
                ctx.fillStyle = !canUse ? '#444' : (isSelected ? '#ffcc00' : '#888');
                const prefix = isSelected ? '▶' : ' ';
                ctx.fillText(prefix + s.name, menuX + 2, menuY + 22 + i * 9);
                ctx.fillStyle = '#6688aa';
                ctx.fillText(s.mp, menuX + 66, menuY + 22 + i * 9);
            }
            
            // Skill desc
            if (skills[subMenuIndex]) {
                ctx.fillStyle = 'rgba(0,0,0,0.9)';
                ctx.fillRect(90, 200, 140, 20);
                ctx.fillStyle = '#aaa';
                ctx.fillText(skills[subMenuIndex].desc, 94, 214);
            }
        } else if (phase === 'item_select') {
            ctx.fillStyle = '#a0ff80';
            ctx.fillText('= Items =', menuX + 4, menuY + 10);
            
            const items = player.inventory.filter(i => i.count > 0);
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const isSelected = i === subMenuIndex;
                ctx.fillStyle = isSelected ? '#ffcc00' : '#888';
                const prefix = isSelected ? '▶' : ' ';
                ctx.fillText(prefix + item.name, menuX + 2, menuY + 22 + i * 9);
                ctx.fillStyle = '#888';
                ctx.fillText('x' + item.count, menuX + 64, menuY + 22 + i * 9);
            }
        }
    }
    
    // === KEY HANDLER ===
    document.addEventListener('keydown', (e) => {
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
    });
    
    return {
        start,
        end,
        update,
        render,
        isActive: () => active
    };
    
})();

console.log('[CombatEnhanced] Initialized');