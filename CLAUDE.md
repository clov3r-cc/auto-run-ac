# CLAUDE.md

このファイルは、このリポジトリのコードでClaude Code（claude.ai/code）が作業する際のガイダンスを提供します。

## 概要

このプロジェクトは、SwitchBotを使用してエアコンを自動制御するReact Router + Cloudflare Workersアプリケーションです。スケジューリングされた機能により、自宅に帰宅する時間に合わせて適切な温度にエアコンを自動調整します。

## 主要コマンド

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
pnpm run lint:fix   # ESLintエラーの自動修正
pnpm run format     # Prettierによるフォーマットチェック
pnpm run format:fix # Prettierによる自動フォーマット
pnpm run fix        # format:fix + lint:fix
pnpm run typecheck  # TypeScriptの型チェック
```

### Cloudflare固有

```bash
pnpm run cf-typegen # Cloudflare Workers型定義生成
pnpm dlx wrangler versions upload   # プレビュー版のアップロード
pnpm dlx wrangler versions deploy   # 本番へのデプロイ
```

## アーキテクチャ

### ディレクトリ構造

- `app/` - React Routerフロントエンドアプリケーション
- `workers/` - Cloudflare Workers（サーバー側処理）
  - `app.ts` - メインワーカー（React Router + スケジューリング）
  - `scheduled.ts` - cron処理（15分毎にエアコン制御を実行）
  - `lib/` - ワーカー用のユーティリティ
- `lib/` - 共有ライブラリ
  - `domain/` - ドメインモデル
  - `kv/` - Cloudflare KVストレージ操作

### 主要機能

- **スケジューリング**: 15分間隔でcron実行（wrangler.jsonc:38）
- **温度制御**: SwitchBot APIを使用した温度測定とエアコン制御
- **データ保存**: Cloudflare KVを使用したスケジュールと履歴管理
- **通知**: Discord Webhook経由での状態通知

### 重要な設定

- `wrangler.jsonc` - Cloudflare Workers設定、環境変数、KVバインディング
- `workers/scheduled.ts` - エアコン制御のメインロジック
- 温度しきい値: 最低20°C、最高28°C（wrangler.jsonc:14-15）

### 開発時の注意点

- pnpmを使用（package.json:15でnpm/yarnを禁止）
- Lefthoook設定済み（lefthook.yaml）
- TypeScript厳格設定
- Zod importを禁止（eslintルール）
