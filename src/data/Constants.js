export const Constants = {
    FPS: 60,
    MAX_BP: 10,
    GROUND_Y_RATIO: 0.8
};

export const TrajectoryTypes = {
    STRAIGHT: 'Straight',
    PARABOLA: 'Parabola',
    HIGH_PARABOLA: 'HighParabola',
    SUBMARINE: 'Submarine',
    SATELLITE: 'Satellite'
};

export const TrajectoryUI = {
    [TrajectoryTypes.STRAIGHT]: { label: '直進', icon: '➡️', colorBg: 'bg-blue-600', colorText: 'text-blue-100', badgeColor: 'bg-blue-600' },
    [TrajectoryTypes.PARABOLA]: { label: '放物線', icon: '⤴️', colorBg: 'bg-emerald-600', colorText: 'text-emerald-100', badgeColor: 'bg-emerald-600' },
    [TrajectoryTypes.HIGH_PARABOLA]: { label: '高弾道', icon: '🚀', colorBg: 'bg-red-600', colorText: 'text-red-100', badgeColor: 'bg-red-600' },
    [TrajectoryTypes.SUBMARINE]: { label: '潜航', icon: '⚓', colorBg: 'bg-indigo-600', colorText: 'text-indigo-100', badgeColor: 'bg-indigo-600' },
    [TrajectoryTypes.SATELLITE]: { label: '衛星', icon: '🛰️', colorBg: 'bg-cyan-600', colorText: 'text-cyan-100', badgeColor: 'bg-cyan-600' }
};