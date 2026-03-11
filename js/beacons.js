/**
 * beacons.js - Fox placement + FIXED signal model
 * WLD FoxWave ARDF
 *
 * Signal model fix: minimum signal FLOOR so beacons are always audible
 * when antenna points in their direction, even from far.
 */
"use strict";

let beacons = [];

function placeBeacons() {
    beacons = [];
    for (let i = 0; i < CONFIG.FOX_COUNT; i++) {
        const code  = CONFIG.FOX_CODES[i];
        const color = CONFIG.FOX_COLORS[i];
        const valid = getValidFoxPositions(
            CONFIG.FOX_MIN_DIST_FROM_START,
            beacons.map(b=>({x:b.x,y:b.y})),
            CONFIG.FOX_MIN_DIST_FROM_EACH_OTHER
        );
        const pool  = valid.length > 0 ? valid :
            walkableTiles.filter(t=>Math.hypot(t.x-CONFIG.PLAYER_START_X,t.y-CONFIG.PLAYER_START_Y)>5);
        const pos   = pool[Math.floor(Math.random()*pool.length)];
        beacons.push({ code, index:i, x:pos.x, y:pos.y, color, found:false });
    }
    console.log('[Beacons]', beacons.map(b=>`${b.code}@(${b.x},${b.y})`).join(' '));
}

/**
 * Compute signal strength.
 * FIXED: uses linear (not quadratic) distance falloff + minimum signal floor
 * so you ALWAYS hear something if pointing toward the beacon.
 */
function computeSignal(beacon, playerX, playerY, receiverBearing) {
    const dx = beacon.x - playerX;
    const dy = beacon.y - playerY;
    const dist = Math.hypot(dx, dy);

    // No hard range cutoff — use soft falloff over extended range
    const maxRange = CONFIG.FOX_AUDIO_RADIUS;

    // Bearing from player to beacon (north-up degrees)
    const brgToBeacon = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;

    // Angular difference [-180, 180]
    let angleDiff = receiverBearing - brgToBeacon;
    angleDiff = ((angleDiff+180)%360+360)%360 - 180;

    // Directional gain (cosine² model)
    const halfBeam = CONFIG.RECEIVER_BEAMWIDTH;
    let dirScore = 0;
    if (Math.abs(angleDiff) < halfBeam) {
        const t = Math.cos(angleDiff * Math.PI / (2 * halfBeam));
        dirScore = t * t;
    }

    if (dirScore < 0.01) return 0; // not pointing toward beacon at all

    // Distance score: LINEAR falloff with floor (never drops below MIN_SIGNAL)
    // This ensures you always hear something when pointing in the right direction
    const MIN_SIGNAL = 0.12;  // always at least 12% signal in-direction
    const normDist   = Math.min(1, dist / maxRange);
    const distScore  = MIN_SIGNAL + (1 - MIN_SIGNAL) * (1 - normDist);

    return dirScore * distScore;
}

function bearingToBeacon(beacon, playerX, playerY) {
    return (Math.atan2(beacon.x-playerX, -(beacon.y-playerY)) * 180/Math.PI + 360) % 360;
}

/** Returns dominant (loudest) beacon signal, or null */
function getDominantSignal(playerX, playerY, receiverBearing) {
    let best = null, bestS = CONFIG.AUDIO_MIN_SIGNAL;
    for (const b of beacons) {
        if (b.found) continue;
        const s = computeSignal(b, playerX, playerY, receiverBearing);
        if (s > bestS) { bestS = s; best = {beacon:b, signal:s}; }
    }
    return best;
}

function getAllSignals(playerX, playerY, receiverBearing) {
    return beacons.filter(b=>!b.found)
        .map(b=>({beacon:b, signal:computeSignal(b,playerX,playerY,receiverBearing)}))
        .sort((a,b)=>b.signal-a.signal);
}

function checkFoxDetection(playerX, playerY) {
    for (const b of beacons) {
        if (b.found) continue;
        if (Math.hypot(b.x-playerX, b.y-playerY) <= CONFIG.FOX_DETECTION_RADIUS) {
            b.found = true; Player.findFox(b.code); return b;
        }
    }
    return null;
}

function getBeacons()       { return beacons; }
function getUnfoundBeacons(){ return beacons.filter(b=>!b.found); }
function getFoundBeacons()  { return beacons.filter(b=> b.found); }
