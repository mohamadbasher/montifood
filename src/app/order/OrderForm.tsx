"use client";

import { useActionState, useState } from "react";
import { submitOrder, type OrderState } from "@/app/actions/orders";

type Product = { id: number; name: string; imageUrl: string | null; price: number };

const initial: OrderState = {};

const shekel = (n: number) => `₪${n.toLocaleString("he-IL")}`;

export default function OrderForm({
  products,
  initialQuantities = {},
}: {
  products: Product[];
  initialQuantities?: Record<number, number>;
}) {
  const [quantities, setQuantities] = useState<Record<number, number>>(initialQuantities);
  const [notes, setNotes] = useState("");
  const [state, action, pending] = useActionState(submitOrder, initial);

  const setQty = (id: number, qty: number) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(0, qty) }));

  const items = products
    .map((p) => ({ productId: p.id, quantity: quantities[p.id] ?? 0 }))
    .filter((l) => l.quantity > 0);

  const totalUnits = items.reduce((sum, l) => sum + l.quantity, 0);
  const priceById = new Map(products.map((p) => [p.id, p.price]));
  const totalPrice = items.reduce(
    (sum, l) => sum + l.quantity * (priceById.get(l.productId) ?? 0),
    0
  );

  if (state.success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-3xl">
          ✅
        </div>
        <h2 className="text-xl font-bold">ההזמנה נשלחה בהצלחה!</h2>
        <p className="mt-2 text-muted">
          MontiFood קיבלו את ההזמנה שלך. תודה!
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
          >
            הזמנה נוספת
          </button>
          <a
            href="/order/history"
            className="rounded-xl border border-border px-5 py-2.5 font-semibold hover:bg-background"
          >
            ההזמנות שלי
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="space-y-3">
        {products.map((p) => {
          const qty = quantities[p.id] ?? 0;
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-light text-2xl">
                    🫙
                  </div>
                )}
                <div>
                  <span className="block font-medium">{p.name}</span>
                  <span className="text-sm text-muted">{shekel(p.price)} ליחידה</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty(p.id, qty - 1)}
                  className="h-9 w-9 rounded-lg border border-border text-lg font-bold text-muted hover:bg-background"
                  aria-label="הפחת"
                >
                  −
                </button>
                <input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => setQty(p.id, parseInt(e.target.value) || 0)}
                  className="h-9 w-14 rounded-lg border border-border text-center outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setQty(p.id, qty + 1)}
                  className="h-9 w-9 rounded-lg border border-border text-lg font-bold text-brand hover:bg-brand-light"
                  aria-label="הוסף"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium">
          הערות להזמנה (אופציונלי)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="למשל מספר טלפון חלופי להתקשר"
        />
      </div>

      {totalUnits > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
          <span className="font-medium">סה&quot;כ הזמנה ({totalUnits} פריטים)</span>
          <span className="text-lg font-bold text-brand">{shekel(totalPrice)}</span>
        </div>
      )}

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || totalUnits === 0}
        className="w-full rounded-xl bg-brand py-3.5 text-base font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {pending
          ? "שולח..."
          : totalUnits === 0
            ? "בחר כמות כדי להזמין"
            : `שליחת הזמנה · ${shekel(totalPrice)}`}
      </button>
    </form>
  );
}
