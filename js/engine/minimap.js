/*************************************************************
 * minimap.js — Corner minimap + quest markers
 *************************************************************/

const Minimap = (function() {
    
    let enabled = true;
    let scale = 2; // pixels per tile
    let size = 60; // minimap size
    let margin = 8;
    
    const markers = [];
    
    function addMarker(x, y, type = 'quest', label = '') {
        markers.push({ x, y, type, label });
    }
    
    function clearMarkers() {
        markers.length = 0;
    }
    
    function render(ctx, canvasW, canvasH) {
        if (!enabled) return;
        if (typeof Tilemap === 'undefined' || typeof Player === 'undefined') return;
        
        const map = Tilemap.getCurrentMap();
        if (!map) return;
        
        const mapW = map.width || 20;
        const mapH = map.height || 15;
        
        const px = Player.getTileX();
        const py = Player.getTileY();
        
        const viewTiles = Math.floor(size / scale);
        const halfView = Math.floor(viewTiles / 2);
        
        const startX = Math.max(0, Math.min(mapW - viewTiles, px - halfView));
        const startY = Math.max(0, Math.min(mapH - viewTiles, py - halfView));
        
        const mx = canvasW - size - margin;
        const my = margin;
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(mx - 2, my - 2, size + 4, size + 4);
        
        // Tiles
        for (let ty = 0; ty < viewTiles && startY + ty < mapH; ty++) {
            for (let tx = 0; tx < viewTiles && startX + tx < mapW; tx++) {
                const tile = Tilemap.getTile(startX + tx, startY + ty);
                let color = '#222';
                
                if (tile === 0) color = '#111'; // void
                else if (tile === 1) color = '#555'; // floor
                else if (tile === 2 || tile === 3) color = '#333'; // wall
                else if (tile >= 4 && tile <= 6) color = '#4a4'; // dirt/grass/path
                else if (tile === 7) color = '#46a'; // water
                else if (tile >= 20 && tile <= 25) color = '#664'; // exits
                
                ctx.fillStyle = color;
                ctx.fillRect(mx + tx * scale, my + ty * scale, scale, scale);
            }
        }
        
        // Entities
        const entities = Tilemap.getEntities ? Tilemap.getEntities() : [];
        for (const e of entities) {
            const ex = e.x - startX;
            const ey = e.y - startY;
            if (ex >= 0 && ex < viewTiles && ey >= 0 && ey < viewTiles) {
                if (e.type === 'npc') ctx.fillStyle = e.hasQuest ? '#ff0' : '#0af';
                else if (e.type === 'enemy') ctx.fillStyle = '#f44';
                else ctx.fillStyle = '#fa0';
                ctx.fillRect(mx + ex * scale, my + ey * scale, scale, scale);
            }
        }
        
        // Player
        const ppx = px - startX;
        const ppy = py - startY;
        ctx.fillStyle = '#fff';
        ctx.fillRect(mx + ppx * scale, my + ppy * scale, scale, scale);
        
        // Border
        ctx.strokeStyle = '#888';
        ctx.strokeRect(mx - 2, my - 2, size + 4, size + 4);
    }
    
    function toggle() { enabled = !enabled; }
    function setEnabled(v) { enabled = v; }
    
    return { render, toggle, setEnabled, addMarker, clearMarkers };
})();

console.log('[Minimap] Initialized');