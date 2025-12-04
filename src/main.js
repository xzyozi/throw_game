import { EventEmitter } from './core/EventEmitter.js';
import { GameEngine } from './core/GameEngine.js';
import { GeminiService } from './systems/GeminiService.js';
import { BattleScene } from './systems/BattleScene.js';
import { UIManager } from './ui/UIManager.js';
import { WeaponSelectScene } from './ui/WeaponSelectScene.js';
import { DifficultySettings } from './data/DifficultyConfig.js';

// --- Main Entry Point ---

// 1. Initialization
const apiKey = ""; // API Key should be handled securely
const eventEmitter = new EventEmitter();
const uiManager = new UIManager(eventEmitter);
const geminiService = new GeminiService(apiKey);
const gameEngine = new GameEngine();
const weaponSelectScene = new WeaponSelectScene(uiManager);

// 2. Dependency Injection Container
const context = {
    engine: gameEngine,
    gemini: geminiService,
    ui: uiManager,
    events: eventEmitter
};

const battleScene = new BattleScene(context);

// 3. State and UI Event Handling
let selectedDiff = 'normal';

// Title Screen
document.getElementById('btn-start-game').onclick = () => {
    document.getElementById('title-screen').classList.add('hidden');
    weaponSelectScene.show();
};
document.getElementById('btn-show-settings').onclick = () => {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('settings-screen').classList.remove('hidden');
};

// Settings Screen
document.getElementById('btn-back-title').onclick = () => {
    document.getElementById('settings-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.remove('hidden');
};
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.onclick = (e) => {
        selectedDiff = e.target.dataset.diff;
        document.querySelectorAll('.diff-btn').forEach(b => {
            b.classList.add('opacity-50');
            b.classList.remove('border-white', 'shadow-lg', 'scale-105');
        });
        e.target.classList.remove('opacity-50');
        e.target.classList.add('border-white', 'shadow-lg', 'scale-105');
        document.getElementById('diff-desc').innerText = DifficultySettings[selectedDiff].description;
    };
});

// Result Screen
document.getElementById('btn-retry').onclick = () => {
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('damage-container').innerHTML = '';
    document.getElementById('skill-display-container').innerHTML = '';
    document.getElementById('enemy-bubble').classList.remove('show');
    weaponSelectScene.show();
};
document.getElementById('btn-to-title').onclick = () => {
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('title-screen').classList.remove('hidden');
    document.getElementById('damage-container').innerHTML = '';
    document.getElementById('skill-display-container').innerHTML = '';
    document.getElementById('enemy-bubble').classList.remove('show');
};

// 4. Game Start Event
eventEmitter.on('scene:battle_start', (deck) => {
    battleScene.init(selectedDiff, deck);
    gameEngine.start(
        (dt) => battleScene.update(dt),
        () => battleScene.draw()
    );
});

// 5. Initial Resize
battleScene.resize();

console.log("Game initialized.");
