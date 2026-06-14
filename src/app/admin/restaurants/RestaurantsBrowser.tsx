"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import RestaurantForm from "./RestaurantForm";

type Region = { id: number; name: string };
type Row = {
  id: number;
  name: string;
  username: string;
  customerNumber: string | null;
  city: string | null;
  contactName: string | null;
  phone: string | null;
  active: boolean;
  balance: number;
  regionId: number;
  regionName: string;
  weekdayName: string;
};

export default function RestaurantsBrowser({
  restaurants,
  regions,
  cities,
  canCreate,
}: {
  restaurants: Row[];
  regions: Region[];
  cities: { id: number; name: string; regionName: string }[];
  canCreate: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return restaurants.filter((r) => {
      const matchesName =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.username.toLowerCase().includes(q) ||
        (r.customerNumber?.toLowerCase().includes(q) ?? false) ||
        (r.city?.toLowerCase().includes(q) ?? false);
      const matchesRegion = !regionFilter || r.regionId === Number(regionFilter);
      return matchesName && matchesRegion;
    });
  }, [restaurants, search, regionFilter]);

  const field =
    "h-10 rounded-xl border border-border bg-white px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="space-y-5">
      {/* Top bar: title + add button */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">מסעדות ({restaurants.length})</h1>
        {canCreate && (
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand-dark"
          >
            <span className="text-lg leading-none">{showAdd ? "×" : "+"}</span>
            {showAdd ? "סגירה" : "הוספת מסעדה"}
          </button>
        )}
      </div>

      {/* Collapsible add form */}
      {canCreate && showAdd && <RestaurantForm cities={cities} />}

      {/* Search + area filter */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 חיפוש לפי שם מסעדה..."
          className={`${field} flex-1 min-w-48`}
        />
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className={`${field} min-w-44`}
        >
          <option value="">כל האזורים</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted">
          לא נמצאו מסעדות.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.name}</span>
                  {!r.active && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      מושבת
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-sm text-muted">
                  {r.customerNumber && (
                    <>
                      מס׳ לקוח: <b dir="ltr">{r.customerNumber}</b> ·{" "}
                    </>
                  )}
                  כניסה: <code dir="ltr">{r.username}</code> ·{" "}
                  {r.city ? `${r.city} · ` : ""}{r.regionName} (יום {r.weekdayName})
                  {r.contactName && ` · ${r.contactName}`}
                  {r.phone && ` · ${r.phone}`}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm">
                  יתרת חוב:{" "}
                  <b className={r.balance > 0 ? "text-accent" : "text-muted"}>
                    ₪{r.balance.toLocaleString("he-IL")}
                  </b>
                </span>
                <Link
                  href={`/admin/restaurants/${r.id}`}
                  className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  ניהול מסעדה
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
