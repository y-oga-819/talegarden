# AGENTS.md

TaleGarden の開発規約。人間・AI エージェント共通の指針。

## ブランチ戦略 (GitHub Flow)
- `main` へ直接 commit / push しない。
- 変更は feature ブランチを切り、PR を作ってマージする。
- `main` は常にデプロイ可能な状態を保つ。
- **PR は「意味のあるまとまり1つ＝1作業」に絞る。** Phase をさらに小さく分解し、大きすぎる PR を避ける。

## 責務の分離（コード/テスト/コメント/コミット）
- **コード = How**: どう実装しているか。命名で意図が伝わるようにする。
- **テストコード = What**: 何を満たすべきか（仕様）。振る舞いを記述する。
- **コメント = Why not**: なぜ他の案を採らなかったか。自明な説明は書かない。**日本語で書く。**
- **コミットメッセージ = Why**: なぜ変えたか、その時の文脈。

## 技術スタック
- Next.js (App Router) + TypeScript / Tailwind CSS
- Supabase (Postgres + Auth + RLS + Storage)
- テスト: Vitest

## ディレクトリ
- `src/app/` … ルーティング・画面
- `src/lib/domain/` … ドメインロジック（不変条件はここで保証）
- `src/lib/validation/` … 入力スキーマ (zod)
- `src/lib/db/` … 集約ルート単位のクエリ
- `src/lib/supabase/` … Supabase クライアント/型
- `supabase/migrations/` … DB マイグレーション

## 検証（PR 前に必須）
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## ドメインモデル
集約: Work / Volume(内包 Chapter) / Character / Foreshadowing(内包 ForeshadowingEvent) /
Document / Faction / CharacterRelationship / TimelineEvent。
集約間は ID 参照のみ。不変条件は集約ルートが保証する。
