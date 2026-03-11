/**
 * player.js - Player state: 3D float position + all game state
 * WLD FoxWave ARDF
 */
"use strict";

const Player = {
    // ── 3D floating point position (tile units) ───────────────────────────────
    px: CONFIG.PLAYER_START_X + 0.5,
    py: CONFIG.PLAYER_START_Y + 0.5,
    viewAngle: Math.PI,   // radians, 0=North, clockwise; PI=South (facing park)

    // ── Tile position (integer, derived from px/py) ───────────────────────────
    get x() { return Math.floor(this.px); },
    get y() { return Math.floor(this.py); },

    facing: 180,          // degrees for 2D map display

    // ── Receiver ──────────────────────────────────────────────────────────────
    receiverBearing: 0,
    receiverOn: false,    // receiver is ON while in RECEIVER state

    // ── Found foxes ───────────────────────────────────────────────────────────
    foundFoxes: new Set(),
    bearingLines: [],
    _bearingLineIdCounter: 0,

    // ── Input ─────────────────────────────────────────────────────────────────
    keysHeld: { forward:false, back:false, left:false, right:false, strafeL:false, strafeR:false },

    name: '',
    gameStartTime: null,
    gameEndTime:   null,
    bearingInput:  '',

    // ── ON4BB hint ────────────────────────────────────────────────────────────
    lastHintTime:  0,
    hintVisible:   false,
    hintText:      '',
    hintTimer:     0,

    // ── Reset ─────────────────────────────────────────────────────────────────
    reset() {
        this.px = CONFIG.PLAYER_START_X + 0.5;
        this.py = CONFIG.PLAYER_START_Y + 0.5;
        this.viewAngle       = Math.PI;
        this.facing          = 180;
        this.receiverBearing = 0;
        this.receiverOn      = false;
        this.foundFoxes      = new Set();
        this.bearingLines    = [];
        this._bearingLineIdCounter = 0;
        this.keysHeld        = { forward:false, back:false, left:false, right:false, strafeL:false, strafeR:false };
        this.gameStartTime   = null;
        this.gameEndTime     = null;
        this.bearingInput    = '';
        this.lastHintTime    = 0;
        this.hintVisible     = false;
        this.hintText        = '';
        this.hintTimer       = 0;
    },

    // ── 3D Movement ───────────────────────────────────────────────────────────
    moveForward(speed) {
        const dx = Math.sin(this.viewAngle) * speed;
        const dy = -Math.cos(this.viewAngle) * speed;
        this._tryMove(dx, dy);
        this.facing = Math.round((this.viewAngle * 180 / Math.PI + 360) % 360);
    },

    strafe(speed) {
        const sa = this.viewAngle + Math.PI / 2;
        this._tryMove(Math.sin(sa) * speed, -Math.cos(sa) * speed);
    },

    _tryMove(dx, dy) {
        const margin = 0.28;
        const nx = this.px + dx;
        const ny = this.py + dy;
        // Separate X/Y collision so sliding along walls works
        if (!isSolid3D(Math.floor(nx + (dx>0?margin:-margin)), Math.floor(this.py)))
            this.px = nx;
        if (!isSolid3D(Math.floor(this.px), Math.floor(ny + (dy>0?margin:-margin))))
            this.py = ny;
    },

    rotateView(delta) {
        this.viewAngle = ((this.viewAngle + delta) % (Math.PI*2) + Math.PI*2) % (Math.PI*2);
        this.facing    = Math.round((this.viewAngle * 180 / Math.PI + 360) % 360);
    },

    // ── Receiver ──────────────────────────────────────────────────────────────
    rotateReceiver(delta) {
        this.receiverBearing = ((this.receiverBearing + delta) % 360 + 360) % 360;
    },

    // ── Fox & bearing ─────────────────────────────────────────────────────────
    findFox(code) { this.foundFoxes.add(code); },

    addBearingLine(bearing) {
        const ci = this.bearingLines.length % CONFIG.BEARING_COLORS.length;
        this.bearingLines.push({
            fromX: this.x, fromY: this.y,
            bearing: ((bearing%360)+360)%360,
            color: CONFIG.BEARING_COLORS[ci],
            id: ++this._bearingLineIdCounter,
        });
    },

    removeBearingLine(id) {
        this.bearingLines = this.bearingLines.filter(l=>l.id!==id);
    },

    // ── Timer ─────────────────────────────────────────────────────────────────
    startTimer() { this.gameStartTime = Date.now(); },
    stopTimer()  { this.gameEndTime   = Date.now(); },

    getElapsedString() {
        if (!this.gameStartTime) return '00:00';
        const s = Math.floor(((this.gameEndTime||Date.now())-this.gameStartTime)/1000);
        return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
    },
    getElapsedSeconds() {
        if (!this.gameStartTime) return 0;
        return Math.floor(((this.gameEndTime||Date.now())-this.gameStartTime)/1000);
    },

    // ── Computed ──────────────────────────────────────────────────────────────
    get allFoxesFound() { return this.foundFoxes.size >= CONFIG.FOX_COUNT; },
    get atStart() {
        return Math.abs(this.px-(CONFIG.PLAYER_START_X+0.5))<2 &&
               Math.abs(this.py-(CONFIG.PLAYER_START_Y+0.5))<2;
    },
};
