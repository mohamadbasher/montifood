// Shared permission catalog (no server-only import — usable in client UI too).
// Each manager stores a CSV of the permission keys below.

export type PermGroup = {
  area: string;
  label: string;
  path: string;
  perms: { key: string; label: string }[];
};

export const PERMISSION_GROUPS: PermGroup[] = [
  {
    area: "orders",
    label: "הזמנות",
    path: "/admin",
    perms: [
      { key: "orders.view", label: "צפייה בהזמנות" },
      { key: "orders.status", label: "שינוי סטטוס / סימון כנמסר" },
      { key: "orders.archive", label: "ארכוב ושחזור" },
      { key: "orders.delete", label: "מחיקת הזמנות" },
      { key: "orders.export", label: "ייצוא לאקסל" },
    ],
  },
  {
    area: "restaurants",
    label: "מסעדות",
    path: "/admin/restaurants",
    perms: [
      { key: "restaurants.view", label: "צפייה במסעדות" },
      { key: "restaurants.create", label: "פתיחת מסעדה חדשה" },
      { key: "restaurants.edit", label: "עריכת פרטים / הפעלה" },
      { key: "restaurants.password", label: "איפוס סיסמה / קישור כניסה" },
      { key: "restaurants.prices", label: "מוצרים ומחירים" },
      { key: "restaurants.balance", label: "יתרת חוב וקבלות" },
      { key: "restaurants.delete", label: "מחיקת מסעדה לצמיתות" },
    ],
  },
  {
    area: "regions",
    label: "אזורים",
    path: "/admin/regions",
    perms: [{ key: "regions.manage", label: "ניהול אזורים" }],
  },
  {
    area: "whatsapp",
    label: "וואטסאפ",
    path: "/admin/whatsapp",
    perms: [{ key: "whatsapp.use", label: "שליחת הודעות וואטסאפ" }],
  },
];

export const PERMISSIONS: string[] = PERMISSION_GROUPS.flatMap((g) =>
  g.perms.map((p) => p.key)
);

export function hasPerm(perms: string[], isOwner: boolean, key: string): boolean {
  return isOwner || perms.includes(key);
}

// True if the user can access an area at all (owner, or has any permission in it).
export function hasArea(perms: string[], isOwner: boolean, area: string): boolean {
  return isOwner || perms.some((p) => p.startsWith(area + "."));
}
