# 武器投げRPG リファクタリング設計書

## 1. 設計方針 (Architecture Overview)

現状の「God Class（神クラス）」状態になっている `Game` クラスを解体し、以下の4つのレイヤーに責務を分散させます。

*   **Core (基盤)**: ゲームループ、シーン遷移、設定管理。
*   **Entities (実体)**: プレイヤー、敵、武器などの状態管理。
*   **Systems (ロジック)**: 戦闘計算、移動計算、AI通信などの純粋なロジック。
*   **UI (表示)**: DOM操作、描画（Canvas）、入力イベント。

適用するデザインパターン:

*   **Strategy Pattern**: 武器ごとの軌道計算（直進、放物線）を切り替え可能にする。
*   **Factory Pattern**: データ定義から武器インスタンスを生成する。
*   **State Pattern**: タイトル、戦闘、結果などのシーン管理。
*   **Dependency Injection (DI)**: 外部サービス（Gemini API）や設定を注入可能にする。

## 2. ディレクトリ・ファイル構成案

```markdown
src/
├── core/
│   ├── GameEngine.js       # メインループ (requestAnimationFrame)
│   ├── SceneManager.js     # シーン管理 (Title, Battle, Result)
│   └── EventEmitter.js     # イベントバス (Observer Pattern)
├── entities/
│   ├── GameObject.js       # 基底クラス (x, y, update, draw)
│   ├── Unit.js             # キャラクター基底 (HP, BP)
│   ├── Player.js           # プレイヤー固有処理
│   ├── Enemy.js            # 敵AI処理
│   └── Weapon.js           # 武器オブジェクト
├── systems/
│   ├── BattleSystem.js     # 衝突判定、ダメージ計算
│   ├── TrajectorySystem.js # 軌道計算ロジック (Strategy)
│   ├── WeaponFactory.js    # 武器生成ファクトリ
│   └── GeminiService.js    # 生成AI通信アダプター
├── ui/
│   ├── UIManager.js        # DOM要素(HPバー等)の更新
│   ├── CanvasRenderer.js   # Canvasへの描画担当
│   └── InputHandler.js     # ユーザー入力の監視
├── data/
│   ├── Constants.js        # 定数 (FPS, ScreenSize)
│   └── WeaponData.js       # 武器のマスタデータ
└── main.js                 # エントリーポイント (DI設定と起動)
```

## 3. 実装イメージ (Pseudo Code)

### 3.1 Systems Layer (ロジックの中核)

#### 軌道計算 (Strategy Pattern)

武器の動きをクラスとして独立させます。新しい軌道（例：波型、追尾）を追加する際も、既存コードを修正せずクラスを追加するだけで済みます。

```javascript
/**
 * 軌道計算のインターフェース
 */
class ITrajectoryStrategy {
    calculate(t, start, end, heightOffset) { throw new Error("Not implemented"); }
}

class StraightTrajectory extends ITrajectoryStrategy {
    calculate(t, start, end, heightOffset) {
        // 線形補間 (Lerp)
        return {
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t
        };
    }
}

class ParabolaTrajectory extends ITrajectoryStrategy {
    calculate(t, start, end, heightOffset) {
        const base = super.calculate(t, start, end); // 直線座標を取得
        const arc = 4 * heightOffset * t * (1 - t);  // 放物線の高さ
        return { x: base.x, y: base.y - arc };
    }
}
```

#### AIサービス (Dependency Injection)

APIキーやエンドポイントを隠蔽し、テスト時にはモック（偽物）に差し替えられるようにします。

```javascript
class GeminiService {
    constructor(apiKey, config) {
        this.apiKey = apiKey;
        this.baseUrl = config.baseUrl;
    }

    async getBossName() {
        const prompt = "ファンタジーRPGのボス名を生成...";
        return this._fetch(prompt);
    }

    async getTacticalAdvice(playerHp, enemyHp) {
        const prompt = `状況: P_HP:${playerHp}, E_HP:${enemyHp}...`;
        return this._fetch(prompt);
    }

    async _fetch(prompt) {
        // 実際のfetch処理。エラーハンドリングもここで行う
    }
}
```

