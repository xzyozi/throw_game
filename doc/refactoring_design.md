# 武器投げRPG リファクタリング設計書 
## 1. 設計方針 (Architecture Overview)

現状の「God Class（神クラス）」状態を解体し、以下の4つのレイヤーに責務を分散させます。

*   **Core (基盤)**: ゲームループ、シーン遷移、設定管理
*   **Entities (実体)**: キャラクター、敵、武器などの状態管理
*   **Systems (ロジック)**: 戦闘計算、軌道計算、AI戦略などの純粋なロジック
*   **UI (表示)**: DOM操作、描画（Canvas）、入力イベント

適用するデザインパターン:

*   **Strategy Pattern**: 軌道計算、AI戦略
*   **Factory Pattern**: 武器生成、キャラクター生成
*   **State Pattern**: シーン管理
*   **Dependency Injection**: 依存関係の注入
*   **Object Pool Pattern**: パーティクル・ライトニングの再利用

---

## 2. ディレクトリ・ファイル構成案

```
src/
├── core/
│   ├── GameEngine.js
│   ├── SceneManager.js
│   └── EventEmitter.js
├── entities/
│   ├── GameObject.js
│   ├── Unit.js
│   ├── Character.js        # 新規: キャラクター基底
│   ├── Player.js
│   ├── Enemy.js
│   └── Weapon.js
├── systems/
│   ├── TrajectorySystem.js
│   ├── SkillApplier.js     # 新規: スキル効果一元管理
│   ├── SkillTrigger.js     # 新規: スキル発動判定
│   ├── AIStrategy.js       # 新規: 敵AI戦略
│   ├── CollisionDetector.js # 新規: 衝突判定精度向上
│   ├── WeaponFactory.js
│   └── BattleSystem.js
├── pooling/
│   ├── ObjectPool.js       # 新規
│   ├── ParticlePool.js     # 新規
│   └── LightningPool.js    # 新規
├── ui/
│   ├── UIManager.js
│   ├── CanvasRenderer.js
│   └── InputHandler.js
├── data/
│   ├── Constants.js
│   ├── WeaponData.js
│   ├── SkillData.js        # 新規
│   └── DifficultyConfig.js
└── main.js
```

---

## 3. 主要な改訂内容

### 3.1 TrajectoryStrategy (軌道計算の抽象化)

```javascript
// 基底クラス
class TrajectoryStrategy {
    calculate(t, sx, sy, tx, ty, heightOffset) {
        throw new Error("Must be implemented by subclass");
    }
}

// 具体的な実装クラス
class StraightTrajectory extends TrajectoryStrategy { /* ... */ }
class ParabolaTrajectory extends TrajectoryStrategy { /* ... */ }
class SubmarineTrajectory extends TrajectoryStrategy {
    // 中点で最も深く潜航する実装
}
```

**改訂点**: 
- インターフェース化により、新しい軌道タイプの追加が容易
- Submarine は単なる固定値ではなく、実際の潜航ロジックを実装

---

### 3.2 SkillApplier (スキル効果の一元管理 - 新規)

```javascript
class SkillApplier {
    static apply(skillName, stats) {
        const skillEffects = {
            "急所突き": (s) => ({ ...s, power: Math.floor(s.power * 2.0) }),
            "貫通": (s) => ({ ...s, durability: Math.floor(s.durability * 1.5) }),
            // ... その他スキル
        };
        return skillEffects[skillName]?.(stats) ?? stats;
    }
}
```

**改訂点**:
- WeaponFactory の switch 文をこのクラスに集約
- スキル追加時は SkillApplier を修正するのみ
- 責務が明確で拡張性向上

---

### 3.3 SkillTrigger (スキル発動判定の統一 - 新規)

```javascript
class SkillTrigger {
    static shouldTrigger(skillData, isForced = false, randomFn = Math.random) {
        if (isForced) return true;
        if (!skillData) return false;
        if (skillData.triggerRate === 1.0) return true;
        return randomFn() < skillData.triggerRate;
    }
}
```

