import Link from "next/link";

import { signOut } from "@/lib/auth/actions";

export function WorksHeader({ email }: { email: string | undefined }) {
  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/15">
      <Link href="/" className="font-semibold">
        TaleGarden
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-black/60 dark:text-white/60">{email}</span>
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
  );
}
