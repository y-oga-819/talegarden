import { z } from "zod";

export const workInputSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください").max(200),
  synopsis: z.string().trim().max(4000).optional(),
});

export type WorkInput = z.infer<typeof workInputSchema>;

export const volumeInputSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().trim().min(1, "巻タイトルを入力してください").max(200),
  summary: z.string().trim().max(4000).optional(),
});

export type VolumeInput = z.infer<typeof volumeInputSchema>;

export const chapterInputSchema = z.object({
  title: z.string().trim().min(1, "章タイトルを入力してください").max(200),
});

export type ChapterInput = z.infer<typeof chapterInputSchema>;