**改訂点**:
- 重複していた判定ロジックを統一
- randomFn をパラメータにしてテスト容易性向上
- スキルデータ取得機能も組み込み

---

### 3.4 AIStrategy (敵AI戦略 - 新規)

```javascript
class AIStrategy {
    static selectWeapon(enemy, player, difficulty, randomFn = Math.random) {
        // HP が低い場合は回復スキル優先
        if (enemy.hp < enemy.maxHp * 0.3) { /* ... */ }
        
        // 難度に応じた武器選択戦略
        switch (difficulty) {
            case 'easy': return lowPowerWeapon();
            case 'normal': return mediumPowerWeapon();
            case 'hard': return highPowerWeapon();
        }
    }
}
```

**改訂点**:
- ランダムな武器選択から戦略的な選択へ
- HP・BP・難度を考慮した判断
- 難度設定の有効活用

---

### 3.5 Character クラス (キャラクター基底 - 新規)

```javascript
class Character extends Unit {
    constructor(x, y, hp, weaponDeck = []) {
        super(x, y, hp);
        this.weaponDeck = weaponDeck;
        this.maxDeckSize = 5;
    }

    addWeapon(weaponKey) { /* デッキに追加 */ }
    removeWeapon(weaponKey) { /* デッキから削除 */ }
    isDeckFull() { return this.weaponDeck.length === this.maxDeckSize; }
}
```

**改訂点**:
- プレイヤー・敵の共通基底として機能
- 武器リスト管理を一元化
- デッキの状態を追跡可能に

---

### 3.6 CollisionDetector (衝突判定の精度向上 - 新規)

```javascript
class CollisionDetector {
    constructor() {
        this.collided = new Set(); // フレーム内の重複判定防止
        this.HIT_RADIUS = 15; // ピクセルベースの判定半径
    }

    checkCollision(w1, w2) {
        const dist = Math.sqrt((w1.x - w2.x)**2 + (w1.y - w2.y)**2);
        const radius1 = this.HIT_RADIUS * w1.scale;
        const radius2 = this.HIT_RADIUS * w2.scale;
        return dist < radius1 + radius2;
    }

    detectAllCollisions(weapons) {
        // 全武器の衝突判定を実行
    }
}
```

**改訂点**:
- 魔法数字 `/ 1.2` を削除
- ピクセルベースの統一判定
- フレーム内の重複判定を防止

---

### 3.7 ObjectPool パターン (メモリ最適化 - 新規)

```javascript
class ObjectPool {
    constructor(ObjectClass, initialSize = 100) {
        this.available = [];
        this.active = [];
        // プリアロケーション
        for (let i = 0; i < initialSize; i++) {
            this.available.push(new ObjectClass());
        }
    }

    acquire(params) {
        // 再利用可能なオブジェクトを確保
    }

    release(obj) {
        // オブジェクトをプールに戻す
    }
}

class ParticlePool extends ObjectPool {
    spawn(x, y, color) { this.acquire({ x, y, color }); }
}
```

**改訂点**:
- パーティクル・ライトニングの無制限生成を防止
- メモリ使用量を制御
- GC 圧力を削減

---

## 4. 実装フロー図

```
┌─────────────────────────────────────┐
│      PlayerThrow (UI Event)         │
└──────────────────┬──────────────────┘
                   │
        ┌──────────▼──────────┐
        │  SkillTrigger       │
        │ (発動判定)          │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  SkillApplier       │
        │ (効果適用)          │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  WeaponFactory      │
        │ (インスタンス生成)  │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  CollisionDetector  │
        │ (衝突判定)          │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  BattleSystem       │
        │ (ダメージ計算)      │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  ParticlePool       │
        │ (エフェクト表示)    │
        └─────────────────────┘
```

---

## 5. テスト容易性の向上

### 5.1 乱数注入

```javascript
// テスト時
const mockRandom = () => 0.5;
AIStrategy.selectWeapon(enemy, player, 'hard', mockRandom);
```

### 5.2 モック戦略

```javascript
// スキル発動テスト
SkillTrigger.shouldTrigger(skillData, false, () => 0.1);
```

---
