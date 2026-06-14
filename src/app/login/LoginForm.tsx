"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1.5">
          שם משתמש
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoFocus
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1.5">
          סיסמה
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand py-3 text-base font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "מתחבר..." : "כניסה"}
      </button>
    </form>
  );
}
