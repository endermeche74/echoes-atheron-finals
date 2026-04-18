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
        if (typeof Tilemap === 'undefined') return false;

        // Tile directly in front of the player based on facing direction
        let checkX = Math.floor((x + CONFIG.TILE / 2) / CONFIG.TILE);
        let checkY = Math.floor((y + CONFIG.TILE / 2) / CONFIG.TILE);

        switch (facing) {
            case 'up':    checkY -= 1; break;
            case 'down':  checkY += 1; break;
            case 'left':  checkX -= 1; break;
            case 'right': checkX += 1; break;
        }

        // Entity at that tile?
        const entity = Tilemap.getEntityAt(checkX, checkY);
        if (entity) {
            console.log('[Player] Interact:', entity.id, entity.type);
            handleEntity(entity);
            return true;
        }

        // Closed door?
        const tile = Tilemap.getTile(checkX, checkY);
        if (tile === 11) {  // DOOR_CLOSED
            console.log('[Player] Door is locked');
        }

        return false;
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

        // Recompute tile position fresh from pixel position
        const ptx = Math.floor((x + CONFIG.TILE / 2) / CONFIG.TILE);
        const pty = Math.floor((y + CONFIG.TILE / 2) / CONFIG.TILE);

        const transition = Tilemap.getTransitionAt(ptx, pty);
        if (!transition) return;

        console.log('[Player] Transition to:', transition.target, 'spawn:', transition.spawnX, transition.spawnY);
        transitionCooldown = 1.0;

        // Resolve spawn coords (fall back to map default if missing)
        const spawnX = transition.spawnX !== undefined ? transition.spawnX : 5;
        const spawnY = transition.spawnY !== undefined ? transition.spawnY : 5;

        // Load new area (updates camera bounds, entities, tile data)
        Tilemap.loadArea(transition.target);

        // Sync game state area
        if (typeof P !== 'undefined') P.area = transition.target;

        // Place player at spawn (tile → pixel)
        tx = spawnX;
        ty = spawnY;
        x  = tx * CONFIG.TILE;
        y  = ty * CONFIG.TILE;

        // Snap camera to new position
        if (typeof Camera !== 'undefined') Camera.snapToPlayer();
    }
    
    // === RENDER ===
    function render(ctx) {
        const bobY = isMoving ? Math.sin(animFrame * Math.PI / 2) * 1 : 0;

        // Interact prompt check (tile-based, scale-independent)
        let showPrompt = false;
        if (typeof Tilemap !== 'undefined') {
            let fx = Math.floor((x + CONFIG.TILE / 2) / CONFIG.TILE);
            let fy = Math.floor((y + CONFIG.TILE / 2) / CONFIG.TILE);
            if (facing === 'up')    fy -= 1;
            else if (facing === 'down')  fy += 1;
            else if (facing === 'left')  fx -= 1;
            else if (facing === 'right') fx += 1;
            showPrompt = !!Tilemap.getEntityAt(fx, fy);
        }

        // All drawing in 16×16 space; SpriteScaler handles the translate+scale
        SpriteScaler.renderScaled(ctx, function(c, ox, oy) {
            const PAL = Engine.PALETTE;

            // Shadow
            c.fillStyle = 'rgba(0,0,0,0.45)';
            c.beginPath();
            c.ellipse(ox + 8, oy + 15, 6, 2, 0, 0, Math.PI * 2);
            c.fill();

            // Dark outline
            c.fillStyle = '#111';
            c.fillRect(ox + 2, oy + 3 - bobY, 12, 12);
            c.fillRect(ox + 3, oy     - bobY, 10,  8);

            // Body
            c.fillStyle = '#c8a878';
            c.fillRect(ox + 3, oy + 4 - bobY, 10, 10);

            // Cloak
            c.fillStyle = '#7a5c3a';
            c.fillRect(ox + 4, oy + 6 - bobY, 8, 7);

            // Head
            c.fillStyle = '#e0c090';
            c.fillRect(ox + 4, oy + 1 - bobY, 8, 6);

            // Eyes
            c.fillStyle = '#1a1a1a';
            switch (facing) {
                case 'down':
                    c.fillRect(ox + 5, oy + 3 - bobY, 2, 2);
                    c.fillRect(ox + 9, oy + 3 - bobY, 2, 2);
                    break;
                case 'up':
                    c.fillStyle = '#8a7060';
                    c.fillRect(ox + 5, oy + 2 - bobY, 6, 3);
                    break;
                case 'left':
                    c.fillRect(ox + 4, oy + 3 - bobY, 2, 2);
                    break;
                case 'right':
                    c.fillRect(ox + 10, oy + 3 - bobY, 2, 2);
                    break;
            }

            // Legs
            c.fillStyle = '#4a3a28';
            if (isMoving) {
                const legOffset = (animFrame % 2) * 3 - 1;
                c.fillRect(ox + 4,            oy + 13, 3, 3);
                c.fillRect(ox + 9 + legOffset, oy + 13, 3, 3);
            } else {
                c.fillRect(ox + 4, oy + 13, 3, 3);
                c.fillRect(ox + 9, oy + 13, 3, 3);
            }

            // [E] prompt
            if (showPrompt) {
                c.fillStyle = PAL.uiBg + 'dd';
                c.fillRect(ox + 4, oy - 10, 12, 10);
                c.strokeStyle = PAL.uiBorder;
                c.strokeRect(ox + 4, oy - 10, 12, 10);
                c.fillStyle = PAL.uiHighlight;
                c.font = '8px monospace';
                c.fillText('E', ox + 7, oy - 3);
            }
        }, x, y);
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