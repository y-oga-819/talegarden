# TaleGarden

小説執筆支援ツール。伏線・登場人物・世界観・相関図・勢力図・年表を一元管理しながら執筆できる。
「広げた設定を手入れし、一巻ごとに書くべきこと／書かなくていいことを整理する庭」がコンセプト。

## 技術スタック
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + RLS + Storage)
- Vitest

## セットアップ
```bash
npm install
cp .env.example .env.local   # Supabase の URL / anon key を設定
npm run dev
```

Supabase のスキーマは `supabase/migrations/` を参照。ローカル DB を起動している場合は型を再生成できる:
```bash
npm run gen:types
```

## スクリプト
| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint |
| `npm run typecheck` | 型チェック (tsc) |
| `npm test` | ユニットテスト (Vitest) |

## 開発規約
ブランチ戦略・コミット/コメント方針・ディレクトリ構成は [AGENTS.md](./AGENTS.md) を参照。

## ロードマップ
- **Phase 0（本PR）**: 基盤構築（Next+Supabase、Work/Volume/Chapter スキーマ、CI）
- **Phase 1 (MVP)**: 作品/キャラ/資料 CRUD、原稿エディタ、伏線管理＋未回収一覧、巻ごとの庭ビュー
- **Phase 2**: 年表、@メンション自動リンク、横断検索
- **Phase 3**: 相関図・勢力図（React Flow）
- **Phase 4**: エクスポート、文字数目標、履歴
