import { describe, expect, it } from "vitest";

import { bodyToText, countCharacters, emptyBody, textToBody } from "./chapterBody";

describe("body とテキストの相互変換", () => {
  it("テキストを包んで取り出すと元に戻る", () => {
    const body = textToBody("むかしむかし、\nあるところに。");
    expect(bodyToText(body)).toBe("むかしむかし、\nあるところに。");
  });

  it("空本文はからの文字列を保持する", () => {
    expect(bodyToText(emptyBody())).toBe("");
  });

  it("DB デフォルトの空オブジェクトは空文字として読む", () => {
    expect(bodyToText({})).toBe("");
  });

  it("null や想定外の構造は空文字に倒す", () => {
    expect(bodyToText(null)).toBe("");
    expect(bodyToText(undefined)).toBe("");
    expect(bodyToText("just a string")).toBe("");
    expect(bodyToText([1, 2, 3])).toBe("");
    expect(bodyToText({ type: "prosemirror", content: [] })).toBe("");
  });
});

describe("文字数カウント", () => {
  it("日本語の文字を1文字ずつ数える", () => {
    expect(countCharacters("こんにちは")).toBe(5);
  });

  it("空白・改行・タブは数えない", () => {
    expect(countCharacters("あ い\tう\nえ　お")).toBe(5);
  });

  it("空文字は0", () => {
    expect(countCharacters("")).toBe(0);
    expect(countCharacters("   \n\t")).toBe(0);
  });

  it("絵文字などの結合文字を1文字として数える", () => {
    expect(countCharacters("👨‍👩‍👧")).toBe(1);
  });
});
