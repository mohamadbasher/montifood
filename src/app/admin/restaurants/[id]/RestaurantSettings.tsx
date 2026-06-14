"use client";

import { useActionState } from "react";
import {
  updateRestaurantDetails,
  resetRestaurantPassword,
  type FormResult,
} from "@/app/actions/admin";

type Restaurant = {
  id: number;
  name: string;
  customerNumber: string | null;
  city: string | null;
  contactName: string | null;
  phone: string | null;
  regionId: number;
  username: string;
};

const initial: FormResult = {};

export default function RestaurantSettings({
  restaurant,
  cities,
  canEdit,
  canPassword,
}: {
  restaurant: Restaurant;
  cities: { id: number; name: string; regionName: string }[];
  canEdit: boolean;
  canPassword: boolean;
}) {
  const [dState, dAction, dPending] = useActionState(updateRestaurantDetails, initial);
  const [pState, pAction, pPending] = useActionState(resetRestaurantPassword, initial);

  const field =
    "w-full rounded-xl border border-border bg-white px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Edit details */}
      {canEdit && (
      <form action={dAction} className="space-y-3 rounded-xl border border-border p-4">
        <input type="hidden" name="id" value={restaurant.id} />
        <h3 className="font-bold">פרטי המסעדה</h3>
        <div>
          <label className="mb-1 block text-sm font-medium">שם המסעדה</label>
          <input name="name" defaultValue={restaurant.name} className={field} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">מספר לקוח</label>
          <input
            name="customerNumber"
            defaultValue={restaurant.customerNumber ?? ""}
            dir="ltr"
            className={field}
            placeholder="מספר לקוח פנימי"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">עיר</label>
          <select
            name="cityId"
            defaultValue={cities.find((c) => c.name === restaurant.city)?.id ?? ""}
            className={field}
          >
            <option value="" disabled>
              {cities.length ? "בחר עיר..." : "אין ערים — הוסיפו באזורים"}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.regionName})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">איש קשר</label>
            <input name="contactName" defaultValue={restaurant.contactName ?? ""} className={field} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">טלפון</label>
            <input name="phone" defaultValue={restaurant.phone ?? ""} dir="ltr" className={field} />
          </div>
        </div>
        {dState.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{dState.error}</p>
        )}
        {dState.success && (
          <p className="rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark">{dState.success}</p>
        )}
        <button
          type="submit"
          disabled={dPending}
          className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {dPending ? "שומר..." : "שמירת פרטים"}
        </button>
      </form>
      )}

      {/* Reset password */}
      {canPassword && (
      <form action={pAction} className="space-y-3 rounded-xl border border-border p-4">
        <input type="hidden" name="id" value={restaurant.id} />
        <h3 className="font-bold">איפוס סיסמה</h3>
        <p className="text-sm text-muted">
          שם המשתמש לכניסה: <code dir="ltr">{restaurant.username}</code>
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium">סיסמה חדשה</label>
          <input name="password" dir="ltr" className={field} placeholder="לפחות 4 תווים" />
        </div>
        {pState.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pState.error}</p>
        )}
        {pState.success && (
          <p className="rounded-lg bg-brand-light px-3 py-2 text-sm text-brand-dark">{pState.success}</p>
        )}
        <button
          type="submit"
          disabled={pPending}
          className="rounded-xl border border-border px-5 py-2.5 font-semibold hover:bg-background disabled:opacity-60"
        >
          {pPending ? "מעדכן..." : "עדכון סיסמה"}
        </button>
      </form>
      )}
    </div>
  );
}
