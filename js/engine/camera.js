
/*************************************************************
 * camera.js — Camera/Viewport Handler
 * Handles: following player, smooth movement, bounds clamping
 *************************************************************/

const Camera = (function() {

    // === STATE ===
    let x = 0;  // top-left corner of viewport in world coords
    let y = 0;

    // Map bounds in pixels (updated on every loadArea)
    let boundsW = CONFIG.GRID_W * CONFIG.TILE;
    let boundsH = CONFIG.GRID_H * CONFIG.TILE;

    // === UPDATE ===
    function update(dt) {
        if (typeof Player === 'undefined') return;

        // Target: centre le joueur dans le viewport
        let targetX = Player.getX() + CONFIG.TILE / 2 - CONFIG.CANVAS_W / 2;
        let targetY = Player.getY() + CONFIG.TILE / 2 - CONFIG.CANVAS_H / 2;

        // Clamp aux bounds de la map
        targetX = Math.max(0, Math.min(boundsW - CONFIG.CANVAS_W, targetX));
        targetY = Math.max(0, Math.min(boundsH - CONFIG.CANVAS_H, targetY));

        // Smooth follow (frame-rate independent)
        x += (targetX - x) * 8 * dt;
        y += (targetY - y) * 8 * dt;
    }

    function setMapBounds(mapPixelWidth, mapPixelHeight) {
        boundsW = mapPixelWidth;
        boundsH = mapPixelHeight;
    }

    function snapToPlayer() {
        if (typeof Player === 'undefined') return;

        x = Player.getX() + CONFIG.TILE / 2 - CONFIG.CANVAS_W / 2;
        y = Player.getY() + CONFIG.TILE / 2 - CONFIG.CANVAS_H / 2;

        x = Math.max(0, Math.min(boundsW - CONFIG.CANVAS_W, x));
        y = Math.max(0, Math.min(boundsH - CONFIG.CANVAS_H, y));
    }

    // === PUBLIC API ===
    return {
        update,
        setMapBounds,
        snapToPlayer,

        getOffset: () => ({ x: Math.floor(x), y: Math.floor(y) }),
        getX: () => x,
        getY: () => y,

        // Force camera position (used by debug free-cam)
        setOffset: (nx, ny) => { x = nx; y = ny; },

        // Screen ↔ world conversions
        screenToWorld: (sx, sy) => ({ x: sx + x, y: sy + y }),
        worldToScreen: (wx, wy) => ({ x: wx - x, y: wy - y }),

        // Check if world position is on-screen
        isVisible: (wx, wy, margin = 0) =>
            wx >= x - margin &&
            wx <= x + CONFIG.CANVAS_W + margin &&
            wy >= y - margin &&
            wy <= y + CONFIG.CANVAS_H + margin
    };
})();