import { prisma } from "@/lib/prisma";
import { HEBREW_WEEKDAYS } from "@/lib/dates";
import { requirePermission } from "@/lib/auth";
import RegionForm from "./RegionForm";
import { updateRegion, deleteRegion, addCity, removeCity } from "@/app/actions/admin";

export default async function RegionsPage() {
  await requirePermission("regions.manage");
  const regions = await prisma.region.findMany({
    orderBy: { weekday: "asc" },
    include: {
      _count: { select: { restaurants: true, orders: true } },
      cityList: { orderBy: { name: "asc" } },
    },
  });

  const field =
    "h-9 rounded-lg border border-border bg-white px-2 outline-none focus:border-brand";

  return (
    <div className="space-y-6">
      <RegionForm />

      <div>
        <h2 className="mb-3 text-lg font-bold">אזורי חלוקה ({regions.length})</h2>
        <div className="space-y-2">
          {regions.map((r) => {
            const inUse = r._count.restaurants > 0 || r._count.orders > 0;
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <form action={updateRegion} className="flex-1 space-y-2" style={{ minWidth: "280px" }}>
                  <input type="hidden" name="id" value={r.id} />
                  <div className="flex flex-wrap items-center gap-2">
                    <div>
                      <label className="mb-0.5 block text-xs text-muted">שם האזור</label>
                      <input name="name" defaultValue={r.name} className={`${field} w-44`} />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs text-muted">יום אספקה</label>
                      <select name="weekday" defaultValue={r.weekday} className={field}>
                        {HEBREW_WEEKDAYS.map((day, idx) => (
                          <option key={idx} value={idx}>
                            יום {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
                  >
                    שמירה
                  </button>
                </form>

                {/* Cities in this area */}
                <div className="w-full border-t border-border pt-3">
                  <label className="mb-1 block text-xs text-muted">
                    ערים באזור ({r.cityList.length})
                  </label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {r.cityList.length === 0 && (
                      <span className="text-sm text-muted">עדיין אין ערים. הוסיפו למטה.</span>
                    )}
                    {r.cityList.map((c) => (
                      <span
                        key={c.id}
                        className="flex items-center gap-1 rounded-full bg-brand-light px-3 py-1 text-sm text-brand-dark"
                      >
                        {c.name}
                        <form action={removeCity} className="inline">
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="text-red-600 hover:text-red-800" title="הסר עיר">
                            ✕
                          </button>
                        </form>
                      </span>
                    ))}
                  </div>
                  <form action={addCity} className="flex items-center gap-2">
                    <input type="hidden" name="regionId" value={r.id} />
                    <input
                      name="name"
                      placeholder="הוספת עיר..."
                      className={`${field} w-48`}
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-brand bg-brand-light px-3 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand hover:text-white"
                    >
                      הוסף עיר
                    </button>
                  </form>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm text-muted">{r._count.restaurants} מסעדות</span>
                  {inUse ? (
                    <span
                      className="cursor-not-allowed rounded-lg border border-border px-3 py-1.5 text-sm text-muted opacity-60"
                      title="לא ניתן למחוק אזור שמשויכות אליו מסעדות או הזמנות"
                    >
                      מחיקה
                    </span>
                  ) : (
                    <form action={deleteRegion}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        מחיקה
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
