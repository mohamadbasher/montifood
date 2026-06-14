"use client";

import { useActionState, useRef, useEffect } from "react";
import { createRestaurant, type FormResult } from "@/app/actions/admin";

const initial: FormResult = {};

export default function RestaurantForm({
  cities,
}: {
  cities: { id: number; name: string; regionName: string }[];
}) {
  const [state, action, pending] = useActionState(createRestaurant, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  const field =
    "w-full rounded-xl border border-border bg-white px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold">הוספת מסעדה חדשה</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">שם המסעדה</label>
          <input name="name" className={field} placeholder="מסעדת השף" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">מספר לקוח (אופציונלי)</label>
          <input name="customerNumber" className={field} placeholder="לדוגמה: 1042" dir="ltr" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">עיר</label>
          <select name="cityId" className={field} defaultValue="">
            <option value="" disabled>
              {cities.length ? "בחר עיר..." : "אין ערים — הוסיפו ערים באזורים"}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.regionName})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">שם משתמש (לכניסה)</label>
          <input name="username" className={field} placeholder="shef" dir="ltr" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">סיסמה</label>
          <input name="password" className={field} placeholder="לפחות 4 תווים" dir="ltr" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">איש קשר (אופציונלי)</label>
          <input name="contactName" className={field} placeholder="שם" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">טלפון (אופציונלי)</label>
          <input name="phone" className={field} placeholder="05X-XXXXXXX" dir="ltr" />
        </div>
      </div>

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
        {pending ? "מוסיף..." : "הוספת מסעדה"}
      </button>
    </form>
  );
}
