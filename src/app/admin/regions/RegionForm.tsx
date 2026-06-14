"use client";

import { useActionState, useRef, useEffect } from "react";
import { createRegion, type FormResult } from "@/app/actions/admin";
import { HEBREW_WEEKDAYS } from "@/lib/dates";

const initial: FormResult = {};

export default function RegionForm() {
  const [state, action, pending] = useActionState(createRegion, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  const field =
    "w-full rounded-xl border border-border bg-white px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold">הוספת אזור חלוקה</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">שם האזור</label>
          <input name="name" className={field} placeholder="לדוגמה: מרכז" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">יום אספקה</label>
          <select name="weekday" className={field} defaultValue="">
            <option value="" disabled>
              בחר יום...
            </option>
            {HEBREW_WEEKDAYS.map((day, idx) => (
              <option key={idx} value={idx}>
                יום {day}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-muted">לאחר הוספת האזור תוכלו להוסיף לו ערים מהרשימה למטה.</p>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-brand-light px-4 py-2 text-sm text-brand-dark">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "מוסיף..." : "הוספת אזור"}
      </button>
    </form>
  );
}
