import { z } from "zod";

export const characterInputSchema = z.object({
  name: z.string().trim().min(1, "名前を入力してください").max(200),
  // 役割は「主人公」「敵役」等の短い立ち位置を想定。分類は将来 enum 化しうるが、
  // 今は執筆者の語彙を縛らないよう自由入力にとどめる。
  role: z.string().trim().max(200).optional(),
  profile: z.string().trim().max(4000).optional(),
});

export type CharacterInput = z.infer<typeof characterInputSchema>;
