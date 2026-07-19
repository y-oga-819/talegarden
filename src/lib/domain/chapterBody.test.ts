import { describe, expect, it } from "vitest";

import {
  bodyToDoc,
  countCharacters,
  countDocCharacters,
  docToText,
  emptyDoc,
  isProseMirrorDoc,
} from "./chapterBody";

describe("body から doc への正規化", () => {
  it("既に doc ならそのまま返す", () => {
    const doc = { type: "doc", content: [{ type: "paragraph" }] };
    expect(bodyToDoc(doc)).toBe(doc);
  });

  it("旧プレーンテキスト形式は段落 doc へ移行する", () => {
    const doc = bodyToDoc({ type: "plaintext", text: "一行目\n二行目" });
    expect(doc).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "一行目" }] },
        { type: "paragraph", content: [{ type: "text", text: "二行目" }] },
      ],
    });
  });

  it("DB デフォルトの空オブジェクト・null は空 doc にする", () => {
    expect(bodyToDoc({})).toEqual(emptyDoc());
    expect(bodyToDoc(null)).toEqual(emptyDoc());
    expect(bodyToDoc(undefined)).toEqual(emptyDoc());
  });
});

describe("doc 判定", () => {
  it("type が doc のオブジェクトだけ true", () => {
    expect(isProseMirrorDoc({ type: "doc", content: [] })).toBe(true);
    expect(isProseMirrorDoc({ type: "plaintext", text: "x" })).toBe(false);
    expect(isProseMirrorDoc(null)).toBe(false);
    expect(isProseMirrorDoc([1, 2])).toBe(false);
    expect(isProseMirrorDoc("doc")).toBe(false);
  });
});

describe("doc からのテキスト抽出", () => {
  it("入れ子のノードから text を集める", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "heading",
          content: [{ type: "text", text: "見出し" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "太字", marks: [{ type: "bold" }] },
            { type: "text", text: "と地の文" },
          ],
        },
      ],
    };
    expect(docToText(doc)).toBe("見出し\n太字\nと地の文");
  });

  it("text を持たない doc は空文字", () => {
    expect(docToText(emptyDoc())).toBe("");
    expect(docToText(null)).toBe("");
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

  it("doc の文字数は装飾や見出しを除いた本文の字数", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "heading", content: [{ type: "text", text: "序章" }] },
        { type: "paragraph", content: [{ type: "text", text: "彼は歩いた。" }] },
      ],
    };
    // 「序章」2 + 「彼は歩いた」5(句点は非空白なので数える→6) = 8
    expect(countDocCharacters(doc)).toBe(countCharacters("序章彼は歩いた。"));
  });
});
