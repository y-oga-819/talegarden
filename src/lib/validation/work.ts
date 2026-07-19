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
