import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">TaleGarden</h1>
      <p className="mt-2 mb-8 text-sm text-black/60 dark:text-white/60">
        ログインして庭に入る。
      </p>
      <LoginForm />
    </main>
  );
}
