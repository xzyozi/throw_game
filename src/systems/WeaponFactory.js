import { WeaponData } from '../data/WeaponData.js';
import { Weapon } from '../entities/Weapon.js';
import { TrajectoryTypes } from '../data/Constants.js';

// TODO: Refactor skill logic into a dedicated SkillApplier system as per the design document.
export class WeaponFactory {
    static create(key, owner, startPos, targetPos, forceSkill = false, forceSkillName = null) {
        const data = WeaponData[key];
        if (!data) {
            console.error(`Weapon data not found for key: ${key}`);
            return null;
        }

        let stats = { ...data };
        let activeSkill = null;
        let scale = 1.0;

        let checkSkill = false;
        let skillName = null;

        if (forceSkillName) {
            checkSkill = true;
            skillName = forceSkillName;
        } else {
            checkSkill = owner === 'player' ? forceSkill : (data.skill && (data.skill.rate === 1.00 || Math.random() < data.skill.rate));
            if (checkSkill) skillName = data.skill.name;
        }

        if (checkSkill && skillName) {
            activeSkill = skillName;
            switch (skillName) {
                case "急所突き": case "粉砕": stats.power = Math.floor(stats.power * 2.0); break;
                case "鉄壁": case "硬化": stats.durability = Math.floor(stats.durability * 2.0); break;
                case "貫通": stats.durability = Math.floor(stats.durability * 1.5); break;
                case "強弓": case "狂戦士": stats.speed *= 0.7; stats.power = Math.floor(stats.power * 1.2); break;
                case "大爆発": stats.size *= 3.0; scale = 3.0; break;
                case "魔力暴走": case "一閃": stats.size *= 1.5; stats.power = Math.floor(stats.power * 1.5); scale = 1.5; break;
                case "終末": stats.power += 100; break;
                case "幻影":
                    const types = [TrajectoryTypes.STRAIGHT, TrajectoryTypes.PARABOLA, TrajectoryTypes.HIGH_PARABOLA];
                    stats.type = types[Math.floor(Math.random() * types.length)];
                    if (stats.type === TrajectoryTypes.STRAIGHT) stats.heightOffset = 0;
                    if (stats.type === TrajectoryTypes.PARABOLA) stats.heightOffset = 150;
                    if (stats.type === TrajectoryTypes.HIGH_PARABOLA) stats.heightOffset = 350;
                    break;
                case "多重殻": stats.layer = 3; break;
                // Default skill effect if not specified
                default: stats.power = Math.floor(stats.power * 1.2); break;
            }
        }

        if (activeSkill) {
            stats.activatedSkill = activeSkill;
            stats.color = "#fbbf24"; // Skill activation color
        }

        const weaponParams = {
            ...stats,
            owner,
            scale,
            startX: startPos.x,
            startY: startPos.y,
            targetX: targetPos.x,
            targetY: targetPos.y
        };

        return new Weapon(weaponParams);
    }
}
