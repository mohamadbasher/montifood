"use client";

import { useState } from "react";
import { updateManager, deleteManager, resetManagerPassword } from "@/app/actions/admin";
import { PERMISSION_GROUPS } from "@/lib/permissions";

type Manager = {
  id: number;
  name: string;
  username: string;
  active: boolean;
  permissions: string[];
};

export default function ManagerRow({ manager }: { manager: Manager }) {
  const [open, setOpen] = useState(false);
  const current = manager.permissions;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-right hover:bg-background"
      >
        <span className="flex items-center gap-2">
          <span className="font-semibold">{manager.name}</span>
          <span className="text-sm text-muted">
            (כניסה: <code dir="ltr">{manager.username}</code>)
          </span>
          {!manager.active && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">מושבת</span>
          )}
        </span>
        <span className="text-muted">{open ? "▲" : "▼"}</span>
      </button>

      {/* Collapsible content */}
      {open && (
        <div className="border-t border-border p-4">
          <form action={updateManager} className="space-y-2">
            <input type="hidden" name="id" value={manager.id} />
            {PERMISSION_GROUPS.map((g) => (
              <div key={g.area} className="rounded-lg border border-border p-3">
                <p className="mb-2 text-sm font-bold text-brand-dark">{g.label}</p>
                <div className="flex flex-wrap gap-2">
                  {g.perms.map((p) => (
                    <label key={p.key} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        name="perm"
                        value={p.key}
                        defaultChecked={current.includes(p.key)}
                        className="accent-brand"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="active" defaultChecked={manager.active} className="accent-brand" />
                פעיל
              </label>
              <button
                type="submit"
                className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
              >
                שמירת הרשאות
              </button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <form action={resetManagerPassword} className="flex items-center gap-1.5">
              <input type="hidden" name="id" value={manager.id} />
              <input
                name="password"
                dir="ltr"
                placeholder="סיסמה חדשה"
                className="h-8 w-36 rounded-lg border border-border px-2 text-sm outline-none focus:border-brand"
              />
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">
                איפוס סיסמה
              </button>
            </form>
            <form action={deleteManager} className="md:mr-auto">
              <input type="hidden" name="id" value={manager.id} />
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                מחיקה
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
