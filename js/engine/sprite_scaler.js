/*************************************************************
 * sprite_scaler.js — Universal sprite scaling helper
 * Draws all sprites in 16×16 space, scaled by CONFIG.TILE / 16
 * Load AFTER config.js, BEFORE player.js / tilemap.js
 *************************************************************/

const SpriteScaler = {

    // Scale factor: 1 at TILE=16, 2 at TILE=32, etc.
    getScale() {
        return CONFIG.TILE / 16;
    },

    // Draw a sprite at world position (x, y).
    // drawFunc receives (ctx, 0, 0) — always draws in 16×16 space.
    renderScaled(ctx, drawFunc, x, y) {
        const scale = this.getScale();

        if (scale === 1) {
            drawFunc(ctx, x, y);
            return;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        drawFunc(ctx, 0, 0);
        ctx.restore();
    }
};
