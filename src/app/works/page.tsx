import Link from "next/link";
import { redirect } from "next/navigation";

import { listWorks } from "@/lib/db/works";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function WorksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const works = await listWorks();

  return (
    <>
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/15">
        <Link href="/" className="font-semibold">
          TaleGarden
        </Link>
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

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">作品</h1>
          {/* 作成フォームは 1a-3 で実装する。ここでは導線だけ置き、押せない状態にして
              「未実装を実装済みに見せない」ようにする。 */}
          <button
            type="button"
            disabled
            title="作成は次の変更(1a-3)で実装します"
            className="cursor-not-allowed rounded-md bg-emerald-600 px-4 py-2 text-sm text-white opacity-50"
          >
            新規作成
          </button>
        </div>

        {works.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/20">
            <p className="text-sm text-black/60 dark:text-white/60">
              まだ作品がありません。最初の一作を植えましょう。
            </p>
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {works.map((work) => (
              <li
                key={work.id}
                className="rounded-xl border border-black/10 p-4 dark:border-white/15"
              >
                <div className="font-medium">{work.title}</div>
                {work.synopsis ? (
                  <p className="mt-1 line-clamp-2 text-sm text-black/60 dark:text-white/60">
                    {work.synopsis}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
