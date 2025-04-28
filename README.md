# tasker

個人の小さなタスクからプロジェクトのような規模の大きいタスクまで管理する self-hosted 前提の Web アプリケーション

## 機能

- タスク一覧
  - [ ] 一覧
  - [ ] タスク検索
- [ ] タスク詳細
  - [ ] ラベル
  - [ ] 親子関係
  - [ ] 時系列でコメント (メモ)
- [ ] (optional) スケジュール管理
    - Todoist などと連携すれば良いので単体では must ではない

### 特徴

- モバイルでも入力しやすい
- UX がネイティブアプリっぽい

## アーキテクチャ

- App
  - Next.js (App Router) + bun
  - ORM: Drizzle
  - TypeScript
  - スタイル: Tailwind CSS + shadcn/ui
- Infra
  - Cloudflare Workers
  - Cloudflare D1 (SQLite)
  - 認証: Cloudflare Access
