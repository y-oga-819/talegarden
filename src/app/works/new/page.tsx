import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { createWorkAction } from "@/lib/works/actions";
import { WorkForm } from "../work-form";

export default async function NewWorkPage() {
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

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight">作品を作成</h1>
        <WorkForm action={createWorkAction} submitLabel="作成" />
      </main>
    </>
  );
}
