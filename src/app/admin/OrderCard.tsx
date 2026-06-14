import { formatDateHe, hebrewWeekday } from "@/lib/dates";
import { waLink } from "@/lib/whatsapp";
import StatusSelect from "./StatusSelect";
import { archiveOrder, unarchiveOrder, deleteOrder } from "@/app/actions/admin";

const STATUS_LABEL: Record<string, string> = {
  NEW: "חדשה",
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

type OrderWithRelations = {
  id: number;
  status: string;
  notes: string | null;
  deliveryDate: Date;
  createdAt: Date;
  restaurant: { name: string; phone: string | null };
  region: { name: string; weekday: number };
  items: { id: number; productName: string; quantity: number; price: number }[];
};

export default function OrderCard({
  order,
  variant,
  perms,
}: {
  order: OrderWithRelations;
  variant: "active" | "delivered" | "archive";
  perms: { status: boolean; archive: boolean; del: boolean };
}) {
  const total = order.items.reduce((s, i) => s + i.quantity * i.price, 0);

  // Context-aware WhatsApp message to the restaurant.
  const waMessage =
    variant === "delivered"
      ? `שלום ${order.restaurant.name}, ההזמנה שלך מ-MontiFood נמסרה. תודה! 🙏`
      : `שלום ${order.restaurant.name}, ההזמנה שלך מ-MontiFood התקבלה ותסופק ביום ${hebrewWeekday(order.region.weekday)} (${formatDateHe(order.deliveryDate)}). תודה!`;
  const waHref = waLink(order.restaurant.phone, waMessage);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{order.restaurant.name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status] ?? ""}`}
            >
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <div className="mt-1 text-sm text-muted">
            {order.region.name} · אספקה {hebrewWeekday(order.region.weekday)} (
            {formatDateHe(order.deliveryDate)})
            {order.restaurant.phone && ` · 📞 ${order.restaurant.phone}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">התקבלה {formatDateHe(order.createdAt)}</span>
          {variant !== "archive" && perms.status && (
            <StatusSelect orderId={order.id} status={order.status} />
          )}
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
        {order.items.map((i) => (
          <li key={i.id} className="rounded-lg bg-brand-light px-3 py-1 text-sm text-brand-dark">
            {i.productName} × <b>{i.quantity}</b>
            {i.price > 0 && (
              <span className="text-brand-dark/60"> (₪{(i.quantity * i.price).toLocaleString("he-IL")})</span>
            )}
          </li>
        ))}
      </ul>

      {order.items.some((i) => i.price > 0) && (
        <p className="mt-2 text-sm font-semibold">
          סה&quot;כ הזמנה: ₪{total.toLocaleString("he-IL")}
        </p>
      )}

      {order.notes && (
        <p className="mt-2 text-sm text-muted">
          <b>הערות:</b> {order.notes}
        </p>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            וואטסאפ ללקוח
          </a>
        )}
        {perms.archive &&
          (variant === "archive" ? (
            <form action={unarchiveOrder}>
              <input type="hidden" name="id" value={order.id} />
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">
                שחזור מהארכיון
              </button>
            </form>
          ) : (
            <form action={archiveOrder}>
              <input type="hidden" name="id" value={order.id} />
              <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-background">
                העברה לארכיון
              </button>
            </form>
          ))}
        {perms.del && (
          <form action={deleteOrder}>
            <input type="hidden" name="id" value={order.id} />
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
              מחיקה לצמיתות
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
