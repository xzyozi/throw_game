import { TrajectoryTypes } from './Constants.js';

export const WeaponData = {
    // --- Straight ---
    dagger:   { name: "短剣", icon: "🔪", type: TrajectoryTypes.STRAIGHT, power: 12, durability: 12, cost: 1, speed: 1.5, cooldown: 0.5, heightOffset: 0, size: 24, color: '#94a3b8', label: '直', skill: { name: "早業", rate: 0.20, desc: "クールダウン0" } },
    shuriken: { name: "手裏剣", icon: "⭐", type: TrajectoryTypes.STRAIGHT, power: 8, durability: 6, cost: 1, speed: 1.0, cooldown: 0.2, heightOffset: 0, size: 20, color: '#475569', label: '直', skill: { name: "分身", rate: 0.15, desc: "BP消費なし" } },
    kunai:    { name: "クナイ", icon: "🗡️", type: TrajectoryTypes.STRAIGHT, power: 15, durability: 4, cost: 1, speed: 0.8, cooldown: 0.3, heightOffset: 0, size: 20, color: '#1e293b', label: '直', skill: { name: "急所突き", rate: 0.20, desc: "攻撃力2倍" } },
    bow:      { name: "弓矢", icon: "🏹", type: TrajectoryTypes.STRAIGHT, power: 22, durability: 10, cost: 2, speed: 1.2, cooldown: 0.8, heightOffset: 0, size: 28, color: '#16a34a', label: '直', skill: { name: "強弓", rate: 0.15, desc: "弾速1.5倍＆威力UP" } },
    boomerang:{ name: "ブーメラン", icon: "🪃", type: TrajectoryTypes.STRAIGHT, power: 15, durability: 20, cost: 2, speed: 1.5, cooldown: 0.8, heightOffset: 0, size: 26, color: '#f97316', label: '直', skill: { name: "往復", rate: 1.00, desc: "行きと帰りで攻撃" } }, // New
    spear:    { name: "槍", icon: "🔱", type: TrajectoryTypes.STRAIGHT, power: 25, durability: 30, cost: 2, speed: 1.8, cooldown: 1.0, heightOffset: 0, size: 30, color: '#fcd34d', label: '直', skill: { name: "貫通", rate: 0.20, desc: "耐久力1.5倍" } },
    dualblades:{ name: "双剣", icon: "⚔️", type: TrajectoryTypes.STRAIGHT, power: 20, durability: 20, cost: 3, speed: 1.5, cooldown: 1.0, heightOffset: 0, size: 26, color: '#06b6d4', label: '直', skill: { name: "連射", rate: 0.30, desc: "2連射" } },
    rocket:   { name: "ロケット", icon: "🚀", type: TrajectoryTypes.STRAIGHT, power: 40, durability: 15, cost: 3, speed: 2.0, cooldown: 2.0, heightOffset: 0, size: 32, color: '#ef4444', label: '直', skill: { name: "加速", rate: 1.00, desc: "中盤から急加速" } },
    magnet:   { name: "磁石", icon: "🧲", type: TrajectoryTypes.STRAIGHT, power: 5, durability: 50, cost: 3, speed: 0.8, cooldown: 1.5, heightOffset: 0, size: 32, color: '#ef4444', label: '直', skill: { name: "磁場", rate: 1.00, desc: "敵武器を吸い寄せる" } }, // New
    ufo:      { name: "UFO", icon: "🛸", type: TrajectoryTypes.STRAIGHT, power: 20, durability: 20, cost: 3, speed: 1.5, cooldown: 1.5, heightOffset: 0, size: 34, color: '#a78bfa', label: '直', skill: { name: "ポータル", rate: 1.00, desc: "画面端をループ" } },
    pilebunker:{ name: "パイル", icon: "🔩", type: TrajectoryTypes.STRAIGHT, power: 50, durability: 50, cost: 4, speed: 1.2, cooldown: 2.0, heightOffset: 0, size: 36, color: '#64748b', label: '直', skill: { name: "掘削", rate: 1.00, desc: "破壊時も減速せず貫通" } }, // New (Drill alternative)
    tuna:     { name: "マグロ", icon: "🐟", type: TrajectoryTypes.STRAIGHT, power: 40, durability: 60, cost: 4, speed: 1.0, cooldown: 2.5, heightOffset: 0, size: 44, color: '#60a5fa', label: '直', skill: { name: "鮮度", rate: 1.00, desc: "敵武器を凍結" } }, // New
    magic:    { name: "魔弾", icon: "🔮", type: TrajectoryTypes.STRAIGHT, power: 45, durability: 1, cost: 3, speed: 2.0, cooldown: 1.2, heightOffset: 0, size: 26, color: '#a855f7', label: '直', skill: { name: "魔力暴走", rate: 0.15, desc: "攻撃力1.5倍＆巨大化" } },
    drill:    { name: "ドリル", icon: "🌀", type: TrajectoryTypes.SUBMARINE, power: 30, durability: 999, cost: 3, speed: 1.0, cooldown: 2.0, heightOffset: 0, size: 30, color: '#4b5563', label: '潜', skill: { name: "潜航", rate: 1.00, desc: "衝突無視で本体直撃" } },
    fan:      { name: "扇", icon: "🍃", type: TrajectoryTypes.STRAIGHT, power: 10, durability: 20, cost: 5, speed: 0.5, cooldown: 4.0, heightOffset: 0, size: 36, color: '#86efac', label: '直', skill: { name: "追い風", rate: 1.00, desc: "敵武器を押し戻す" } },
    gravity_orb:{ name: "重力玉", icon: "⚫", type: TrajectoryTypes.STRAIGHT, power: 10, durability: 30, cost: 4, speed: 0.8, cooldown: 3.0, heightOffset: 0, size: 40, color: '#1e1b4b', label: '直', skill: { name: "重力場", rate: 1.00, desc: "敵弾を吸い寄せる" } },
    gatling:  { name: "ガトリング", icon: "🔫", type: TrajectoryTypes.STRAIGHT, power: 15, durability: 10, cost: 5, speed: 2.0, cooldown: 3.0, heightOffset: 0, size: 30, color: '#1f2937', label: '直', skill: { name: "乱射", rate: 1.00, desc: "3連射(確定)" } },
    staff:    { name: "聖典", icon: "📖", type: TrajectoryTypes.STRAIGHT, power: 10, durability: 80, cost: 4, speed: 3.5, cooldown: 2.5, heightOffset: 0, size: 32, color: '#f472b6', label: '直', skill: { name: "祈り", rate: 0.25, desc: "BP2回復" } }, 
    cloud:    { name: "雷雲", icon: "☁️", type: TrajectoryTypes.STRAIGHT, power: 30, durability: 40, cost: 5, speed: 0.5, cooldown: 3.0, heightOffset: -250, size: 50, color: '#64748b', label: '直', skill: { name: "落雷", rate: 1.00, desc: "真下に攻撃" } }, // New

    // --- Parabola ---
    oilpot:   { name: "油壺", icon: "🏺", type: TrajectoryTypes.PARABOLA, power: 20, durability: 1, cost: 2, speed: 1.8, cooldown: 1.0, heightOffset: 150, size: 26, color: '#7c2d12', label: '放', skill: { name: "炎上", rate: 1.00, desc: "着弾地点を燃やす" } }, // New
    sword:    { name: "剣", icon: "🗡️", type: TrajectoryTypes.PARABOLA, power: 30, durability: 30, cost: 3, speed: 2.0, cooldown: 1.2, heightOffset: 150, size: 32, color: '#3b82f6', label: '放', skill: { name: "剣技", rate: 0.15, desc: "攻撃力1.3倍＆耐久UP" } },
    shield:   { name: "盾", icon: "🛡️", type: TrajectoryTypes.PARABOLA, power: 5, durability: 120, cost: 3, speed: 2.8, cooldown: 2.0, heightOffset: 150, size: 48, color: '#64748b', label: '放', skill: { name: "鉄壁", rate: 0.20, desc: "耐久力2倍" } },
    net:      { name: "ネット", icon: "🕸️", type: TrajectoryTypes.PARABOLA, power: 10, durability: 10, cost: 3, speed: 2.0, cooldown: 1.5, heightOffset: 150, size: 30, color: '#e2e8f0', label: '放', skill: { name: "粘着", rate: 1.00, desc: "敵に張り付き自爆" } },
    squid:    { name: "イカ", icon: "🦑", type: TrajectoryTypes.PARABOLA, power: 25, durability: 20, cost: 3, speed: 2.0, cooldown: 1.5, heightOffset: 150, size: 30, color: '#f87171', label: '放', skill: { name: "目潰し", rate: 1.00, desc: "敵の狙いを狂わせる" } },
    matryoshka:{ name: "マトリョーシカ", icon: "🪆", type: TrajectoryTypes.PARABOLA, power: 15, durability: 30, cost: 4, speed: 2.0, cooldown: 2.5, heightOffset: 150, size: 40, color: '#fca5a5', label: '放', skill: { name: "多重殻", rate: 1.00, desc: "3回まで中身が出て復活" } },
    thunder:  { name: "雷鼓", icon: "⚡", type: TrajectoryTypes.PARABOLA, power: 25, durability: 25, cost: 4, speed: 2.2, cooldown: 2.0, heightOffset: 150, size: 32, color: '#ffff00', label: '放', skill: { name: "連鎖雷", rate: 1.00, desc: "衝突時に周囲へ放電" } },
    ghostsword:{ name: "幽霊剣", icon: "👻", type: TrajectoryTypes.PARABOLA, power: 35, durability: 20, cost: 4, speed: 2.2, cooldown: 1.8, heightOffset: 150, size: 34, color: '#a855f7', label: '放', skill: { name: "幻影", rate: 0.40, desc: "軌道変化" } },
    scythe:   { name: "鎌", icon: "⛏️", type: TrajectoryTypes.PARABOLA, power: 45, durability: 20, cost: 4, speed: 1.8, cooldown: 1.5, heightOffset: 150, size: 36, color: '#7c3aed', label: '放', skill: { name: "死霊蘇生", rate: 0.30, desc: "敵武器を奪う" } },
    hammer:   { name: "槌", icon: "🔨", type: TrajectoryTypes.PARABOLA, power: 40, durability: 50, cost: 4, speed: 2.5, cooldown: 2.0, heightOffset: 150, size: 38, color: '#a855f7', label: '放', skill: { name: "粉砕", rate: 0.15, desc: "攻撃力1.5倍" } },
    greatsword:{ name: "大剣", icon: "🗡", type: TrajectoryTypes.PARABOLA, power: 60, durability: 60, cost: 5, speed: 3.0, cooldown: 3.0, heightOffset: 150, size: 44, color: '#1d4ed8', label: '放', skill: { name: "一閃", rate: 0.15, desc: "巨大化＆攻撃力UP" } },

    // --- High Parabola ---
    beehive:  { name: "蜂の巣", icon: "🐝", type: TrajectoryTypes.HIGH_PARABOLA, power: 5, durability: 1, cost: 3, speed: 2.0, cooldown: 2.0, heightOffset: 300, size: 30, color: '#facc15', label: '高', skill: { name: "襲撃", rate: 1.00, desc: "破壊時に蜂が追撃" } }, // New
    fireworks:{ name: "花火", icon: "🎆", type: TrajectoryTypes.HIGH_PARABOLA, power: 20, durability: 1, cost: 3, speed: 2.0, cooldown: 2.0, heightOffset: 350, size: 30, color: '#ef4444', label: '高', skill: { name: "分裂", rate: 1.00, desc: "消滅時に3分裂" } },
    slot:     { name: "スロット", icon: "🎰", type: TrajectoryTypes.HIGH_PARABOLA, power: 30, durability: 30, cost: 4, speed: 2.5, cooldown: 3.0, heightOffset: 300, size: 36, color: '#facc15', label: '高', skill: { name: "運試し", rate: 1.00, desc: "ヒット時にランダム効果" } },
    axe:      { name: "斧", icon: "🪓", type: TrajectoryTypes.HIGH_PARABOLA, power: 55, durability: 60, cost: 5, speed: 3.0, cooldown: 3.0, heightOffset: 300, size: 40, color: '#ef4444', label: '高', skill: { name: "狂戦士", rate: 0.15, desc: "攻撃力1.5倍＆弾速UP" } },
    bomb:     { name: "爆弾", icon: "💣", type: TrajectoryTypes.HIGH_PARABOLA, power: 80, durability: 1, cost: 4, speed: 2.5, cooldown: 3.0, heightOffset: 300, size: 30, color: '#1f2937', label: '高', skill: { name: "大爆発", rate: 0.20, desc: "サイズ3倍" } },
    rock:     { name: "岩石", icon: "🪨", type: TrajectoryTypes.HIGH_PARABOLA, power: 70, durability: 50, cost: 5, speed: 3.5, cooldown: 3.5, heightOffset: 350, size: 42, color: '#ca8a04', label: '高', skill: { name: "硬化", rate: 0.20, desc: "耐久力2倍" } },
    meteor:   { name: "隕石", icon: "☄️", type: TrajectoryTypes.HIGH_PARABOLA, power: 99, durability: 80, cost: 6, speed: 4.0, cooldown: 5.0, heightOffset: 350, size: 50, color: '#dc2626', label: '高', skill: { name: "終末", rate: 0.10, desc: "攻撃力+100" } },
    
    // Satellite
    bit:      { name: "ビット", icon: "🛰️", type: TrajectoryTypes.SATELLITE, power: 15, durability: 40, cost: 4, speed: 0, cooldown: 5.0, heightOffset: 0, size: 24, color: '#0ea5e9', label: '衛', skill: { name: "サテライト", rate: 1.00, desc: "周囲を旋回・迎撃" } }
};
