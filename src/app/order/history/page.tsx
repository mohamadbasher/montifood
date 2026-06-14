import Link from "next/link";
import { requireRestaurant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateHe, hebrewWeekday } from "@/lib/dates";

const STATUS_LABEL: Record<string, string> = {
  NEW: "התקבלה",
  CONFIRMED: "אושרה",
  DELIVERED: "נמסרה",
  CANCELLED: "בוטלה",
};
const STATUS_COLOR: Record<string, string> = {
  NEW: "bg-green-100 text-green-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function OrderHistoryPage() {
  const session = await requireRestaurant();

  const orders = await prisma.order.findMany({
    where: { restaurantId: session.userId, archived: false },
    orderBy: { createdAt: "desc" },
    include: { items: true, region: true },
    take: 100,
  });

  const active = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const past = orders.filter((o) => o.status === "DELIVERED" || o.status === "CANCELLED");

  return (
    <div className="space-y-6">
      <section>
        <h1 className="mb-3 text-xl font-bold">הזמנות פעילות</h1>
        {active.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-6 text-center text-muted">
            אין הזמנות פעילות.{" "}
            <Link href="/order" className="font-medium text-brand hover:underline">
              לביצוע הזמנה חדשה
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {active.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-bold">הזמנות קודמות</h2>
          <div className="space-y-3">
            {past.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        </section>
      )}
    </div>
  );

  function OrderRow({ order }: { order: (typeof orders)[number] }) {
    const total = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status] ?? ""}`}
            >
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
            <span className="text-sm text-muted">
              הוזמן {formatDateHe(order.createdAt)} · אספקה {hebrewWeekday(order.region.weekday)}{" "}
              ({formatDateHe(order.deliveryDate)})
            </span>
          </div>
          <Link
            href={`/order?repeat=${order.id}`}
            className="rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand hover:text-white"
          >
            הזמנה חוזרת
          </Link>
        </div>

        <ul className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {order.items.map((i) => (
            <li key={i.id} className="rounded-lg bg-brand-light px-3 py-1 text-sm text-brand-dark">
              {i.productName} × <b>{i.quantity}</b>
            </li>
          ))}
        </ul>

        {total > 0 && (
          <p className="mt-2 text-sm font-semibold">
            סה&quot;כ: ₪{total.toLocaleString("he-IL")}
          </p>
        )}
        {order.notes && (
          <p className="mt-1 text-sm text-muted">
            <b>הערות:</b> {order.notes}
          </p>
        )}
      </div>
    );
  }
}
