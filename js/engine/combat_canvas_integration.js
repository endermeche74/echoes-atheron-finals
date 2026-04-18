/*************************************************************
 * combat_canvas_integration.js — Hooks CombatCanvas into game
 * Load AFTER: combat_canvas.js, engine.js
 *************************************************************/

(function() {
    
    if (typeof CombatCanvas === 'undefined') {
        console.error('[CombatIntegration] CombatCanvas not found');
        return;
    }
    
    // === ENEMY DATA ===
    const ENEMIES = {
        wolf: { name: 'Wolf', hp: 35, atk: 8, def: 2, sprite: 'enemy_wolf' },
        ash_wolf: { name: 'Ash Wolf', hp: 40, atk: 10, def: 3, sprite: 'enemy_wolf' },
        bandit: { name: 'Bandit', hp: 45, atk: 12, def: 4, sprite: 'enemy_bandit' },
        shade: { name: 'Shade', hp: 30, atk: 14, def: 2, sprite: 'enemy_spirit' },
        undead_monk: { name: 'Undead Monk', hp: 50, atk: 11, def: 5, sprite: 'enemy_undead' },
        gladiator: { name: 'Gladiator', hp: 60, atk: 14, def: 6, sprite: 'enemy_bandit' },
        cinder_sprite: { name: 'Cinder Sprite', hp: 25, atk: 15, def: 1, sprite: 'enemy_spirit' },
        rock_golem: { name: 'Rock Golem', hp: 80, atk: 12, def: 10, sprite: 'enemy_boss' },
        animated_armor: { name: 'Animated Armor', hp: 70, atk: 13, def: 8, sprite: 'enemy_boss' },
        
        // Bosses
        the_watcher: { name: 'The Watcher', hp: 120, atk: 18, def: 8, sprite: 'enemy_boss', boss: true },
        vault_guardian: { name: 'Vault Guardian', hp: 150, atk: 20, def: 10, sprite: 'enemy_boss', boss: true },
        cinder_guardian: { name: 'Cinder Guardian', hp: 100, atk: 22, def: 6, sprite: 'enemy_boss', boss: true },
        eternal_guardian: { name: 'Eternal Guardian', hp: 200, atk: 25, def: 12, sprite: 'enemy_boss', boss: true }
    };
    
    // === HOOK INTO ENGINE ===
    if (typeof Engine !== 'undefined' && Engine.triggerCombat) {
        const originalTriggerCombat = Engine.triggerCombat;
        
        Engine.triggerCombat = function(enemyId) {
            const enemyData = ENEMIES[enemyId] || { name: enemyId, hp: 40, atk: 10, def: 3 };
            
            CombatCanvas.setCallbacks(
                // Victory
                (enemy) => {
                    console.log('[Combat] Victory vs', enemy.name);
                    // Give XP/gold
                    if (typeof CombatEffects !== 'undefined') {
                        const px = 160, py = 120;
                        CombatEffects.gainXP(px, py - 20, enemy.maxHp);
                        CombatEffects.gainGold(px, py, Math.floor(enemy.maxHp / 2));
                    }
                },
                // Defeat
                () => {
                    console.log('[Combat] Defeat');
                    // Handle game over
                }
            );
            
            CombatCanvas.start(enemyData);
        };
    }
    
    // === RENDER HOOK ===
    const combatCanvas = document.createElement('canvas');
    combatCanvas.id = 'combat-canvas';
    combatCanvas.width = CONFIG.CANVAS_W;
    combatCanvas.height = CONFIG.CANVAS_H;
    combatCanvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        image-rendering: pixelated;
        display: none;
    `;
    
    function addCombatCanvas() {
        const container = document.getElementById('canvas-container');
        if (container && !document.getElementById('combat-canvas')) {
            container.appendChild(combatCanvas);
            startCombatLoop();
            return true;
        }
        return false;
    }
    
    let lastTime = 0;
    function combatLoop(currentTime) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;
        
        if (CombatCanvas.isActive()) {
            combatCanvas.style.display = 'block';
            CombatCanvas.update(dt);
            const ctx = combatCanvas.getContext('2d');
            ctx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
            CombatCanvas.render(ctx);
        } else {
            combatCanvas.style.display = 'none';
        }
        
        requestAnimationFrame(combatLoop);
    }
    
    function startCombatLoop() {
        lastTime = performance.now();
        requestAnimationFrame(combatLoop);
    }
    
    // === TEST FUNCTION ===
    window.testCombat = function(enemyId = 'bandit') {
        Engine.triggerCombat(enemyId);
    };
    
    // Init
    function init() {
        if (!addCombatCanvas()) {
            setTimeout(init, 100);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('[CombatIntegration] Ready - use testCombat("wolf") to test');
    
})();