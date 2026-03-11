/**
 * audio.js - Web Audio CW morse engine
 * WLD FoxWave ARDF
 *
 * FIXES vs previous version:
 *  - tick() is the ONLY public call needed each frame
 *  - Very low threshold (CONFIG.AUDIO_MIN_SIGNAL) so faint signals still play
 *  - stop() only for game-end, not for state transitions
 *  - No race conditions: scheduling lock + cancelScheduledValues before restart
 */
"use strict";

class AudioEngine {
    constructor() {
        this.ctx        = null;
        this._osc       = null;
        this._envGain   = null;   // morse on/off envelope (0/1)
        this._volGain   = null;   // signal strength master volume
        this._ready     = false;
        this._playing   = false;
        this._foxCode   = null;
        this._nextTime  = 0;
        this._rafId     = null;
        this._LOOK     = 0.40;    // seconds to schedule ahead
        this._lock      = false;
    }

    /** Call once from any user gesture. Safe to call multiple times. */
    init() {
        if (this._ready) {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            return;
        }
        this.ctx      = new (window.AudioContext || window.webkitAudioContext)();
        this._volGain = this.ctx.createGain();
        this._volGain.gain.value = 0;
        this._volGain.connect(this.ctx.destination);

        this._envGain = this.ctx.createGain();
        this._envGain.gain.value = 0;
        this._envGain.connect(this._volGain);

        this._osc = this.ctx.createOscillator();
        this._osc.type = 'sine';
        this._osc.frequency.value = CONFIG.MORSE_FREQUENCY;
        this._osc.connect(this._envGain);
        this._osc.start();

        this._ready = true;
        console.log('[Audio] Init OK, sampleRate:', this.ctx.sampleRate);
    }

    /**
     * Call EVERY animation frame.
     * @param {string|null} foxCode  e.g. 'MOE', null = no signal
     * @param {number}      signal   0–1 strength
     */
    tick(foxCode, signal) {
        if (!this._ready) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const active = foxCode !== null && signal >= CONFIG.AUDIO_MIN_SIGNAL;

        if (!active) {
            if (this._playing) this._softStop();
            return;
        }

        // Fox changed — restart
        if (foxCode !== this._foxCode) {
            this._foxCode  = foxCode;
            this._playing  = false;
            this._cancelEnv();
            this._nextTime = this.ctx.currentTime + 0.05;
        }

        // Update volume
        this._volGain.gain.setTargetAtTime(
            signal * CONFIG.AUDIO_MAX_VOLUME, this.ctx.currentTime, 0.08
        );

        if (!this._playing) {
            this._playing = true;
            this._startRAF();
        }
    }

    /** Hard stop — only for game end, not state transitions */
    stop() {
        this._playing = false;
        this._foxCode = null;
        if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
        if (!this._ready) return;
        this._cancelEnv();
        this._volGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.06);
    }

    _softStop() {
        this._playing = false;
        if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
        if (this._volGain && this.ctx)
            this._volGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
    }

    _cancelEnv() {
        if (!this._envGain || !this.ctx) return;
        const t = this.ctx.currentTime;
        this._envGain.gain.cancelScheduledValues(t);
        this._envGain.gain.setValueAtTime(0, t);
    }

    _startRAF() {
        if (this._rafId) cancelAnimationFrame(this._rafId);
        const run = () => {
            if (!this._playing) return;
            if (!this._lock && this._nextTime < this.ctx.currentTime + this._LOOK) {
                this._lock = true;
                this._schedulePattern();
                this._lock = false;
            }
            this._rafId = requestAnimationFrame(run);
        };
        this._rafId = requestAnimationFrame(run);
    }

    _schedulePattern() {
        if (!this._foxCode) return;
        const pat = getFoxPattern(this._foxCode);
        if (!pat || !pat.length) return;

        const U = CONFIG.MORSE_UNIT_MS / 1000;
        const R = 0.004; // 4ms key-click ramp
        const G = this._envGain.gain;
        const DUR = { [SYM.DIT]:1, [SYM.DAH]:3, [SYM.EG]:1, [SYM.CG]:3, [SYM.WG]:7 };

        let t = this._nextTime;
        for (const sym of pat) {
            const d = (DUR[sym]||1) * U;
            if (sym === SYM.DIT || sym === SYM.DAH) {
                G.setValueAtTime(0, t);
                G.linearRampToValueAtTime(1, t+R);
                G.setValueAtTime(1, t+d-R);
                G.linearRampToValueAtTime(0, t+d);
            }
            t += d;
        }
        this._nextTime = t + CONFIG.MORSE_REPEAT_PAUSE / 1000;
    }

    get isReady() { return this._ready; }
}

const audioEngine = new AudioEngine();
