# tasker

個人の小さなタスクからプロジェクトのような規模の大きいタスクまで管理する self-hosted 前提の Web アプリケーション

## ほしい機能

- must
  - 入力しやすい
    - モバイルでも
  - 検索可能
  - 一覧できる
  - コメントやメモを残せる
  - 時系列でコメント可能 (GitHub issue 的な)
  - issue と直接関係しないメモとリンク可能
  - ラベルをつけられる
  - 親子関係をつけられる
- should
  - スケジュール管理可能
    - Todoist などと連携すれば良いので単体では must ではない

## アーキテクチャ

- App
  - Next.js (App Router) + bun
  - TypeScript
  - Tailwind CSS + shadcn/ui
- Infra
  - Cloudflare Workers
  - Cloudflare D1 (SQLite)
