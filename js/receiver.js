/**
 * receiver.js - Receiver panel: compass rose + S-meter + loop antenna graphic
 * WLD FoxWave ARDF
 *
 * Shows a graphical portable ARDF receiver with:
 *  - Large loop antenna graphic
 *  - Compass rose that rotates with bearing
 *  - S-meter signal strength bars
 *  - Fox code being received
 *  - 3.560 MHz ARDF 80m frequency display
 */
"use strict";

function drawReceiverPanel(ctx, W, H) {
    if (!ctx || !W || !H) return;

    const brg = Player.receiverBearing;
    const dominant = getDominantSignal(Player.x, Player.y, brg);
    const sig = dominant ? dominant.signal : 0;

    ctx.fillStyle = '#050f05';
    ctx.fillRect(0, 0, W, H);

    // ── Title bar ──────────────────────────────────────────────────────────────
    ctx.fillStyle = '#0a2a0a';
    ctx.fillRect(0, 0, W, 38);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 13px "Orbitron", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('📡  80m ARDF RECEIVER', W/2, 19);
    ctx.fillStyle = '#1a4a1a'; ctx.fillRect(0, 38, W, 1);

    // ── Frequency display (like LCD) ───────────────────────────────────────────
    const fdY = 46;
    ctx.fillStyle = '#001200';
    ctx.fillRect(10, fdY, W-20, 34);
    ctx.strokeStyle = '#2a6a2a'; ctx.lineWidth = 1;
    ctx.strokeRect(10, fdY, W-20, 34);
    ctx.fillStyle = '#00ff44';
    ctx.font = 'bold 20px "Share Tech Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('3.560 MHz  CW  80m', W/2, fdY+17);

    // ── Loop antenna graphic ───────────────────────────────────────────────────
    const antCX = W/2, antCY = 135;
    const antR  = Math.min(W*0.26, 60);

    // Rotate the loop to show bearing direction
    ctx.save();
    ctx.translate(antCX, antCY);
    ctx.rotate((brg - 90) * Math.PI/180);

    // Antenna mast
    ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, antR+10); ctx.lineTo(0, -antR-10); ctx.stroke();

    // Loop ring (outer)
    ctx.beginPath(); ctx.arc(0, 0, antR, 0, Math.PI*2);
    ctx.strokeStyle = '#ffdd44'; ctx.lineWidth = 4; ctx.stroke();
    // Loop fill tint — signal strength shown as fill opacity
    const sigAlpha = Math.min(0.45, sig * 0.6);
    ctx.fillStyle = `rgba(255,220,60,${sigAlpha})`;
    ctx.beginPath(); ctx.arc(0, 0, antR, 0, Math.PI*2); ctx.fill();

    // Loop spokes (Minecraft/retro style)
    ctx.strokeStyle = 'rgba(255,220,60,0.4)'; ctx.lineWidth = 1.5;
    for(let i=0;i<8;i++){
        const a=i*Math.PI/4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*(antR*0.15), Math.sin(a)*(antR*0.15));
        ctx.lineTo(Math.cos(a)*antR, Math.sin(a)*antR);
        ctx.stroke();
    }

    // Direction pointer (strongest signal direction)
    ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-antR*0.7); ctx.stroke();
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(0,-antR*0.75);
    ctx.lineTo(-6,-antR*0.55);
    ctx.lineTo(6,-antR*0.55);
    ctx.closePath(); ctx.fill();

    // Centre hub
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();

    ctx.restore();

    // Bearing text
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 22px "Orbitron", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(Math.round(brg)).padStart(3,'0')+'°', W/2, antCY+antR+20);

    // Compass N/E/S/W labels (fixed, not rotating)
    const lblR = antR + 32;
    const lbls = [['N',0],['O',90],['Z',180],['W',270]];
    ctx.font = 'bold 12px "Orbitron", monospace';
    ctx.fillStyle = '#88cc88';
    for(const [lbl,deg] of lbls){
        const a=(deg-90)*Math.PI/180;
        ctx.fillText(lbl, antCX+Math.cos(a)*lblR, antCY+Math.sin(a)*lblR);
    }

    // ── S-Meter ────────────────────────────────────────────────────────────────
    const smY = antCY + antR + 46;
    _drawSMeter(ctx, 14, smY, W-28, 44, sig, dominant);

    // ── Fox code display ───────────────────────────────────────────────────────
    const codeY = smY + 52;
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(10, codeY, W-20, 38);
    ctx.strokeStyle = '#1a3a1a'; ctx.lineWidth=1; ctx.strokeRect(10,codeY,W-20,38);

    if (dominant && sig > CONFIG.AUDIO_MIN_SIGNAL) {
        ctx.fillStyle = dominant.beacon.color;
        ctx.font = 'bold 22px "Orbitron", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(dominant.beacon.code, W/2, codeY+13);
        ctx.fillStyle = '#4ade80';
        ctx.font = '11px "Share Tech Mono", monospace';
        ctx.fillText(getFoxDisplayMorse(dominant.beacon.code), W/2, codeY+30);
    } else {
        ctx.fillStyle = '#2a4a2a';
        ctx.font = '12px "Share Tech Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('— geen signaal —', W/2, codeY+19);
    }

    // ── Controls reminder ─────────────────────────────────────────────────────
    ctx.fillStyle = '#2a5a2a';
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('← →  antenne draaien  ·  [R] terug', W/2, H-4);

    ctx.textBaseline = 'alphabetic';
}

// ── S-Meter ───────────────────────────────────────────────────────────────────
function _drawSMeter(ctx, x, y, w, h, signal, dominant) {
    ctx.fillStyle = '#060f06'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#1a3a1a'; ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);

    ctx.fillStyle = '#3a5a3a';
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('S1  S3  S5  S7  S9  +20  +40', x+4, y+3);

    const barH = h*0.45, barY = y+h*0.4;
    const bars = 28;
    const barW = Math.floor((w-8)/bars);

    for (let i=0; i<bars; i++) {
        const bx = x+4+i*barW;
        const filled = i < Math.floor(signal * bars);
        if (filled) {
            const hue = i<16?'#00cc00': i<22?'#aacc00': i<26?'#ffaa00':'#ff4400';
            ctx.fillStyle = hue;
        } else {
            ctx.fillStyle = '#0a1a0a';
        }
        ctx.fillRect(bx, barY, barW-1, barH);
    }

    // dB readout
    const db = signal > 0.005 ? Math.round(20*Math.log10(signal)) : -60;
    ctx.fillStyle = signal > 0.05 ? '#00ff44' : '#3a5a3a';
    ctx.font = 'bold 12px "Share Tech Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${db} dBm`, x+w-4, y+3);
    ctx.textAlign = 'left';
}
