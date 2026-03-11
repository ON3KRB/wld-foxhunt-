/**
 * ui.js - Right-bottom info panel (3 COLUMNS side by side)
 * WLD FoxWave ARDF
 *
 * Layout: [FOX STATUS] | [MODE + TIMER] | [CONTROLS]
 * Each column gets full panel height → much bigger text
 */
"use strict";

function drawInfoPanel(ctx, W, H, gameState) {
    ctx.fillStyle = '#040c04';
    ctx.fillRect(0, 0, W, H);

    const col = Math.floor(W / 3);
    const divC = '#1a3a1a';

    // Column dividers
    ctx.fillStyle = divC;
    ctx.fillRect(col, 0, 1, H);
    ctx.fillRect(col*2, 0, 1, H);

    _drawFoxColumn(ctx, 0, 0, col, H);
    _drawStatusColumn(ctx, col+1, 0, col-1, H, gameState);
    _drawControlsColumn(ctx, col*2+1, 0, W-col*2-1, H, gameState);
}

// ── Column 1: Fox tracker ─────────────────────────────────────────────────────
function _drawFoxColumn(ctx, cx, cy, cw, ch) {
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(cx, cy, cw, ch);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 13px "Orbitron", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('🦊 VOSSEN', cx+cw/2, cy+6);

    ctx.fillStyle = '#1a3a1a'; ctx.fillRect(cx, cy+24, cw, 1);

    const slotH = Math.floor((ch - 28) / CONFIG.FOX_COUNT);

    for (let i = 0; i < CONFIG.FOX_COUNT; i++) {
        const code  = CONFIG.FOX_CODES[i];
        const color = CONFIG.FOX_COLORS[i];
        const found = Player.foundFoxes.has(code);
        const sy = cy + 26 + i * slotH;
        const sh = slotH - 2;

        ctx.fillStyle = found ? color+'2a' : '#080f08';
        ctx.fillRect(cx+4, sy, cw-8, sh);

        if (found) {
            ctx.fillStyle = color;
            ctx.font = `bold ${Math.min(16,sh*0.55)}px "Orbitron", monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('✓ '+code, cx+cw/2, sy+sh/2);
        } else {
            ctx.fillStyle = '#2a3a2a';
            ctx.font = `bold ${Math.min(15,sh*0.5)}px "Orbitron", monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('#'+(i+1)+' ?', cx+cw/2, sy+sh/2);
        }
    }
    ctx.textBaseline='alphabetic';
}

// ── Column 2: Status + timer + bearing input ──────────────────────────────────
function _drawStatusColumn(ctx, cx, cy, cw, ch, gameState) {
    const modeMap = {
        [STATE.BRIEFING]: { label:'KLAAR',    col:'#888888' },
        [STATE.HUNTING]:  { label:'WANDELEN', col:'#4ade80' },
        [STATE.RECEIVER]: { label:'RECEIVER', col:'#ffd700' },
        [STATE.MAP_VIEW]: { label:'KAART',    col:'#44aaff' },
        [STATE.FINISHED]: { label:'TERUG!',   col:'#ff8844' },
    };
    const m = modeMap[gameState] || {label:'—',col:'#444'};

    // Mode badge
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(cx, cy, cw, 36);
    ctx.fillStyle = m.col;
    ctx.font = 'bold 14px "Orbitron", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(m.label, cx+cw/2, cy+18);
    ctx.fillStyle = '#1a3a1a'; ctx.fillRect(cx,cy+36,cw,1);

    // Timer
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 28px "Share Tech Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(Player.getElapsedString(), cx+cw/2, cy+65);

    ctx.fillStyle = '#2a5a2a';
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.fillText('LOOPTIJD', cx+cw/2, cy+84);

    ctx.fillStyle = '#1a3a1a'; ctx.fillRect(cx,cy+90,cw,1);

    // Receiver bearing
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px "Share Tech Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(Math.round(Player.receiverBearing)).padStart(3,'0')+'°', cx+cw/2, cy+110);

    ctx.fillStyle = '#2a5a2a';
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.fillText('PEILING', cx+cw/2, cy+125);

    ctx.fillStyle = '#1a3a1a'; ctx.fillRect(cx,cy+130,cw,1);

    // Bearing input (map mode)
    if (gameState === STATE.MAP_VIEW) {
        ctx.fillStyle = '#44aaff';
        ctx.font = 'bold 24px "Share Tech Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText((Player.bearingInput||'___')+'°', cx+cw/2, cy+152);
        ctx.fillStyle = '#2a4a6a';
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.fillText('TYPE PEILING', cx+cw/2, cy+167);
    }

    // Fox count progress
    ctx.fillStyle = '#ffd700';
    ctx.font = `bold 18px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${Player.foundFoxes.size} / ${CONFIG.FOX_COUNT}`, cx+cw/2, ch-30);
    ctx.fillStyle = '#2a5a2a';
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.fillText('gevonden', cx+cw/2, ch-14);

    ctx.textBaseline='alphabetic';
}

