export class GameEngine {
    constructor() {
        this.lastTime = 0;
        this.isRunning = false;
        this.updateCallback = null;
        this.drawCallback = null;
        this.timeScale = 1.0;
        this.hitStopTimer = 0;
    }

    start(update, draw) {
        this.updateCallback = update;
        this.drawCallback = draw;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.isRunning = false;
    }

    triggerHitStop(duration) {
        this.hitStopTimer = duration;
        this.timeScale = 0.05;
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const rawDt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.hitStopTimer > 0) {
            this.hitStopTimer -= rawDt;
            if (this.hitStopTimer <= 0) {
                this.timeScale = 1.0;
            }
        }

        const dt = Math.min(rawDt, 0.1) * this.timeScale;

        if (this.updateCallback) {
            this.updateCallback(dt);
        }
        if (this.drawCallback) {
            this.drawCallback();
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}
