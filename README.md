# エアコン自動制御システム

SwitchBotとCloudflare Workersを使用した、帰宅時間に合わせてエアコンを自動制御するシステム

## 🎯 このシステムでできること

- **自動温度調整**: 帰宅時刻に合わせて最適なタイミングでエアコンを起動
- **スケジュール管理**: 日常的な帰宅時刻と特別な日の設定
- **温度監視**: SwitchBot温湿度計による室温の常時監視
- **Discord通知**: エアコン稼働時の自動通知

## 🏠 利用イメージ

### 平日18:00帰宅の場合

- 室温32℃ → 目標28℃（4℃差）
- 16:00に自動でエアコン起動
- 18:00帰宅時には快適な28℃

### 特別な日（早帰り・遅帰り）

- カレンダーで個別設定
- その日だけの特別スケジュール

## 🛠 技術構成

- **フロントエンド**: React Router（Cloudflare Pages）
- **バックエンド**: Cloudflare Workers（15分間隔で定期実行）
- **データ保存**: Cloudflare KV
- **IoTデバイス**: SwitchBot（温湿度計・エアコン操作）
- **通知**: Discord Webhook

## 📁 プロジェクト構成

```
├── docs/              # 設計ドキュメント
├── app/               # React フロントエンド
├── workers/           # Cloudflare Workers（制御ロジック）
└── lib/              # 共有ライブラリ
```

## 🚀 開発コマンド

### 開発

```bash
pnpm run dev        # 開発サーバー起動
pnpm run build      # 本番ビルド
pnpm run preview    # 本番ビルドのプレビュー
pnpm run deploy     # Cloudflareへデプロイ
```

### コード品質

```bash
pnpm run lint       # ESLintによるコードチェック
pnpm run format     # Prettierによるフォーマットチェック
pnpm run fix        # format:fix + lint:fix
pnpm run typecheck  # TypeScriptの型チェック
```

## 📖 ドキュメント

プロジェクトの詳細は`docs/`フォルダ内の設計ドキュメントを参照してください：

1. **要件定義** (`01-requirements.md`) - システムの背景・目的・機能要件
2. **基本設計** (`02-base.md`) - システム全体のアーキテクチャ
3. **詳細設計** (`03-detail.md`) - 実装に必要な詳細仕様

## 🔧 セットアップ

### 前提条件

- Node.js v22+
- pnpm
- Cloudflareアカウント
- SwitchBotデバイス（温湿度計・エアコン操作用リモコン）

### 環境変数設定

#### `.dev.vars`

```
SWITCHBOT_TOKEN=your_switchbot_token
SWITCHBOT_CLIENT_SECRET=your_client_secret
NOTIFICATION_WEBHOOK_URL=your_discord_webhook_url
```

#### `.wrangler.jsonc`

```json
"vars": {
  "METER_DEVICE_ID": "your_meter_device_id",
  "AIR_CONDITIONER_DEVICE_ID": "your_ac_device_id"
}
```

#### `.env`

```
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
```

### インストール・起動

```bash
pnpm install
pnpm run dev
```

## 🎮 使い方

1. **スケジュール設定**: 帰宅時刻を設定
2. **特別日設定**: 早帰り・遅帰りの日をカレンダーで個別設定
3. **自動実行**: 15分間隔で温度をチェックし、必要に応じてエアコンを制御
