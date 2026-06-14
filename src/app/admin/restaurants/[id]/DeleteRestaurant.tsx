"use client";

import { deleteRestaurant } from "@/app/actions/admin";

export default function DeleteRestaurant({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={deleteRestaurant}
      onSubmit={(e) => {
        if (
          !confirm(
            `למחוק לצמיתות את "${name}"?\nפעולה זו תמחק את המסעדה וכל ההזמנות, הקבלות והמחירים שלה — ולא ניתן לשחזר.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
      >
        מחיקת מסעדה לצמיתות
      </button>
    </form>
  );
}
