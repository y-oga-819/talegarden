"use client";

import { useActionState } from "react";

import { signIn, signUp, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [signInState, signInAction, signingIn] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, initialState);

  const error = signInState.error ?? signUpState.error;
  const pending = signingIn || signingUp;

  return (
    <form className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        メールアドレス
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        パスワード（8文字以上）
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </label>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          formAction={signInAction}
          disabled={pending}
          className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
        >
          ログイン
        </button>
        <button
          type="submit"
          formAction={signUpAction}
          disabled={pending}
          className="flex-1 rounded-md border border-emerald-600 px-4 py-2 text-emerald-700 disabled:opacity-60 dark:text-emerald-300"
        >
          新規登録
        </button>
      </div>
    </form>
  );
}
