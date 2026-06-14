"use client";

import { updateOrderStatus } from "@/app/actions/admin";

const STATUSES: Record<string, string> = {
  NEW: "חדשה",
  CONFIRMED: "אושרה",
  DELIVERED: "נמסרה",
  CANCELLED: "בוטלה",
};

export default function StatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: string;
}) {
  return (
    <form action={updateOrderStatus}>
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-border bg-card px-2 py-1 text-sm outline-none focus:border-brand"
      >
        {Object.entries(STATUSES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
