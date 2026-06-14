"use client";

import { useActionState, useRef, useEffect } from "react";
import { createManager, type FormResult } from "@/app/actions/admin";
import { PERMISSION_GROUPS } from "@/lib/permissions";

const initial: FormResult = {};

export default function CreateManagerForm() {
  const [state, action, pending] = useActionState(createManager, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  const field =
    "w-full rounded-xl border border-border bg-white px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold">הוספת איש צוות</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">שם</label>
          <input name="name" className={field} placeholder="שם העובד" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">שם משתמש</label>
          <input name="username" dir="ltr" className={field} placeholder="user" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">סיסמה</label>
          <input name="password" dir="ltr" className={field} placeholder="לפחות 4 תווים" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">הרשאות (סמן בדיוק מה מותר לו לעשות):</p>
        <div className="space-y-2">
          {PERMISSION_GROUPS.map((g) => (
            <div key={g.area} className="rounded-lg border border-border p-3">
              <p className="mb-2 text-sm font-bold text-brand-dark">{g.label}</p>
              <div className="flex flex-wrap gap-2">
                {g.perms.map((p) => (
                  <label
                    key={p.key}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm"
                  >
                    <input type="checkbox" name="perm" value={p.key} className="accent-brand" />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-brand-light px-4 py-2 text-sm text-brand-dark">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "יוצר..." : "יצירת איש צוות"}
      </button>
    </form>
  );
}
