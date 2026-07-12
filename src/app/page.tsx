import { redirect } from "next/navigation";

import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

const modules = [
  { title: "執筆", desc: "資料を参照しながら原稿を書くエディタ", phase: "MVP" },
  { title: "伏線", desc: "仕込みと回収を場所に紐づけ、未回収を一覧", phase: "MVP" },
  { title: "登場人物", desc: "プロフィール・設定を管理", phase: "MVP" },
  { title: "世界観・資料", desc: "用語集・アイテムなどの自由資料", phase: "MVP" },
  { title: "年表", desc: "作中世界の出来事を時系列で管理", phase: "Phase 2" },
  { title: "相関図", desc: "キャラクター同士の関係を視覚化", phase: "Phase 3" },
  { title: "勢力図", desc: "組織・派閥の関係を視覚化", phase: "Phase 3" },
] as const;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/15">
        <span className="font-semibold">TaleGarden</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-black/60 dark:text-white/60">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-black/15 px-3 py-1 dark:border-white/20"
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">TaleGarden</h1>
        <p className="mt-3 text-sm text-black/60 dark:text-white/60">
          設定を手入れし、一巻ごとに書くべきこと／書かなくていいことを整理する、
          小説執筆のための庭。
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {modules.map((m) => (
            <li
              key={m.title}
              className="rounded-xl border border-black/10 p-4 dark:border-white/15"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.title}</span>
                <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                  {m.phase}
                </span>
              </div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">{m.desc}</p>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs text-black/40 dark:text-white/40">
          Phase 1: 認証を追加（1a-1）。
        </p>
      </main>
    </>
  );
}
