import { z } from "zod";

export const workInputSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください").max(200),
  synopsis: z.string().trim().max(4000).optional(),
});

export type WorkInput = z.infer<typeof workInputSchema>;

// 巻番号は採番（末尾+1）でドメインが決めるため、ユーザー入力には含めない。
// 手入力させると unique(work_id, number) 違反や番号の穴を招くだけだから。
export const volumeInputSchema = z.object({
  title: z.string().trim().min(1, "巻タイトルを入力してください").max(200),
  summary: z.string().trim().max(4000).optional(),
});

export type VolumeInput = z.infer<typeof volumeInputSchema>;

export const chapterInputSchema = z.object({
  title: z.string().trim().min(1, "章タイトルを入力してください").max(200),
});

export type ChapterInput = z.infer<typeof chapterInputSchema>;

// 原稿本文。タイトルと違い trim しない（行頭の字下げや前後の空行も原稿の一部）。
// 上限は1章あたりの現実的な分量を大きく超える値に置き、事故的な巨大入力だけを弾く。
export const chapterBodyInputSchema = z.object({
  body: z.string().max(200_000, "本文が長すぎます"),
});

export type ChapterBodyInput = z.infer<typeof chapterBodyInputSchema>;
