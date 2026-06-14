import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireArea, can } from "@/lib/auth";
import OrderCard from "./OrderCard";
import ExportOrders from "./ExportOrders";
import OrdersFilter from "./OrdersFilter";

const ACTIVE_WHERE = { archived: false, status: { not: "DELIVERED" } } as const;
const COMPLETED_WHERE = { archived: false, status: "DELIVERED" } as const;
const ARCHIVE_WHERE = { archived: true } as const;

export default async function AdminOrdersPage(props: PageProps<"/admin">) {
  const staff = await requireArea("orders");
  const orderPerms = {
    status: can(staff, "orders.status"),
    archive: can(staff, "orders.archive"),
    del: can(staff, "orders.delete"),
  };
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const view: "active" | "completed" | "archive" =
    raw === "completed" ? "completed" : raw === "archive" ? "archive" : "active";

  const q = String(Array.isArray(sp.q) ? sp.q[0] : (sp.q ?? "")).trim();
  const dateStr = String(Array.isArray(sp.date) ? sp.date[0] : (sp.date ?? ""));

  const base =
    view === "completed" ? COMPLETED_WHERE : view === "archive" ? ARCHIVE_WHERE : ACTIVE_WHERE;

  // Optional filters: by restaurant name + by delivery date.
  const extra: Record<string, unknown> = {};
  if (q) extra.restaurant = { name: { contains: q } };
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [, y, mo, d] = m.map(Number);
    extra.deliveryDate = { gte: new Date(y, mo - 1, d), lt: new Date(y, mo - 1, d + 1) };
  }
  const where = { ...base, ...extra };

  const [orders, activeCount, completedCount, archiveCount, regions] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { restaurant: true, region: true, items: true },
      take: 200,
    }),
    prisma.order.count({ where: ACTIVE_WHERE }),
    prisma.order.count({ where: COMPLETED_WHERE }),
    prisma.order.count({ where: ARCHIVE_WHERE }),
    prisma.region.findMany({ where: { active: true }, orderBy: { weekday: "asc" } }),
  ]);

  const tabs = [
    { key: "active", label: "פעילות", count: activeCount },
    { key: "completed", label: "שנמסרו", count: completedCount },
    { key: "archive", label: "ארכיון", count: archiveCount },
  ] as const;

  const cardVariant =
    view === "completed" ? "delivered" : view === "archive" ? "archive" : "active";

  const emptyText =
    view === "completed"
      ? "עדיין אין הזמנות שנמסרו."
      : view === "archive"
        ? "הארכיון ריק."
        : "אין הזמנות פעילות כרגע.";

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">הזמנות</h1>

      {can(staff, "orders.export") && (
        <ExportOrders regions={regions.map((r) => ({ id: r.id, name: r.name }))} />
      )}

      {/* Sub-tabs */}
      <div className="mb-5 inline-flex rounded-xl border border-border bg-card p-1">
        {tabs.map((t) => {
          const isActive = view === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin?tab=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}${dateStr.match(/^\d{4}-\d{2}-\d{2}$/) ? `&date=${dateStr}` : ""}`}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                isActive ? "bg-brand text-white" : "text-muted hover:bg-background"
              }`}
            >
              {t.label}
              <span
                className={`mr-1.5 rounded-full px-1.5 text-xs ${
                  isActive ? "bg-white/20" : "bg-background"
                }`}
              >
                {t.count}
              </span>
            </Link>
          );
        })}
      </div>

      <OrdersFilter tab={view} q={q} date={m ? dateStr : ""} />

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted">
          {q || m ? "לא נמצאו הזמנות התואמות לחיפוש." : emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} variant={cardVariant} perms={orderPerms} />
          ))}
        </div>
      )}
    </div>
  );
}
