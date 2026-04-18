/*************************************************************
 * sprite_integration.js — Integrates sprite system into game
 * 
 * This file patches Player and Tilemap to use the Sprites system.
 * Load AFTER: sprites.js, spritedata.js, player.js, tilemap.js
 *************************************************************/

(function() {
    
    // ═══════════════════════════════════════════════════════════════
    //  P A T C H   P L A Y E R
    // ═══════════════════════════════════════════════════════════════
    
    if (typeof Player !== 'undefined' && typeof Sprites !== 'undefined') {
        
        // Create animation controller for player
        const playerAnim = Sprites.createAnimController('player');
        
        // Store original render
        const originalPlayerRender = Player.render;
        
        // Override render
        Player.render = function(ctx) {
            // Update animation state based on player state
            const isMoving = Player.isMoving();
            const facing = Player.getFacing();
            
            // Set animation state
            if (isMoving) {
                playerAnim.setState(Sprites.ANIM_STATES.WALK);
            } else {
                playerAnim.setState(Sprites.ANIM_STATES.IDLE);
            }
            
            // Set direction
            playerAnim.setDirection(facing);
            
            // Get position
            const x = Player.getX();
            const y = Player.getY();
            
            // Render using sprite system
            Sprites.render(ctx, 'player', x, y, playerAnim);
            
            // Still draw interaction prompt if near entity
            drawInteractionPrompt(ctx, x, y);
        };
        
        // Add update call for animation
        const originalPlayerUpdate = Player.update;
        Player.update = function(dt) {
            originalPlayerUpdate(dt);
            playerAnim.update(dt);
        };
        
        // Helper: draw interaction prompt
        function drawInteractionPrompt(ctx, x, y) {
            if (typeof Tilemap === 'undefined') return;
            
            const tx = Player.getTileX();
            const ty = Player.getTileY();
            const facing = Player.getFacing();
            
            let checkX = tx, checkY = ty;
            switch (facing) {
                case 'up':    checkY -= 1; break;
                case 'down':  checkY += 1; break;
                case 'left':  checkX -= 1; break;
                case 'right': checkX += 1; break;
            }
            
            const entity = Tilemap.getEntityAt(checkX, checkY);
            if (entity) {
                const P = Engine.PALETTE;
                ctx.fillStyle = P.uiBg + 'dd';
                ctx.fillRect(x + 4, y - 10, 12, 10);
                ctx.strokeStyle = P.uiBorder;
                ctx.strokeRect(x + 4, y - 10, 12, 10);
                ctx.fillStyle = P.uiHighlight;
                ctx.font = '8px monospace';
                ctx.fillText('E', x + 7, y - 3);
            }
        }
        
        // Expose animation controller for external use
        Player.getAnimController = function() {
            return playerAnim;
        };
        
        // Add hurt/attack animation triggers
        Player.playHurt = function() {
            playerAnim.setState(Sprites.ANIM_STATES.HURT);
            playerAnim.onComplete = () => {
                playerAnim.setState(Sprites.ANIM_STATES.IDLE);
            };
        };
        
        Player.playAttack = function() {
            playerAnim.setState(Sprites.ANIM_STATES.ATTACK);
            playerAnim.onComplete = () => {
                playerAnim.setState(Sprites.ANIM_STATES.IDLE);
            };
        };
        
        console.log('[SpriteIntegration] Player patched');
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  P A T C H   T I L E M A P   E N T I T I E S
    // ═══════════════════════════════════════════════════════════════
    
    if (typeof Tilemap !== 'undefined' && typeof Sprites !== 'undefined') {
        
        // Entity animation controllers cache
        const entityAnims = new Map();
        
        // Get or create animation controller for entity
        function getEntityAnim(entity) {
            const key = `${entity.type}_${entity.id}_${entity.x}_${entity.y}`;
            
            if (!entityAnims.has(key)) {
                // Determine sprite ID based on entity type and id
                let spriteId = getSpriteIdForEntity(entity);
                entityAnims.set(key, Sprites.createAnimController(spriteId));
            }
            
            return entityAnims.get(key);
        }
        
        // Map entity to sprite ID
        function getSpriteIdForEntity(entity) {
            const id = entity.id || '';
            const type = entity.type || '';
            
            // === NPCs ===
            if (type === 'npc') {
                // Check for specific NPC types
                if (id.includes('monk') || id.includes('seiran') || id.includes('orath')) {
                    return 'npc_monk';
                }
                if (id.includes('guard') || id.includes('soldier') || id.includes('warden')) {
                    return 'npc_guard';
                }
                if (id.includes('merchant') || id.includes('vendor') || id.includes('smith') || id.includes('bram')) {
                    return 'npc_merchant';
                }
                if (id.includes('elder') || id.includes('vae') || id.includes('agatha')) {
                    return 'npc_elder';
                }
                if (id.includes('hooded') || id.includes('smuggler') || id.includes('liss') || id.includes('petra')) {
                    return 'npc_hooded';
                }
                if (id.includes('captain') || id.includes('sailor') || id.includes('noa') || id.includes('sorn')) {
                    return 'npc_sailor';
                }
                if (id.includes('ash') || id.includes('wynn') || id.includes('kern')) {
                    return 'npc_ashfolk';
                }
                if (id.includes('guardian') || id.includes('indexer') || id.includes('warden')) {
                    return 'npc_warden';
                }
                return 'npc_default';
            }
            
            // === Enemies ===
            if (type === 'enemy') {
                if (id.includes('wolf') || id.includes('dog') || id.includes('lion')) {
                    return 'enemy_wolf';
                }
                if (id.includes('bandit') || id.includes('thug') || id.includes('gladiator')) {
                    return 'enemy_bandit';
                }
                if (id.includes('undead') || id.includes('skeleton') || id.includes('drowned')) {
                    return 'enemy_undead';
                }
                if (id.includes('spirit') || id.includes('ghost') || id.includes('shade') || id.includes('wisp')) {
                    return 'enemy_spirit';
                }
                if (id.includes('guardian') || id.includes('golem') || id.includes('armor') || id.includes('boss')) {
                    return 'enemy_boss';
                }
                return 'enemy_bandit'; // Default enemy
            }
            
            // === Items ===
            if (type === 'item') {
                if (id.includes('chest') || id.includes('coffer')) {
                    return 'item_chest';
                }
                return 'item_default';
            }
            
            return 'default';
        }
        
        // Store original render function
        const originalRenderEntities = Tilemap.renderEntities;
        
        // Override entity rendering
        Tilemap.renderEntities = function(ctx) {
            const entities = Tilemap.getEntities();
            
            for (const entity of entities) {
                const px = entity.x * CONFIG.TILE;
                const py = entity.y * CONFIG.TILE;
                
                // Get animation controller
                const anim = getEntityAnim(entity);
                
                // Update animation
                anim.update(0.016); // Approximate 60fps
                
                // Set direction based on entity facing or default
                if (entity.facing) {
                    anim.setDirection(entity.facing);
                }
                
                // Get sprite ID
                const spriteId = getSpriteIdForEntity(entity);
                
                // Check if entity has quest marker
                const sprite = Sprites.get(spriteId);
                if (sprite && sprite.palette && entity.hasQuest) {
                    sprite.palette.hasQuest = true;
                } else if (sprite && sprite.palette) {
                    sprite.palette.hasQuest = false;
                }
                
                // Render sprite
                Sprites.render(ctx, spriteId, px, py, anim);
                
                // Draw quest marker separately for entities that have quests
                if (entity.hasQuest) {
                    ctx.fillStyle = '#ffdd44';
                    ctx.shadowColor = '#ffdd44';
                    ctx.shadowBlur = 4;
                    ctx.font = 'bold 10px monospace';
                    ctx.fillText('!', px + 6, py - 2);
                    ctx.shadowBlur = 0;
                }
            }
        };
        
        // Add method to update entity animations
        Tilemap.updateEntityAnimations = function(dt) {
            const entities = Tilemap.getEntities();
            for (const entity of entities) {
                const anim = getEntityAnim(entity);
                if (anim) {
                    anim.update(dt);
                }
            }
        };
        
        // Clear animation cache when area changes
        const originalLoadArea = Tilemap.loadArea;
        Tilemap.loadArea = function(areaId) {
            entityAnims.clear();
            originalLoadArea(areaId);
        };
        
        console.log('[SpriteIntegration] Tilemap patched');
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  U T I L I T Y   F U N C T I O N S
    // ═══════════════════════════════════════════════════════════════
    
    // Global sprite utilities
    window.SpriteUtils = {
        // Play a one-shot animation on an entity
        playAnimation: function(entityOrPlayer, animState) {
            let anim;
            if (entityOrPlayer === Player || entityOrPlayer === 'player') {
                anim = Player.getAnimController();
            }
            if (anim) {
                anim.setState(animState);
            }
        },
        
        // Get current sprite for debugging
        getCurrentSprite: function(id) {
            return Sprites.get(id);
        },
        
        // List all registered sprites
        listSprites: function() {
            return Sprites.listSprites();
        }
    };
    
    console.log('[SpriteIntegration] Complete');
    
})();