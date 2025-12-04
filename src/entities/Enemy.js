import { Unit } from './Unit.js';
import { Constants } from '../data/Constants.js';

export class Enemy extends Unit {
    constructor(x, y, difficultyConfig) {
        super(x, y, 100 * difficultyConfig.hpMultiplier);
        this.bpRate = 2.5 * difficultyConfig.bpRateMultiplier;
        this.actionSpeedMult = difficultyConfig.actionSpeedMultiplier;
        this.actionTimer = 2.0;
        this.name = "Unknown";
    }

    update(dt) {
        super.update(dt);
        this.bp = Math.min(Constants.MAX_BP, this.bp + this.bpRate * dt);
        this.actionTimer -= dt;
    }
}
