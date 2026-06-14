"use client";

import { useState } from "react";

type Region = { id: number; name: string };

export default function ExportOrders({ regions }: { regions: Region[] }) {
  const [open, setOpen] = useState(false);
  const [regionId, setRegionId] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("all");

  const field =
    "h-9 rounded-lg border border-border bg-white px-3 outline-none focus:border-brand";

  function download() {
    if (!regionId || !date) return;
    window.open(
      `/admin/orders/export?date=${date}&regionId=${regionId}&type=${type}`,
      "_blank"
    );
  }

  return (
    <div className="mb-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xl border border-brand bg-brand-light px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand hover:text-white"
      >
        📊 ייצוא הזמנות לאקסל
      </button>

      {open && (
        <div className="mt-3 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
          <div>
            <label className="mb-1 block text-sm font-medium">אזור</label>
            <select value={regionId} onChange={(e) => setRegionId(e.target.value)} className={field}>
              <option value="">בחר אזור...</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">תאריך אספקה</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={field}
              dir="ltr"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">סוג הזמנות</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={field}>
              <option value="all">הכל (פעילות + שנמסרו)</option>
              <option value="active">פעילות בלבד</option>
              <option value="completed">שנמסרו בלבד</option>
              <option value="archive">ארכיון</option>
            </select>
          </div>
          <button
            onClick={download}
            disabled={!regionId || !date}
            className="h-9 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            הורדת קובץ אקסל
          </button>
        </div>
      )}
    </div>
  );
}
