import { TrajectoryTypes } from '../data/Constants.js';

export class TrajectorySystem {
    constructor() {
        this.strategies = {
            [TrajectoryTypes.STRAIGHT]: (sx, sy, tx, ty, p, h) => ({
                x: sx + (tx - sx) * p,
                y: sy + (ty - sy) * p
            }),
            [TrajectoryTypes.PARABOLA]: (sx, sy, tx, ty, p, h) => ({
                x: sx + (tx - sx) * p,
                y: (sy + (ty - sy) * p) - (4 * h * p * (1 - p))
            }),
            [TrajectoryTypes.HIGH_PARABOLA]: (sx, sy, tx, ty, p, h) => ({
                x: sx + (tx - sx) * p,
                y: (sy + (ty - sy) * p) - (4 * h * p * (1 - p))
            }),
            [TrajectoryTypes.SUBMARINE]: (sx, sy, tx, ty, p, h) => ({
                x: sx + (tx - sx) * p,
                y: sy + 20
            })
        };
    }

    calculate(type, ...args) {
        if (type === TrajectoryTypes.SATELLITE) {
            return { x: args[0], y: args[1] };
        }
        const strategy = this.strategies[type];
        if (strategy) {
            return strategy(...args);
        }
        // Default or error handling
        console.warn(`Unknown trajectory type: ${type}`);
        // Fallback to straight line
        return this.strategies[TrajectoryTypes.STRAIGHT](...args);
    }
}