### 3.2 Entities Layer (ゲームオブジェクト)

#### 武器クラス (Factory Pattern)

データ（`WEAPON_DATA`）と振る舞い（`TrajectoryStrategy`）を組み合わせてインスタンス化します。

```javascript
class Weapon extends GameObject {
    constructor(params) {
        super(params.x, params.y);
        this.stats = params.stats; // 攻撃力, 耐久力など
        this.strategy = params.strategy; // 軌道ストラテジーを保持
        this.owner = params.owner;
        this.progress = 0;
    }

    update(dt) {
        this.progress += dt / this.stats.speed;
        // 動きの計算をStrategyに委譲する
        const pos = this.strategy.calculate(
            this.progress, 
            this.startPos, 
            this.targetPos, 
            this.stats.heightOffset
        );
        this.x = pos.x;
        this.y = pos.y;
    }
}

// 武器生成ファクトリ
class WeaponFactory {
    static create(key, owner, startPos, targetPos) {
        const data = WEAPON_DATA[key];
        
        // データに基づいて適切な軌道クラスを選択
        let strategy;
        switch (data.type) {
            case 'Straight': strategy = new StraightTrajectory(); break;
            case 'Parabola': strategy = new ParabolaTrajectory(); break;
            // ...
        }

        return new Weapon({
            stats: data,
            strategy: strategy,
            owner: owner,
            x: startPos.x,
            y: startPos.y
        });
    }
}
```

### 3.3 Core Layer (全体進行)

#### シーン管理 (State Pattern)

`switch(this.state)` で分岐するのではなく、状態そのものをオブジェクトとして扱います。

```javascript
class SceneManager {
    constructor(engine) {
        this.engine = engine;
        this.currentScene = null;
    }

    changeScene(scene) {
        if (this.currentScene) this.currentScene.exit();
        this.currentScene = scene;
        this.currentScene.enter();
    }

    update(dt) {
        if (this.currentScene) this.currentScene.update(dt);
    }

    draw(ctx) {
        if (this.currentScene) this.currentScene.draw(ctx);
    }
}

// 各シーンは update/draw を持つ
class BattleScene {
    constructor(diContainer) {
        this.battleSystem = diContainer.battleSystem;
        this.uiManager = diContainer.uiManager;
    }
    update(dt) {
        this.battleSystem.update(dt);
        this.uiManager.update();
    }
}
```

### 3.4 UI Layer (表示と入力)

#### UIマネージャー (View)

ゲームロジックからDOM操作を分離します。`Game`クラスの中に `document.getElementById` が散乱するのを防ぎます。

```javascript
class UIManager {
    constructor() {
        this.elements = {
            hpBar: document.getElementById('hp-bar'),
            message: document.getElementById('message-area'),
            // ...
        };
    }

    updateHP(playerHp, maxHp) {
        const pct = (playerHp / maxHp) * 100;
        this.elements.hpBar.style.width = `${pct}%`;
    }

    showDialog(text, speaker) {
        // 吹き出し表示ロジック
    }
}
```

## 4. Main Entry Point (統合)

全ての部品を組み立ててゲームを開始します。ここで依存関係の注入（DI）を行います。

```javascript
// main.js

// 1. 設定とサービスの初期化
const geminiService = new GeminiService(API_KEY);
const uiManager = new UIManager();
const inputHandler = new InputHandler();

// 2. システムの初期化
const battleSystem = new BattleSystem();

// 3. 依存関係のコンテナ化 (簡易DI)
const context = {
    gemini: geminiService,
    ui: uiManager,
    battle: battleSystem,
    input: inputHandler
};

// 4. エンジンの起動
const engine = new GameEngine();
const sceneManager = new SceneManager(engine);

// 最初のシーンへ
sceneManager.changeScene(new TitleScene(context));

engine.start();
```
