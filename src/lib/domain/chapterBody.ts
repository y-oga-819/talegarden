/**
 * 章本文(body)の表現とテキストの相互変換、および文字数の算出を担う。
 *
 * body カラムは将来 ProseMirror ドキュメント(リッチテキスト)を保持する前提で jsonb に
 * しているが、現段階の原稿エディタはプレーンテキストしか扱わない。そこで
 * `{ type: "plaintext", text }` という自己記述的な構造で包んでおき、後で
 * ProseMirror へ移行する際に type で旧データを判別・変換できるようにする。生の文字列を
 * そのまま入れないのは、jsonb の中身がテキストなのか doc なのかを型で区別できなくなるため。
 */

import type { Json } from "@/lib/supabase/database.types";

/**
 * プレーンテキスト本文の永続化表現。interface ではなく type にしているのは、
 * jsonb 列(Json 型 = 文字列インデックスシグネチャ)へそのまま渡せるようにするため。
 * interface は宣言マージの余地があり index signature へ代入できない。
 */
type PlaintextBody = {
  type: "plaintext";
  text: string;
};

/** 空本文。DB のデフォルト(`{}`)とは別に、明示的な空テキストとして保存する。 */
export function emptyBody(): PlaintextBody {
  return { type: "plaintext", text: "" };
}

/** プレーンテキストを永続化表現へ包む。 */
export function textToBody(text: string): PlaintextBody {
  return { type: "plaintext", text };
}

/**
 * 永続化された body からプレーンテキストを取り出す。DB デフォルトの `{}` や、
 * 想定外の構造・null が来ても壊れないよう、取り出せないものは空文字に倒す。
 */
export function bodyToText(body: Json | null | undefined): string {
  if (
    body !== null &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    body.type === "plaintext" &&
    typeof body.text === "string"
  ) {
    return body.text;
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
