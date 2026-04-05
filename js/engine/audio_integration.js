/*************************************************************
 * audio_integration.js — Hooks Audio into game
 * Load AFTER: audio.js
 *************************************************************/

(function() {
    
    if (typeof Audio === 'undefined' || !Audio.playSFX) {
        console.warn('[AudioIntegration] Audio not found');
        return;
    }
    
    // === AREA AMBIENCE ===
    const AREA_AMBIENCE = {
        verath_undercity: 'cave',
        keep_depths: 'cave',
        monastery_deep: 'cave',
        colosseum_vault: 'cave',
        
        ashwood_edge: 'forest',
        ashwood_deep: 'forest',
        ashwood_hollow: 'fire',
        ashwood_shrine: 'fire',
        
        piers_shore: 'water',
        piers_dock: 'water',
        piers_diving: 'water',
        
        verath_smithy: 'fire',
        
        road: 'wind',
        crossroads: 'wind',
        watchtower_path: 'wind',
        watchtower_summit: 'wind',
        keep_approach: 'wind',
        monastery_path: 'wind'
    };
    
    // Hook area changes
    if (typeof Tilemap !== 'undefined' && Tilemap.loadArea) {
        const orig = Tilemap.loadArea;
        Tilemap.loadArea = function(areaId) {
            orig(areaId);
            Audio.setAmbient(AREA_AMBIENCE[areaId] || null);
            Audio.playSFX('door');
        };
    }
    
    // === FOOTSTEPS ===
    let footstepTimer = 0;
    const FOOTSTEP_INTERVAL = 0.3;
    
    if (typeof Player !== 'undefined') {
        const origUpdate = Player.update;
        Player.update = function(dt) {
            origUpdate(dt);
            if (Player.isMoving()) {
                footstepTimer += dt;
                if (footstepTimer >= FOOTSTEP_INTERVAL) {
                    footstepTimer = 0;
                    let type = 'stone';
                    if (typeof Tilemap !== 'undefined') {
                        const tile = Tilemap.getTile(Player.getTileX(), Player.getTileY());
                        if (tile === 4 || tile === 6) type = 'dirt';
                        else if (tile === 5) type = 'grass';
                        else if (tile === 7) type = 'water';
                    }
                    Audio.playSFX('footstep_' + type);
                }
            }
        };
        
        // Combat sounds
        const origOnHit = Player.onHit;
        if (origOnHit) {
            Player.onHit = function(dmg, crit) {
                origOnHit(dmg, crit);
                Audio.playSFX(crit ? 'hit_crit' : 'hurt');
            };
        }
        
        const origOnHeal = Player.onHeal;
        if (origOnHeal) {
            Player.onHeal = function(amt) {
                origOnHeal(amt);
                Audio.playSFX('heal');
            };
        }
        
        const origOnLevelUp = Player.onLevelUp;
        if (origOnLevelUp) {
            Player.onLevelUp = function() {
                origOnLevelUp();
                Audio.playSFX('levelup');
            };
        }
    }
    
    // === COMBAT ===
    if (typeof CombatCanvas !== 'undefined') {
        const origStart = CombatCanvas.start;
        CombatCanvas.start = function(data) {
            origStart(data);
            Audio.playMusic(data.boss ? 'boss' : 'combat');
        };
        
        const origEnd = CombatCanvas.end;
        CombatCanvas.end = function(victory) {
            origEnd(victory);
            Audio.playMusic('exploration');
            Audio.playSFX(victory ? 'levelup' : 'death');
        };
        
        const origInput = CombatCanvas.handleInput;
        CombatCanvas.handleInput = function(key) {
            if (key === 'up' || key === 'down' || key === 'left' || key === 'right') {
                Audio.playSFX('menu_move');
            } else if (key === 'confirm') {
                Audio.playSFX('menu_select');
            } else if (key === 'cancel') {
                Audio.playSFX('menu_cancel');
            }
            origInput(key);
        };
    }
    
    // === COMBAT EFFECTS HOOK ===
    if (typeof CombatEffects !== 'undefined') {
        const origPlayerAttack = CombatEffects.playerAttack;
        CombatEffects.playerAttack = function(x, y, dmg, crit) {
            origPlayerAttack(x, y, dmg, crit);
            Audio.playSFX(crit ? 'hit_crit' : 'hit');
        };
        
        const origPlayerMiss = CombatEffects.playerMiss;
        CombatEffects.playerMiss = function(x, y) {
            origPlayerMiss(x, y);
            Audio.playSFX('miss');
        };
        
        const origSpellCast = CombatEffects.spellCast;
        CombatEffects.spellCast = function(x, y, color) {
            origSpellCast(x, y, color);
            Audio.playSFX('magic');
        };
        
        const origGainGold = CombatEffects.gainGold;
        CombatEffects.gainGold = function(x, y, amt) {
            origGainGold(x, y, amt);
            Audio.playSFX('coin');
        };
    }
    
    // Start exploration music
    setTimeout(() => Audio.playMusic('exploration'), 500);
    
    console.log('[AudioIntegration] Ready');
    
})();