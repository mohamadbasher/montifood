"use client";

import { useActionState, useRef, useEffect } from "react";
import { addReceipt, type FormResult } from "@/app/actions/admin";

const initial: FormResult = {};

export default function ReceiptForm({ restaurantId }: { restaurantId: number }) {
  const [state, action, pending] = useActionState(addReceipt, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  const field =
    "h-9 rounded-lg border border-border bg-white px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">מספר קבלה</label>
          <input name="receiptNumber" dir="ltr" className={`${field} w-32`} placeholder="1024" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">סכום ששולם ₪</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            className={`${field} w-28 text-center`}
            placeholder="0"
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="mb-1 block text-sm font-medium">הערה (אופציונלי)</label>
          <input name="note" className={`${field} w-full`} placeholder="מזומן / העברה..." />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "רושם..." : "רישום קבלה"}
        </button>
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-brand-light px-4 py-2 text-sm text-brand-dark">
          {state.success}
        </p>
      )}
    </form>
  );
}