// ── Column 3: Controls (BIG, readable, 16px font) ────────────────────────────
function _drawControlsColumn(ctx, cx, cy, cw, ch, gameState) {
    ctx.fillStyle = '#060e06';
    ctx.fillRect(cx, cy, cw, ch);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 12px "Orbitron", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('TOETSEN', cx+cw/2, cy+5);
    ctx.fillStyle='#1a3a1a'; ctx.fillRect(cx,cy+20,cw,1);

    const rows = [
        // [section, key, desc, activeState]
        ['🦶', '↑↓←→',  'bewegen', STATE.HUNTING],
        ['🦶', 'WASD',   'bewegen', STATE.HUNTING],
        ['🦶', 'Muis',   'rondkijken', STATE.HUNTING],
        ['📡', 'R',      'receiver', STATE.RECEIVER],
        ['📡', '← →',   'antenne°', STATE.RECEIVER],
        ['🗺', 'M',      'kaart', STATE.MAP_VIEW],
        ['🗺', '0–9+↵', 'peiling', STATE.MAP_VIEW],
        ['⚙', 'H',      'start', 'always'],
        ['⚙', '?',      'hint/ON4BB', 'always'],
        ['⚙', 'Esc',    'hint sluiten', 'always'],
    ];

    const avail = ch - 24;
    const rowH  = Math.max(20, Math.min(26, Math.floor(avail / rows.length)));
    const fs    = Math.max(13, Math.min(16, rowH - 4));
    const kW    = Math.max(44, Math.floor(cw * 0.42));
    const pad   = 6;

    let ry = cy + 23;

    for (const [icon, key, desc, activeS] of rows) {
        if (ry + rowH > cy + ch - 2) break;
        const active = activeS === 'always' || activeS === gameState;

        // Row bg
        ctx.fillStyle = active ? '#080f08' : '#040804';
        ctx.fillRect(cx, ry, cw, rowH);

        // Key badge
        ctx.fillStyle   = active ? '#142214' : '#080f08';
        ctx.strokeStyle = active ? '#3a7a3a' : '#1a2a1a';
        ctx.lineWidth   = 1;
        ctx.fillRect(cx+pad, ry+2, kW, rowH-4);
        ctx.strokeRect(cx+pad, ry+2, kW, rowH-4);

        ctx.fillStyle    = active ? '#ffd700' : '#2a4a2a';
        ctx.font         = `bold ${fs}px "Share Tech Mono", monospace`;
        ctx.textAlign    = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(key, cx+pad+kW/2, ry+rowH/2);

        ctx.fillStyle = active ? '#cceecc' : '#243824';
        ctx.font      = `${fs}px "Share Tech Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(desc, cx+pad+kW+6, ry+rowH/2);

        ry += rowH;
    }

    // Morse legend at bottom
    ctx.fillStyle='#0a1a0a'; ctx.fillRect(cx,ch-22,cw,22);
    ctx.fillStyle='#1a3a1a'; ctx.fillRect(cx,ch-22,cw,1);
    ctx.font=`10px "Share Tech Mono",monospace`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const parts=CONFIG.FOX_CODES.slice(0,CONFIG.FOX_COUNT).map((c,i)=>{
        const found=Player.foundFoxes.has(c);
        return {c, m:getFoxDisplayMorse(c), color:found?CONFIG.FOX_COLORS[i]:'#2a4a2a'};
    });
    const pw=cw/parts.length;
    parts.forEach((p,i)=>{
        ctx.fillStyle=p.color;
        ctx.fillText(`${p.c}:${p.m}`, cx+i*pw+pw/2, ch-11);
    });
    ctx.textBaseline='alphabetic'; ctx.textAlign='left';
}

// ── Overlay helpers ───────────────────────────────────────────────────────────
function showSplash()         {document.getElementById('overlay-splash').classList.remove('hidden');}
function hideSplash()         {document.getElementById('overlay-splash').classList.add('hidden');}
function showRegistration()   {document.getElementById('overlay-registration').classList.remove('hidden');}
function hideRegistration()   {document.getElementById('overlay-registration').classList.add('hidden');}
function showBriefing()       {document.getElementById('overlay-briefing').classList.remove('hidden');}
function hideBriefing()       {document.getElementById('overlay-briefing').classList.add('hidden');}
function showFinishedOverlay(){document.getElementById('overlay-finished').classList.remove('hidden');}
function hideFinishedOverlay(){document.getElementById('overlay-finished').classList.add('hidden');}

function showFoxFoundFlash(beacon) {
    const el = document.getElementById('fox-found-flash');
    if (!el) return;
    el.innerHTML=`<div class="fox-found-inner">
        <div class="fox-found-icon">🦊</div>
        <div class="fox-found-code" style="color:${beacon.color}">${beacon.code}</div>
        <div class="fox-found-morse">${getFoxDisplayMorse(beacon.code)}</div>
        <div class="fox-found-msg">VOSJE GEVONDEN! ${Player.foundFoxes.size}/${CONFIG.FOX_COUNT}</div>
    </div>`;
    el.classList.remove('hidden'); el.classList.add('show');
    setTimeout(()=>{el.classList.remove('show');el.classList.add('hidden');}, 2500);
}
