"use client";

import { useState, useMemo } from "react";
import { useActionState } from "react";
import { bulkSetCatalog, type FormResult } from "@/app/actions/admin";

type Restaurant = { id: number; name: string; city: string | null; regionId: number; regionName: string };
type Region = { id: number; name: string };
type Product = { id: number; name: string; imageUrl: string | null };

const initial: FormResult = {};

export default function BulkCatalog({
  restaurants,
  regions,
  products,
}: {
  restaurants: Restaurant[];
  regions: Region[];
  products: Product[];
}) {
  const [state, action, pending] = useActionState(bulkSetCatalog, initial);
  const [regionFilter, setRegionFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  // product include + price
  const [inc, setInc] = useState<Record<number, boolean>>({});
  const [price, setPrice] = useState<Record<number, string>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return restaurants.filter(
      (r) =>
        (!regionFilter || r.regionId === Number(regionFilter)) &&
        (!q || r.name.toLowerCase().includes(q) || (r.city ?? "").toLowerCase().includes(q))
    );
  }, [restaurants, regionFilter, search]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  function toggle(id: number) {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleAllFiltered() {
    setSelected((s) => {
      const n = new Set(s);
      if (allFilteredSelected) filtered.forEach((r) => n.delete(r.id));
      else filtered.forEach((r) => n.add(r.id));
      return n;
    });
  }

  const field =
    "rounded-lg border border-border bg-white px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <form action={action} className="space-y-5">
      {/* hidden selected restaurant ids */}
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="rid" value={id} />
      ))}

      {/* Step 1: products + prices */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-bold">1. בחר מוצרים ומחירים</h2>
        <p className="mb-4 text-sm text-muted">
          סמן את המוצרים שיוצגו למסעדות שתבחר, וקבע מחיר. מוצר שלא יסומן — יוסר מהתפריט של אותן מסעדות.
        </p>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!inc[p.id]}
                  onChange={() => setInc((s) => ({ ...s, [p.id]: !s[p.id] }))}
                  className="h-5 w-5 accent-brand"
                />
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                )}
                <span className="font-medium">{p.name}</span>
              </label>
              {inc[p.id] && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted">₪</span>
                  <input
                    name={`price_${p.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={price[p.id] ?? ""}
                    onChange={(e) => setPrice((s) => ({ ...s, [p.id]: e.target.value }))}
                    dir="ltr"
                    placeholder="מחיר"
                    className={`${field} w-28 text-center`}
                  />
                  <input type="hidden" name="includedProduct" value={p.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: choose restaurants */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-bold">2. בחר מסעדות</h2>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className={field}>
            <option value="">כל האזורים</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 חיפוש..."
            className={`${field} flex-1 min-w-40`}
          />
          <button
            type="button"
            onClick={toggleAllFiltered}
            className="rounded-lg border border-brand bg-brand-light px-3 py-2 text-sm font-medium text-brand-dark hover:bg-brand hover:text-white"
          >
            {allFilteredSelected ? "בטל בחירת הכל" : "בחר הכל"}
          </button>
          <span className="text-sm font-medium">נבחרו: {selected.size}</span>
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
          {filtered.map((r) => (
            <label key={r.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-background">
              <input
                type="checkbox"
                checked={selected.has(r.id)}
                onChange={() => toggle(r.id)}
                className="h-4 w-4 accent-brand"
              />
              <span className="text-sm">
                {r.name}
                <span className="text-muted"> · {r.city || r.regionName}</span>
              </span>
            </label>
          ))}
          {filtered.length === 0 && <p className="p-3 text-sm text-muted">אין מסעדות מתאימות.</p>}
        </div>
      </div>

      {state.error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>}
      {state.success && (
        <p className="rounded-lg bg-brand-light px-4 py-2 text-sm text-brand-dark">{state.success} ✓</p>
      )}

      <button
        type="submit"
        disabled={pending || selected.size === 0}
        className="w-full rounded-xl bg-brand py-3 text-base font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "מעדכן..." : `החל על ${selected.size} מסעדות`}
      </button>
    </form>
  );
}
