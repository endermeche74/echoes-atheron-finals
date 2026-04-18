/*************************************************************
 * player.js — Player Entity
 * Handles: position, movement, collision, animation, rendering
 *************************************************************/

const Player = (function() {
    const TILE       = CONFIG.TILE;
    const MOVE_SPEED = CONFIG.PLAYER_SPEED;
    
    // === STATE ===
    let x = 0;       // pixel position
    let y = 0;
    let tx = 0;      // tile position (for collision)
    let ty = 0;
    
    let facing = 'down';  // up, down, left, right
    let isMoving = false;
    let animFrame = 0;
    let animTimer = 0;
    const ANIM_SPEED = 0.15;  // seconds per frame
    
    // Interaction cooldown
    let interactCooldown = 0;
    let transitionCooldown = 0;  // prevents instant re-trigger on new map
    
    // === SYNC WITH GAME STATE ===
    function syncFromState() {
        transitionCooldown = 1.0;  // prevent immediate re-transition after area load
        // P is the game's state object (state.js uses var P, not var state)
        const areaId = (typeof P !== 'undefined' && P.area) ? P.area : 'verath_arch';
        
        if (typeof Maps !== 'undefined') {
            const map = Maps.get(areaId);
            if (map && map.playerSpawn) {
                tx = map.playerSpawn.x;
                ty = map.playerSpawn.y;
            } else {
                // Default spawn
                tx = 5;
                ty = 5;
            }
            x = tx * TILE;
            y = ty * TILE;
        }
        
        // Check for pending spawn from transition
        if (typeof Tilemap !== 'undefined' && Tilemap._pendingSpawn) {
            tx = Tilemap._pendingSpawn.x;
            ty = Tilemap._pendingSpawn.y;
            x = tx * TILE;
            y = ty * TILE;
            Tilemap._pendingSpawn = null;
        }
        
        console.log(`[Player] Synced to (${tx}, ${ty})`);
    }
    
    // === UPDATE ===
    function update(dt) {
        // Cooldowns
        if (interactCooldown > 0)  interactCooldown  -= dt;
        if (transitionCooldown > 0) transitionCooldown -= dt;
        
        // Get input
        const move = Input.getMovementVector();
        
        // Update facing direction
        if (move.x < 0) facing = 'left';
        else if (move.x > 0) facing = 'right';
        else if (move.y < 0) facing = 'up';
        else if (move.y > 0) facing = 'down';
        
        isMoving = (move.x !== 0 || move.y !== 0);
        
        // Calculate new position
        if (isMoving) {
            const newX = x + move.x * MOVE_SPEED * dt;
            const newY = y + move.y * MOVE_SPEED * dt;

            // Try horizontal movement — bump enemy check
            if (canMoveTo(newX, y)) {
                x = newX;
            } else if (interactCooldown <= 0) {
                const bumpedX = getBumpedEnemy(newX, y);
                if (bumpedX) { handleEntity(bumpedX); interactCooldown = 0.5; }
            }

            // Try vertical movement — bump enemy check
            if (canMoveTo(x, newY)) {
                y = newY;
            } else if (interactCooldown <= 0) {
                const bumpedY = getBumpedEnemy(x, newY);
                if (bumpedY) { handleEntity(bumpedY); interactCooldown = 0.5; }
            }
            
            // Update tile position
            tx = Math.floor((x + TILE/2) / TILE);
            ty = Math.floor((y + TILE/2) / TILE);
            
            // Animation
            animTimer += dt;
            if (animTimer >= ANIM_SPEED) {
                animTimer -= ANIM_SPEED;
                animFrame = (animFrame + 1) % 4;
            }
        } else {
            animFrame = 0;
            animTimer = 0;
        }
        
        // Interaction
        if (Input.wasPressed('interact') && interactCooldown <= 0) {
            tryInteract();
            interactCooldown = 0.3;
        }
        
        // Check for area transitions
        checkTransitions();
    }
    
    function canMoveTo(newX, newY) {
        if (typeof Tilemap === 'undefined') return true;

        const hb = CONFIG.PLAYER_HITBOX;
        const corners = [
            { x: newX + hb.x,          y: newY + hb.y          },  // top-left
            { x: newX + hb.x + hb.w,   y: newY + hb.y          },  // top-right
            { x: newX + hb.x,          y: newY + hb.y + hb.h   },  // bottom-left
            { x: newX + hb.x + hb.w,   y: newY + hb.y + hb.h   },  // bottom-right
        ];

        for (const c of corners) {
            const tx = Math.floor(c.x / CONFIG.TILE);
            const ty = Math.floor(c.y / CONFIG.TILE);
            if (Tilemap.isSolid(tx, ty)) return false;
        }
        return true;
    }
    
    function tryInteract() {
        if (typeof Tilemap === 'undefined') return;

        // Scan all entities within 1.5 tiles — no pixel-perfect positioning needed
        const RADIUS = 1.5;
        const pcx = x / TILE + 0.5;   // player center in tile units
        const pcy = y / TILE + 0.5;

        let best = null, bestDist = RADIUS + 1;

        for (const entity of Tilemap.getEntities()) {
            const ecx = entity.x + 0.5;
            const ecy = entity.y + 0.5;
            const dist = Math.hypot(ecx - pcx, ecy - pcy);
            if (dist <= RADIUS && dist < bestDist) {
                best = entity;
                bestDist = dist;
            }
        }

        if (best) handleEntity(best);
    }
    
    function handleEntity(entity) {
        console.log('[Player] Entity found:', entity);
        
        switch (entity.type) {
            case 'npc':
                Engine.triggerDialogue(entity.id);
                break;
                
            case 'enemy':
                Engine.triggerCombat(entity.id);
                break;
                
            case 'item':
                // Pick up item
                if (typeof pickupItem === 'function') {
                    pickupItem(entity.id);
                }
                // Remove from map
                Tilemap.removeEntity(entity);
                break;
                
            case 'exit':
                Engine.triggerAreaChange(entity.target);
                break;
        }
    }
    
    // Return an enemy entity that would be walked into at (newX, newY)
    function getBumpedEnemy(newX, newY) {
        if (typeof Tilemap === 'undefined') return null;
        const hb = CONFIG.PLAYER_HITBOX;
        const corners = [
            { x: newX + hb.x,        y: newY + hb.y         },
            { x: newX + hb.x + hb.w, y: newY + hb.y         },
            { x: newX + hb.x,        y: newY + hb.y + hb.h  },
            { x: newX + hb.x + hb.w, y: newY + hb.y + hb.h  },
        ];
        for (const c of corners) {
            const etx = Math.floor(c.x / TILE);
            const ety = Math.floor(c.y / TILE);
            const entity = Tilemap.getEntityAt(etx, ety);
            if (entity && entity.type === 'enemy') return entity;
        }
        return null;
    }

    function checkTransitions() {
        if (typeof Tilemap === 'undefined' || transitionCooldown > 0) return;
        const transition = Tilemap.getTransitionAt(tx, ty);
        if (transition) {
            transitionCooldown = 1.0;  // 1s grace period after loading new area
            Engine.triggerAreaChange(transition.target, transition.spawnX, transition.spawnY);
        }
    }
    
    // === RENDER ===
    function render(ctx) {
        const PAL = Engine.PALETTE;
        const bobY = isMoving ? Math.sin(animFrame * Math.PI / 2) * 1 : 0;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(x + TILE/2, y + TILE - 1, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark outline (1px border makes player visible on any background)
        ctx.fillStyle = '#111';
        ctx.fillRect(x + 2, y + 3 - bobY, 12, 12);  // body outline
        ctx.fillRect(x + 3, y      - bobY, 10,  8);  // head outline

        // Body — warm tan, clearly distinct from grass/stone
        ctx.fillStyle = '#c8a878';
        ctx.fillRect(x + 3, y + 4 - bobY, 10, 10);

        // Cloak / tunic overlay
        ctx.fillStyle = '#7a5c3a';
        ctx.fillRect(x + 4, y + 6 - bobY, 8, 7);

        // Head
        ctx.fillStyle = '#e0c090';
        ctx.fillRect(x + 4, y + 1 - bobY, 8, 6);

        // Eyes
        ctx.fillStyle = '#1a1a1a';
        switch (facing) {
            case 'down':
                ctx.fillRect(x + 5, y + 3 - bobY, 2, 2);
                ctx.fillRect(x + 9, y + 3 - bobY, 2, 2);
                break;
            case 'up':
                ctx.fillStyle = '#8a7060';
                ctx.fillRect(x + 5, y + 2 - bobY, 6, 3);
                break;
            case 'left':
                ctx.fillRect(x + 4, y + 3 - bobY, 2, 2);
                break;
            case 'right':
                ctx.fillRect(x + 10, y + 3 - bobY, 2, 2);
                break;
        }

        // Legs
        ctx.fillStyle = '#4a3a28';
        if (isMoving) {
            const legOffset = (animFrame % 2) * 3 - 1;
            ctx.fillRect(x + 4,            y + 13, 3, 3);
            ctx.fillRect(x + 9 + legOffset, y + 13, 3, 3);
        } else {
            ctx.fillRect(x + 4, y + 13, 3, 3);
            ctx.fillRect(x + 9, y + 13, 3, 3);
        }
        
        // [E] prompt — same 1.5-tile radius as tryInteract
        if (typeof Tilemap !== 'undefined') {
            const RADIUS = 1.5;
            const pcx = x / TILE + 0.5, pcy = y / TILE + 0.5;
            const nearby = Tilemap.getEntities().some(e =>
                Math.hypot(e.x + 0.5 - pcx, e.y + 0.5 - pcy) <= RADIUS
            );
            if (nearby) {
                ctx.fillStyle = P.uiBg + 'dd';
                ctx.fillRect(x + 4, y - 10, 12, 10);
                ctx.strokeStyle = P.uiBorder;
                ctx.strokeRect(x + 4, y - 10, 12, 10);
                ctx.fillStyle = P.uiHighlight;
                ctx.font = '8px monospace';
                ctx.fillText('E', x + 7, y - 3);
            }
        }
    }
    
    // === PUBLIC API ===
    return {
        update,
        render,
        syncFromState,
        
        // Getters
        getX: () => x,
        getY: () => y,
        getTileX: () => tx,
        getTileY: () => ty,
        getFacing: () => facing,
        isMoving: () => isMoving,
        
        // For camera
        getCenterX: () => x + TILE/2,
        getCenterY: () => y + TILE/2,
        
        // Teleport (for area transitions) — expects tile coordinates
        setPosition: (newTx, newTy) => {
            tx = newTx;
            ty = newTy;
            x = tx * TILE;
            y = ty * TILE;
            transitionCooldown = 1.0;
        }
    };
})();