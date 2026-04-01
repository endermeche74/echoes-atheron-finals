/*************************************************************
 * effects_integration.js — Integrates Effects into Game
 * 
 * Patches Engine to use Effects, Particles, and DamageNumbers
 * Load AFTER: engine.js, effects.js, particles.js, damage_numbers.js
 *************************************************************/

(function() {
    
    if (typeof Engine === 'undefined') {
        console.error('[EffectsIntegration] Engine not found!');
        return;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  P A T C H   E N G I N E   R E N D E R
    // ═══════════════════════════════════════════════════════════════
    
    // Store original render loop parts
    const originalRender = Engine.render || function() {};
    
    // We need to modify how the engine renders to include effects
    // Since Engine is an IIFE, we'll hook into it via the game loop
    
    // Create our own render wrapper
    const EffectsRenderer = {
        
        enabled: true,
        
        // Call this before rendering game content
        preRender: function(ctx) {
            if (!this.enabled) return;
            
            // Apply screen shake
            if (typeof Effects !== 'undefined') {
                ctx.save();
                Effects.applyShake(ctx);
            }
        },
        
        // Call this after rendering game content (but before UI)
        postRenderWorld: function(ctx) {
            if (!this.enabled) return;
            
            // Render particles (in world space, affected by camera)
            if (typeof Particles !== 'undefined') {
                Particles.render(ctx);
            }
            
            // Render damage numbers (in world space)
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.render(ctx);
            }
            
            // Restore from shake
            if (typeof Effects !== 'undefined') {
                ctx.restore();
            }
        },
        
        // Call this after ALL rendering (for screen effects)
        postRenderUI: function(ctx, width, height) {
            if (!this.enabled) return;
            
            // Screen effects (flash, vignette, fade)
            if (typeof Effects !== 'undefined') {
                Effects.render(ctx, width, height);
            }
        },
        
        // Update all effect systems
        update: function(dt) {
            if (!this.enabled) return dt;
            
            let scaledDt = dt;
            
            if (typeof Effects !== 'undefined') {
                scaledDt = Effects.update(dt);
            }
            
            if (typeof Particles !== 'undefined') {
                Particles.update(scaledDt);
            }
            
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.update(scaledDt);
            }
            
            return scaledDt;
        }
    };
    
    // Expose renderer for manual integration
    window.EffectsRenderer = EffectsRenderer;
    
    // ═══════════════════════════════════════════════════════════════
    //  A U T O - I N T E G R A T E   I N T O   E N G I N E
    // ═══════════════════════════════════════════════════════════════
    
    // Monkey-patch the Engine if possible
    // This is a bit hacky but works without modifying engine.js
    
    // Try to hook into requestAnimationFrame calls
    const originalRAF = window.requestAnimationFrame;
    let enginePatched = false;
    
    // We'll detect the engine's render by checking canvas
    const checkAndPatch = function() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Create a patched render function
        if (!enginePatched && typeof Engine.getCtx === 'function') {
            
            // Patch into the engine's internal render cycle
            // We do this by wrapping the context methods
            
            const originalSave = ctx.save.bind(ctx);
            const originalRestore = ctx.restore.bind(ctx);
            let saveCount = 0;
            
            // Track render cycle
            ctx.save = function() {
                saveCount++;
                if (saveCount === 1) {
                    // First save in render - apply pre-render effects
                    EffectsRenderer.preRender(ctx);
                }
                return originalSave();
            };
            
            enginePatched = true;
            console.log('[EffectsIntegration] Engine render patched');
        }
    };
    
    // Alternative: Direct integration points
    // These can be called manually from engine.js if modified
    
    window.EffectsHooks = {
        
        // Call at start of game update
        onUpdateStart: function(dt) {
            return EffectsRenderer.update(dt);
        },
        
        // Call after camera transform, before rendering tiles
        onRenderStart: function(ctx) {
            EffectsRenderer.preRender(ctx);
        },
        
        // Call after rendering entities, before restoring camera
        onRenderEntities: function(ctx) {
            // Good place for world-space particles
            if (typeof Particles !== 'undefined') {
                Particles.render(ctx);
            }
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.render(ctx);
            }
        },
        
        // Call after restoring camera, for screen-space effects
        onRenderUI: function(ctx, width, height) {
            EffectsRenderer.postRenderUI(ctx, width, height);
        }
    };
    
    // ═══════════════════════════════════════════════════════════════
    //  P L A Y E R   E F F E C T S
    // ═══════════════════════════════════════════════════════════════
    
    if (typeof Player !== 'undefined') {
        
        // Track last position for footsteps
        let lastFootstepX = 0;
        let lastFootstepY = 0;
        let footstepTimer = 0;
        const FOOTSTEP_INTERVAL = 0.25;
        
        const originalPlayerUpdate = Player.update;
        Player.update = function(dt) {
            originalPlayerUpdate(dt);
            
            // Footstep particles when walking
            if (Player.isMoving()) {
                footstepTimer += dt;
                if (footstepTimer >= FOOTSTEP_INTERVAL) {
                    footstepTimer = 0;
                    const x = Player.getX() + 8;
                    const y = Player.getY() + 16;
                    
                    // Determine tile type for particle color
                    let tileType = 'stone';
                    if (typeof Tilemap !== 'undefined') {
                        const tile = Tilemap.getTile(Player.getTileX(), Player.getTileY());
                        if (tile === 4 || tile === 6) tileType = 'dirt';
                        else if (tile === 5) tileType = 'grass';
                        else if (tile === 7) tileType = 'water';
                    }
                    
                    if (typeof Particles !== 'undefined') {
                        Particles.footstep(x, y, tileType);
                    }
                }
            } else {
                footstepTimer = FOOTSTEP_INTERVAL; // Ready for next walk
            }
        };
        
        // Add effect methods to Player
        Player.onHit = function(damage, isCrit = false) {
            const x = Player.getX() + 8;
            const y = Player.getY();
            
            if (typeof Effects !== 'undefined') {
                if (isCrit) {
                    Effects.criticalHit();
                } else {
                    Effects.playerHit();
                }
            }
            
            if (typeof Particles !== 'undefined') {
                Particles.blood(x, y + 8, Math.PI);
            }
            
            if (typeof DamageNumbers !== 'undefined') {
                if (isCrit) {
                    DamageNumbers.crit(x, y, damage);
                } else {
                    DamageNumbers.damage(x, y, damage);
                }
            }
            
            // Play hurt animation if available
            if (Player.playHurt) Player.playHurt();
        };
        
        Player.onHeal = function(amount) {
            const x = Player.getX() + 8;
            const y = Player.getY();
            
            if (typeof Effects !== 'undefined') {
                Effects.presets.heal();
            }
            
            if (typeof Particles !== 'undefined') {
                Particles.heal(x, y + 8);
            }
            
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.heal(x, y, amount);
            }
        };
        
        Player.onLevelUp = function() {
            const x = Player.getX() + 8;
            const y = Player.getY() + 8;
            
            if (typeof Effects !== 'undefined') {
                Effects.presets.levelUp();
            }
            
            if (typeof Particles !== 'undefined') {
                Particles.levelUp(x, y);
            }
        };
        
        Player.onDeath = function() {
            const x = Player.getX() + 8;
            const y = Player.getY() + 8;
            
            if (typeof Effects !== 'undefined') {
                Effects.presets.playerDeath();
            }
            
            if (typeof Particles !== 'undefined') {
                Particles.dissolve(x, y, '#aa0000');
            }
        };
        
        console.log('[EffectsIntegration] Player effects added');
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  A R E A   T R A N S I T I O N S
    // ═══════════════════════════════════════════════════════════════
    
    if (typeof Engine !== 'undefined' && Engine.triggerAreaChange) {
        
        const originalTriggerAreaChange = Engine.triggerAreaChange;
        
        Engine.triggerAreaChange = function(areaId) {
            if (typeof Effects !== 'undefined') {
                Effects.areaTransition(() => {
                    // Clear particles when changing areas
                    if (typeof Particles !== 'undefined') {
                        Particles.clear();
                    }
                    if (typeof DamageNumbers !== 'undefined') {
                        DamageNumbers.clear();
                    }
                    
                    // Do the actual area change
                    originalTriggerAreaChange(areaId);
                });
            } else {
                originalTriggerAreaChange(areaId);
            }
        };
        
        console.log('[EffectsIntegration] Area transitions patched');
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  C O M B A T   H E L P E R S
    // ═══════════════════════════════════════════════════════════════
    
    // These can be called from your combat system
    window.CombatEffects = {
        
        // Player attacks enemy
        playerAttack: function(enemyX, enemyY, damage, isCrit = false) {
            if (typeof Effects !== 'undefined') {
                if (isCrit) {
                    Effects.criticalHit();
                } else {
                    Effects.enemyHit();
                }
            }
            
            if (typeof Particles !== 'undefined') {
                Particles.blood(enemyX, enemyY, 0);
                Particles.impact(enemyX, enemyY);
            }
            
            if (typeof DamageNumbers !== 'undefined') {
                if (isCrit) {
                    DamageNumbers.crit(enemyX, enemyY - 8, damage);
                } else {
                    DamageNumbers.damage(enemyX, enemyY - 8, damage);
                }
            }
        },
        
        // Enemy attacks player
        enemyAttack: function(damage, isCrit = false) {
            if (typeof Player !== 'undefined' && Player.onHit) {
                Player.onHit(damage, isCrit);
            }
        },
        
        // Player misses
        playerMiss: function(enemyX, enemyY) {
            if (typeof Effects !== 'undefined') {
                Effects.startShake(1, 0.1);
            }
            
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.miss(enemyX, enemyY - 8);
            }
        },
        
        // Enemy dies
        enemyDeath: function(enemyX, enemyY, color = '#555555') {
            if (typeof Effects !== 'undefined') {
                Effects.startShake(3, 0.15);
            }
            
            if (typeof Particles !== 'undefined') {
                Particles.dissolve(enemyX, enemyY, color);
            }
        },
        
        // Boss appears
        bossEncounter: function() {
            if (typeof Effects !== 'undefined') {
                Effects.presets.bossAppear();
            }
        },
        
        // Boss dies
        bossDefeat: function(bossX, bossY) {
            if (typeof Effects !== 'undefined') {
                Effects.presets.bossDefeated();
            }
            
            if (typeof Particles !== 'undefined') {
                // Big explosion
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        Particles.presets.explosion(
                            bossX + (Math.random() - 0.5) * 20,
                            bossY + (Math.random() - 0.5) * 20
                        );
                    }, i * 100);
                }
            }
        },
        
        // Magic spell cast
        spellCast: function(x, y, color = '#88aaff') {
            if (typeof Particles !== 'undefined') {
                Particles.magic(x, y, color);
            }
            
            if (typeof Effects !== 'undefined') {
                Effects.startFlash(color, 0.1, 0.2);
            }
        },
        
        // XP gain
        gainXP: function(x, y, amount) {
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.xp(x, y, amount);
            }
        },
        
        // Gold gain
        gainGold: function(x, y, amount) {
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.gold(x, y, amount);
            }
        },
        
        // Status effect applied
        statusApplied: function(x, y, statusName) {
            if (typeof DamageNumbers !== 'undefined') {
                DamageNumbers.status(x, y, statusName.toUpperCase());
            }
        }
    };
    
    // ═══════════════════════════════════════════════════════════════
    //  M A N U A L   E N G I N E   P A T C H   I N S T R U C T I O N S
    // ═══════════════════════════════════════════════════════════════
    
    /*
    If auto-patching doesn't work, add these lines to engine.js:
    
    In the update() function:
    ```
    function update(dt) {
        // Add at the start:
        if (typeof EffectsHooks !== 'undefined') {
            dt = EffectsHooks.onUpdateStart(dt);
        }
        
        // ... rest of update code ...
    }
    ```
    
    In the render() function:
    ```
    function render() {
        // Clear
        ctx.fillStyle = PALETTE.void;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.save();
        
        // Camera transform
        if (typeof Camera !== 'undefined') {
            const cam = Camera.getOffset();
            ctx.translate(-cam.x, -cam.y);
        }
        
        // Add here - apply shake:
        if (typeof EffectsHooks !== 'undefined') {
            EffectsHooks.onRenderStart(ctx);
        }
        
        // Render tilemap
        if (typeof Tilemap !== 'undefined') {
            Tilemap.render(ctx);
            Tilemap.renderEntities(ctx);
        }
        
        // Render player
        if (typeof Player !== 'undefined') {
            Player.render(ctx);
        }
        
        // Add here - render particles:
        if (typeof EffectsHooks !== 'undefined') {
            EffectsHooks.onRenderEntities(ctx);
        }
        
        ctx.restore();
        
        // Render UI
        renderUI();
        
        // Add here - screen effects:
        if (typeof EffectsHooks !== 'undefined') {
            EffectsHooks.onRenderUI(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }
    ```
    */
    
    console.log('[EffectsIntegration] Complete');
    console.log('[EffectsIntegration] Use CombatEffects.playerAttack(), Player.onHit(), etc.');
    
    // Try to auto-patch
    setTimeout(checkAndPatch, 100);
    
})();