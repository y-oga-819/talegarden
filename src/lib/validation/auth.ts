import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
});

export type Credentials = z.infer<typeof credentialsSchema>;
