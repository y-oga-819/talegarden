/**
 * 章本文(body)の表現と、本文からの文字数算出を担う。
 *
 * body は TipTap(ProseMirror) のリッチテキストを `{ type:"doc", content:[…] }` の
 * ドキュメント JSON として保持する。装飾(太字・見出し等)や、将来の @メンション/伏線リンクを
 * ノードとして表現するには、プレーンテキストではなく構造化ドキュメントが必要になるため。
 *
 * 旧実装はプレーンテキストを `{ type:"plaintext", text }` で保存していた。既存データを
 * 壊さないよう、読み出し時にその形式を doc へ変換する(DB マイグレーション不要の後方互換)。
 */

import type { Json } from "@/lib/supabase/database.types";

/**
 * ProseMirror ドキュメントの最小の型。中身のノード構造はライブラリ側の関心なので
 * content は unknown[] に留め、この層は「doc かどうか」と「テキスト抽出」だけを担う。
 * interface ではなく type にしているのは jsonb 列(Json 型)への代入互換のため。
 */
export type ProseMirrorDoc = {
  type: "doc";
  content?: unknown[];
};

/** 何も書かれていない本文。ProseMirror は空でも段落1つを要求するため空パラグラフを置く。 */
export function emptyDoc(): ProseMirrorDoc {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** 永続化された body が ProseMirror doc なら true。 */
export function isProseMirrorDoc(body: unknown): body is ProseMirrorDoc {
  return isRecord(body) && body.type === "doc";
}

/**
 * 旧形式 `{ type:"plaintext", text }` や DB デフォルト `{}` からプレーンテキストを取り出す。
 * doc への移行にのみ使う内部読み出し。取り出せないものは空文字に倒す。
 */
export function bodyToText(body: Json | null | undefined): string {
  if (isRecord(body) && body.type === "plaintext" && typeof body.text === "string") {
    return body.text;
  }
  return "";
}

/** プレーンテキストを段落 doc へ変換する。改行区切りで段落に割る。 */
function textToDoc(text: string): ProseMirrorDoc {
  const paragraphs = text.split("\n").map((line) =>
    line.length === 0
      ? { type: "paragraph" }
      : { type: "paragraph", content: [{ type: "text", text: line }] },
  );
  return { type: "doc", content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph" }] };
}

/**
 * 永続化された body をエディタ初期値の doc へ正規化する。既に doc ならそのまま、
 * 旧プレーンテキスト形式や空 `{}`・null は doc へ変換する。
 */
export function bodyToDoc(body: Json | null | undefined): ProseMirrorDoc {
  if (isProseMirrorDoc(body)) return body;
  const legacyText = bodyToText(body);
  return legacyText.length > 0 ? textToDoc(legacyText) : emptyDoc();
}

/**
 * doc からプレーンテキストを再帰的に抽出する。text ノードの文字列を集め、ブロックの
 * 境界は改行でつなぐ(空白は文字数計上で無視されるため区切り文字の種類は結果に影響しない)。
 */
export function docToText(node: unknown): string {
  if (!isRecord(node)) return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(docToText).join("\n");
  }
  return "";
}

/**
 * 原稿の文字数(=「◯◯文字」)を数える。空白・改行・タブは字数に含めない。
 * 原稿用紙換算に近い「実際に書かれた文字の量」を測りたいのであって、レイアウトのための
 * 空白まで数えると読者の体感とずれるため。結合文字を1文字として扱えるよう、コード
 * ポイント単位ではなく書記素に近い形で反復する目的で Intl.Segmenter を使う。
 */
export function countCharacters(text: string): number {
  const withoutWhitespace = text.replace(/\s/gu, "");
  if (withoutWhitespace.length === 0) return 0;

  // Segmenter が使えない実行環境ではコードポイント数にフォールバックする。
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
    return [...segmenter.segment(withoutWhitespace)].length;
  }

  return [...withoutWhitespace].length;
}

/** doc に含まれる文字数を数える(docToText → countCharacters の合成)。 */
export function countDocCharacters(doc: unknown): number {
  return countCharacters(docToText(doc));
}
