# CLAUDE.md

このファイルは、このリポジトリのコードでClaude Code（claude.ai/code）が作業する際のガイダンスを提供します。

## 概要

このプロジェクトは、SwitchBotを使用してエアコンを自動制御するReact Router + Cloudflare Workersアプリケーションです。帰宅時間に合わせて最適なタイミングでエアコンを起動し、帰宅時に快適な室温（20-28℃）を実現します。

### プロジェクトの背景

- 帰宅時に部屋が暑すぎる/寒すぎる問題を解決
- 手動でのエアコン操作の手間を自動化
- 必要な時間のみ稼働することで省エネを実現

### 設計ドキュメント

詳細な仕様は`docs/`フォルダ内を参照：

- `01-requirements.md` - 要件定義（背景・目的・機能要件）
- `02-base.md` - 基本設計（システム全体アーキテクチャ）
- `03-detail.md` - 詳細設計（実装仕様）

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

- **自動制御**: 15分間隔で温度監視し、帰宅時刻に合わせてエアコンを起動
- **動的タイミング計算**: 温度差に基づいて最適な起動時刻を算出（3℃/時間で計算）
- **スケジュール管理**: デフォルト帰宅時刻と特定日の個別設定
- **温度制御**: 20℃未満で暖房、28℃超過で冷房を自動実行
- **履歴管理**: 実行結果の記録と3日間保持
- **Discord通知**: 制御成功時のみ通知（エラー時は通知なし）

### 重要な設定

- `wrangler.jsonc` - Cloudflare Workers設定、環境変数、KVバインディング
- `workers/scheduled.ts` - エアコン制御のメインロジック
- 温度しきい値: 最低20°C、最高28°C（環境変数で設定）
- KV設計: 機能別分離（KV**SCHEDULES、KV**HISTORY）

### 開発時の注意点

- pnpmを使用（package.json:15でnpm/yarnを禁止）
- Lefthoook設定済み（lefthook.yaml）
- TypeScript厳格設定
- Zod importを禁止（eslintルール）
