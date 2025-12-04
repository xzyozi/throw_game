import { Unit } from './Unit.js';
import { Constants } from '../data/Constants.js';

export class Player extends Unit {
    constructor(x, y, deck) {
        super(x, y, 100); // Player HP is initially 100
        this.deck = deck;
        this.cooldowns = {};
        this.deck.forEach(k => this.cooldowns[k] = 0);
    }

    update(dt) {
        super.update(dt);
        this.bp = Math.min(Constants.MAX_BP, this.bp + 2.5 * dt);
        for (let k in this.cooldowns) {
            this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);
        }
    }
}
