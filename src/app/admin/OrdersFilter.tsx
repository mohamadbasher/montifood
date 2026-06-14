"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function OrdersFilter({
  tab,
  q,
  date,
}: {
  tab: string;
  q: string;
  date: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(q);
  const [d, setD] = useState(date);
  const first = useRef(true);

  function apply(nextQ: string, nextD: string) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextD) params.set("date", nextD);
    router.replace(`/admin?${params.toString()}`);
  }

  // Debounce the text search.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => apply(search, d), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const field =
    "h-10 rounded-xl border border-border bg-white px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 חיפוש לפי שם מסעדה..."
        className={`${field} flex-1 min-w-48`}
      />
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted">תאריך אספקה</label>
        <input
          type="date"
          value={d}
          onChange={(e) => {
            setD(e.target.value);
            apply(search, e.target.value);
          }}
          dir="ltr"
          className={field}
        />
      </div>
      {(q || date) && (
        <button
          onClick={() => {
            setSearch("");
            setD("");
            router.replace(`/admin?tab=${tab}`);
          }}
          className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-card"
        >
          נקה סינון
        </button>
      )}
    </div>
  );
}
