
# 汎用JavaScriptプロジェクト環境構築仕様書

## 1\. 概要

本仕様書は、JavaScriptプロジェクトにおける標準開発環境、および運用ルールを定義する。
**達成目標:**

1.  **Zero Config:** `npm install` 以外の環境構築作業を排除する。
2.  **Quality Gate:** エディタ・コミット・CIの3段階で品質を保証する。
3.  **Onboarding:** 新規参画者が「リードタイム0」で開発を開始できる。

## 2\. 前提環境 (Prerequisites)

| ツール | バージョン/設定 | 理由 |
| :--- | :--- | :--- |
| **Node.js** | **20.10.0** (固定) | 開発者全員のバイナリ一致 (`.nvmrc`準拠) |
| **npm** | v10.x 以上 | `package-lock.json` v3 対応 |
| **OS** | Mac / Linux / WSL2 | WindowsはWSL2またはGit Bash推奨 |

-----

## 3\. ディレクトリ構造

```text
ProjectRoot/
├── .github/
│   └── workflows/
│       └── ci.yml       # GitHub Actions (CI) 設定
├── .husky/              # Git Hooks (コミット前自動チェック)
│   └── pre-commit
├── .vscode/             # VS Code チーム共有設定
│   ├── extensions.json  # 推奨拡張機能リスト
│   └── settings.json    # エディタ挙動設定
├── src/                 # ソースコード
├── tests/               # テストコード
├── .env.example         # 環境変数雛形 (Git管理対象)
├── .gitignore           # Git除外設定
├── .nvmrc               # Nodeバージョン完全固定
├── .eslintrc.js         # Lintルール
├── .prettierrc          # フォーマットルール
├── jest.config.js       # テスト設定
├── package.json         # プロジェクト定義
├── package-lock.json    # 依存バージョンロック
└── README.md            # 運用マニュアル
```

-----

## 4\. 構成ファイル詳細

### 4.1. バージョン管理と除外設定

**`.nvmrc`**
`v` プレフィックスを排除し、厳密なバージョンを指定。

```text
20.10.0
```

**`.gitignore`**
`npm-shrinkwrap` やエディタの一時ファイルも網羅。

```text
# Dependencies
node_modules/
npm-shrinkwrap.json

# Environment variables
.env
.env.local
.env.*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# OS / Editor junk
.DS_Store
*.swp
*.swo
.idea/
coverage/
dist/
build/
```

### 4.2. プロジェクト定義 (`package.json`)

`format` コマンドを追加し、`test:cov` でカバレッジ計測を容易化。

```json
{
  "name": "generic-js-project",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "lint": "eslint 'src/**/*.js' --max-warnings 0",
    "lint:fix": "eslint 'src/**/*.js' --fix",
    "format": "prettier --write 'src/**/*.js'",
    "test": "jest --verbose",
    "test:cov": "jest --coverage",
    "prepare": "husky install"
  },
  "lint-staged": {
    "src/**/*.js": [
      "prettier --write",
      "eslint --fix"
    ]
  },
  "dependencies": { "dotenv": "^16.3.1" },
  "devDependencies": {
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "jest": "^29.7.0"
  }
}
```

### 4.3. テスト設定 (`jest.config.js`)

カバレッジ計測用オプションのコメントを追加し、用途を明確化。

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  
  // カバレッジ計測設定（CI環境や分析時に有効化）
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  // coverageReporters: ["text", "lcov"],
};
```

-----

## 5\. 運用マニュアル (README 必須記述事項)

プロジェクトルートの `README.md` に以下を記載すること。

### 📦 セットアップ手順

#### 1\. Node.js の準備 (初回のみ)

**nvm (Node Version Manager) の使用を推奨します。**
まだインストールしていない場合：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# シェル再起動後
nvm install 20.10.0
```

#### 2\. プロジェクトの初期化

```bash
# リポジトリのクローン
git clone <repository-url>
cd <project-name>

# バージョンの適用
nvm use

# 依存関係のインストール & Git Hooks設定
npm install
```

#### 3\. 環境変数の設定

```bash
cp .env.example .env
```

> **⚠️ 重要:** `.env` ファイルにはAPIキーなどの機密情報が含まれるため、**絶対にGitにコミットしないでください**（`.gitignore`で除外されています）。

-----

### 💻 開発コマンド

| コマンド | 用途 | 備考 |
| :--- | :--- | :--- |
| `npm run dev` | ローカル開発 | 保存時に自動再起動 |
| `npm test` | テスト実行 | Jestによる単体テスト |
| `npm run lint` | 静的解析 | CIでも実行される厳密なチェック |
| `npm run format`| 全体整形 | 自動整形が効かない場合の手動実行 |

-----

### 🔧 トラブルシューティング

**Q: `git commit` が失敗する**
A: コードに Lint エラーまたはフォーマット違反があります。

1.  エラーメッセージを確認してください。
2.  `npm run lint:fix` を実行して自動修正を試みてください。
3.  それでも直らない箇所を手動で修正してください。

**Q: VS Code で保存しても整形されない**
A: 推奨拡張機能（Prettier/ESLint）が有効か確認してください。`.vscode/extensions.json` の通知に従いインストールしてください。

**Q: Windows (PowerShell) でスクリプトエラーが出る**
A: 引数の渡し方が原因の場合があります。以下のように `--` を明示してください。

```powershell
npm run lint -- --fix
```

※可能な限り **WSL2** または **Git Bash** の使用を推奨します。

-----

## 6\. CI/CD設定 (.github/workflows/ci.yml)

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc' # 自動的に 20.10.0 を使用
      - run: npm ci                   # package-lock.json に従い厳密インストール
      - run: npm run lint
      - run: npm test
```

-----

## 7\. まとめ

本構成により、以下の状態が保証されます。

1.  **誰がやっても同じ環境**（`.nvmrc`, `package-lock.json`）
2.  **誰が書いても同じコード**（Prettier, ESLint, Husky）
3.  **壊れたコードは混入しない**（CI, lint-staged）
