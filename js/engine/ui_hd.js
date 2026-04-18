/*************************************************************
 * ui_hd.js — High-Definition UI Component Library
 * Reusable canvas drawing primitives for all HD overlays.
 *************************************************************/

const UI_HD = (function() {

    const C = {
        bg:          'rgba(12, 10, 18, 0.94)',
        bgLight:     'rgba(28, 22, 40, 0.97)',
        bgPanel:     'rgba(20, 16, 30, 0.96)',
        border:      '#4a4560',
        borderLight: '#6a6582',
        borderGold:  '#8a7430',
        text:        '#c0b8a0',
        textDim:     '#706858',
        textBright:  '#e8e0cc',
        gold:        '#d4a840',
        goldDim:     '#8a6820',
        health:      '#2a9840',
        healthMid:   '#a87820',
        healthLow:   '#a83020',
        mana:        '#3070c0',
        xp:          '#9040c0',
        enemy:       '#a83020',
        white:       '#ffffff',
        shadow:      'rgba(0,0,0,0.6)',
    };

    // ── PANEL ──────────────────────────────────────────────────
    // Draws a dark panel with double-border and corner ornaments.
    function drawPanel(ctx, x, y, w, h, opts = {}) {
        const { title, cornerSize = 10, alpha = 1 } = opts;

        // Outer shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(x + 4, y + 4, w, h);

        // Main background
        ctx.fillStyle = C.bgPanel;
        ctx.fillRect(x, y, w, h);

        // Subtle inner gradient (lighter top strip)
        ctx.fillStyle = 'rgba(255,255,255,0.025)';
        ctx.fillRect(x + 1, y + 1, w - 2, Math.min(h * 0.3, 30));

        // Outer border
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

        // Inner border (inset)
        ctx.strokeStyle = C.borderLight;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);

        // Corner ornaments (L-shaped brackets)
        ctx.fillStyle = C.gold;
        const cs = cornerSize;
        // Top-left
        ctx.fillRect(x,       y,       cs, 2);
        ctx.fillRect(x,       y,       2,  cs);
        // Top-right
        ctx.fillRect(x+w-cs,  y,       cs, 2);
        ctx.fillRect(x+w-2,   y,       2,  cs);
        // Bottom-left
        ctx.fillRect(x,       y+h-2,   cs, 2);
        ctx.fillRect(x,       y+h-cs,  2,  cs);
        // Bottom-right
        ctx.fillRect(x+w-cs,  y+h-2,   cs, 2);
        ctx.fillRect(x+w-2,   y+h-cs,  2,  cs);

        // Title badge
        if (title) {
            const tw = ctx.measureText(title).width;
            const tx = x + 16;
            const ty = y - 1;
            const bw = tw + 20;
            const bh = 18;
            ctx.fillStyle = C.bgLight;
            ctx.fillRect(tx, ty, bw, bh);
            ctx.strokeStyle = C.borderGold;
            ctx.lineWidth = 1;
            ctx.strokeRect(tx, ty, bw, bh);
            ctx.fillStyle = C.gold;
            ctx.font = 'bold 12px monospace';
            ctx.fillText(title, tx + 10, ty + 13);
        }
    }

    // ── HEADER BAR ─────────────────────────────────────────────
    // A one-line title strip at the top of a panel region.
    function drawHeader(ctx, x, y, w, text) {
        ctx.fillStyle = 'rgba(60,48,16,0.7)';
        ctx.fillRect(x, y, w, 22);
        ctx.strokeStyle = C.borderGold;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, 22);
        ctx.fillStyle = C.gold;
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + w / 2, y + 15);
        ctx.textAlign = 'left';
    }

    // ── STATUS BAR ─────────────────────────────────────────────
    // value/max bar with color, optional flash when low.
    function drawBar(ctx, x, y, w, h, value, max, colorKey, label) {
        const pct   = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
        const now   = performance.now();

        // Trough
        ctx.fillStyle = '#0c0a14';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        if (pct > 0) {
            // Fill color (health goes yellow→red when low)
            let col = C[colorKey] || C.health;
            if (colorKey === 'health') {
                if (pct < 0.25) {
                    col = (Math.floor(now / 400) % 2 === 0) ? C.healthLow : '#cc2828';
                } else if (pct < 0.5) {
                    col = C.healthMid;
                }
            }
            const bw = Math.max(2, (w - 2) * pct) | 0;
            ctx.fillStyle = col;
            ctx.fillRect(x + 1, y + 1, bw, h - 2);

            // Shine strip
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(x + 1, y + 1, bw, Math.ceil((h - 2) * 0.4));

            // Segment ticks every 25%
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            for (let i = 1; i < 4; i++) {
                const tx = x + (w - 2) * i / 4 | 0;
                ctx.fillRect(tx, y + 1, 1, h - 2);
            }
        }

        // Value text
        ctx.fillStyle = pct > 0.15 ? C.textBright : C.textDim;
        ctx.font = `${Math.max(9, h - 4)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${value | 0}/${max | 0}`, x + w / 2, y + h - 3);
        ctx.textAlign = 'left';

        // Label to the left
        if (label) {
            ctx.fillStyle = C.textDim;
            ctx.font = `${Math.max(9, h - 4)}px monospace`;
            ctx.textAlign = 'right';
            ctx.fillText(label, x - 4, y + h - 3);
            ctx.textAlign = 'left';
        }
    }

    // ── BUTTON ─────────────────────────────────────────────────
    function drawButton(ctx, x, y, w, h, text, selected = false, disabled = false) {
        if (disabled) {
            ctx.fillStyle = 'rgba(20,16,28,0.6)';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = C.border;
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = C.textDim;
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(text, x + w / 2, y + h / 2 + 4);
            ctx.textAlign = 'left';
            return;
        }

        // Background
        if (selected) {
            ctx.fillStyle = 'rgba(80,60,16,0.85)';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.fillRect(x, y, w, h / 3);
        } else {
            ctx.fillStyle = C.bgLight;
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fillRect(x, y, w, h / 3);
        }

        // Border
        ctx.strokeStyle = selected ? C.gold : C.border;
        ctx.lineWidth = selected ? 2 : 1;
        ctx.strokeRect(x, y, w, h);

        // Selected: gold left accent bar
        if (selected) {
            ctx.fillStyle = C.gold;
            ctx.fillRect(x, y, 3, h);
            ctx.fillStyle = 'rgba(212,168,64,0.3)';
            ctx.fillRect(x + 3, y, w - 3, h);
        }

        // Text
        ctx.fillStyle = selected ? C.gold : C.text;
        ctx.font = selected ? 'bold 13px monospace' : '13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + w / 2, y + h / 2 + 5);
        ctx.textAlign = 'left';
        ctx.lineWidth = 1;
    }

    // ── ICON SLOT ──────────────────────────────────────────────
    // A square slot for an item icon (empty or with item).
    function drawSlot(ctx, x, y, size, item = null, selected = false, hotkey = '') {
        // Background
        ctx.fillStyle = selected ? 'rgba(60,48,16,0.8)' : 'rgba(14,12,22,0.85)';
        ctx.fillRect(x, y, size, size);

        // Border
        ctx.strokeStyle = selected ? C.gold : C.border;
        ctx.lineWidth = selected ? 2 : 1;
        ctx.strokeRect(x, y, size, size);
        ctx.lineWidth = 1;

        // Inner inset
        ctx.strokeStyle = selected ? C.borderGold : 'rgba(60,56,80,0.5)';
        ctx.strokeRect(x + 3, y + 3, size - 6, size - 6);

        if (item) {
            // Item color blob (placeholder until sprites exist)
            const itemColors = {
                weapon: '#8090b0', armor: '#607080', potion: '#a03040',
                potion_mana: '#3060c0', key: '#c0a030', misc: '#806040',
            };
            const col = itemColors[item.type] || '#705a40';
            const pad = size * 0.2 | 0;
            ctx.fillStyle = col;
            ctx.fillRect(x + pad, y + pad, size - pad * 2, size - pad * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(x + pad, y + pad, size - pad * 2, (size - pad * 2) / 3);

            // Item name truncated
            if (size >= 36) {
                ctx.fillStyle = C.textBright;
                ctx.font = '8px monospace';
                ctx.textAlign = 'center';
                const label = (item.name || '').substring(0, 6);
                ctx.fillText(label, x + size / 2, y + size - 4);
                ctx.textAlign = 'left';
            }

            // Stack count
            if (item.qty > 1) {
                ctx.fillStyle = C.gold;
                ctx.font = 'bold 9px monospace';
                ctx.fillText(item.qty, x + size - 14, y + size - 4);
            }
        }

        // Hotkey hint
        if (hotkey) {
            ctx.fillStyle = C.textDim;
            ctx.font = '8px monospace';
            ctx.fillText(hotkey, x + 3, y + 11);
        }
    }

    // ── COMBAT LOG ENTRY ───────────────────────────────────────
    function drawLogLine(ctx, x, y, w, text, type = 'normal') {
        const cols = {
            normal:   C.text,
            hit:      '#e8b040',
            crit:     '#ff6040',
            miss:     C.textDim,
            heal:     '#40b860',
            damage:   '#d04040',
            system:   '#8080a0',
        };
        ctx.fillStyle = cols[type] || C.text;
        ctx.font = '11px monospace';
        ctx.fillText(text, x, y);
    }

    // ── SEPARATOR LINE ─────────────────────────────────────────
    function drawSeparator(ctx, x, y, w) {
        ctx.fillStyle = C.border;
        ctx.fillRect(x, y, w, 1);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(x, y + 1, w, 1);
    }

    // ── STAT ROW ───────────────────────────────────────────────
    function drawStat(ctx, x, y, label, value, valueColor = null) {
        ctx.fillStyle = C.textDim;
        ctx.font = '11px monospace';
        ctx.fillText(label, x, y);
        ctx.fillStyle = valueColor || C.textBright;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(String(value), x + 120, y);
        ctx.textAlign = 'left';
    }

    // ── DAMAGE POPUP ───────────────────────────────────────────
    // For hit animations — draws a large floating number.
    function drawDamagePopup(ctx, x, y, value, type = 'hit') {
        const size  = type === 'crit' ? 22 : 16;
        const color = type === 'crit' ? '#ff6040' : type === 'heal' ? '#40cc60' : '#e8c040';
        ctx.font = `bold ${size}px monospace`;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillText(String(value), x + 2, y + 2);
        ctx.fillStyle = color;
        ctx.fillText(String(value), x, y);
    }

    // ── FULLSCREEN DARKEN ──────────────────────────────────────
    function darkenScreen(ctx, alpha = 0.6) {
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
    }

    return {
        C,
        drawPanel,
        drawHeader,
        drawBar,
        drawButton,
        drawSlot,
        drawLogLine,
        drawSeparator,
        drawStat,
        drawDamagePopup,
        darkenScreen,
    };
})();

console.log('[UI_HD] Loaded');
