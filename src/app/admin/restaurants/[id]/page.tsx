import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hebrewWeekday, formatDateHe } from "@/lib/dates";
import {
  setRestaurantProduct,
  removeRestaurantProduct,
  deleteReceipt,
  updateBalance,
  toggleRestaurant,
  regenerateLoginToken,
} from "@/app/actions/admin";
import ReceiptForm from "./ReceiptForm";
import RestaurantSettings from "./RestaurantSettings";
import LoginLink from "./LoginLink";
import DeleteRestaurant from "./DeleteRestaurant";
import { requireArea, can } from "@/lib/auth";

export default async function RestaurantCatalogPage(
  props: PageProps<"/admin/restaurants/[id]">
) {
  const staff = await requireArea("restaurants");
  const canEdit = can(staff, "restaurants.edit");
  const canPassword = can(staff, "restaurants.password");
  const canPrices = can(staff, "restaurants.prices");
  const canBalance = can(staff, "restaurants.balance");
  const canDelete = can(staff, "restaurants.delete");
  const { id } = await props.params;
  const restaurantId = parseInt(id);
  if (Number.isNaN(restaurantId)) notFound();

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      region: true,
      catalog: true,
      receipts: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!restaurant) notFound();

  const totalPaid = restaurant.receipts.reduce((s, r) => s + r.amount, 0);

  const [products, cities] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.city.findMany({ orderBy: { name: "asc" }, include: { region: true } }),
  ]);

  // Map productId -> price for this restaurant's catalog.
  const priceByProduct = new Map(restaurant.catalog.map((c) => [c.productId, c.price]));

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/restaurants" className="text-sm text-muted hover:text-brand">
          ← חזרה לרשימת המסעדות
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          {!restaurant.active && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">מושבת</span>
          )}
        </div>
        <p className="text-sm text-muted">
          {restaurant.customerNumber && (
            <>
              מס׳ לקוח: <b dir="ltr">{restaurant.customerNumber}</b> ·{" "}
            </>
          )}
          {restaurant.city ? `${restaurant.city} · ` : ""}
          {restaurant.region.name} · אספקה ביום {hebrewWeekday(restaurant.region.weekday)} ·
          כניסה: <code dir="ltr">{restaurant.username}</code>
        </p>
      </div>

      {/* Magic login link */}
      {canPassword && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-1 text-lg font-bold">קישור כניסה אישי</h2>
          <p className="mb-4 text-sm text-muted">
            שלחו למסעדה את הקישור הזה — לחיצה עליו תכניס אותם ישירות לדף ההזמנות, ללא שם משתמש וסיסמה.
          </p>
          <LoginLink token={restaurant.loginToken} name={restaurant.name} phone={restaurant.phone} />
          <form action={regenerateLoginToken} className="mt-3">
            <input type="hidden" name="id" value={restaurant.id} />
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-background"
            >
              יצירת קישור חדש (ביטול הישן)
            </button>
          </form>
        </div>
      )}

      {/* Settings: details + password */}
      {(canEdit || canPassword) && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 text-lg font-bold">הגדרות מסעדה</h2>
          <RestaurantSettings
            canEdit={canEdit}
            canPassword={canPassword}
            restaurant={{
              id: restaurant.id,
              name: restaurant.name,
              customerNumber: restaurant.customerNumber,
              city: restaurant.city,
              contactName: restaurant.contactName,
              phone: restaurant.phone,
              regionId: restaurant.regionId,
              username: restaurant.username,
            }}
            cities={cities.map((c) => ({ id: c.id, name: c.name, regionName: c.region.name }))}
          />

          {canEdit && (
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <form action={toggleRestaurant}>
                <input type="hidden" name="id" value={restaurant.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-background"
                >
                  {restaurant.active ? "השבתת מסעדה" : "הפעלת מסעדה"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {canPrices && (
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-bold">מוצרים ומחירים</h2>
        <p className="mb-4 text-sm text-muted">
          בחר אילו מוצרים מסעדה זו יכולה להזמין, וקבע מחיר ליחידה (₪). רק מוצרים
          ש&quot;במחירון&quot; יוצגו למסעדה.
        </p>

        <div className="space-y-2">
          {products.map((p) => {
            const inCatalog = priceByProduct.has(p.id);
            const price = priceByProduct.get(p.id) ?? "";
            return (
              <div
                key={p.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
                  inCatalog ? "border-brand/40 bg-brand-light/40" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-light text-xl">
                      🫙
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{p.name}</span>
                    {inCatalog && (
                      <span className="mr-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">
                        במחירון
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <form action={setRestaurantProduct} className="flex items-center gap-1.5">
                    <input type="hidden" name="restaurantId" value={restaurant.id} />
                    <input type="hidden" name="productId" value={p.id} />
                    <span className="text-sm text-muted">₪</span>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      defaultValue={price}
                      dir="ltr"
                      placeholder="מחיר"
                      className="h-9 w-24 rounded-lg border border-border bg-white px-2 text-center outline-none focus:border-brand"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
                    >
                      {inCatalog ? "עדכון" : "הוספה"}
                    </button>
                  </form>
                  {inCatalog && (
                    <form action={removeRestaurantProduct}>
                      <input type="hidden" name="restaurantId" value={restaurant.id} />
                      <input type="hidden" name="productId" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        הסרה
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Payments & receipts */}
      {canBalance && (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">תשלומים וקבלות</h2>
          <div className="flex items-center gap-4 text-sm">
            <span>
              יתרת חוב:{" "}
              <b className={(restaurant.balance ?? 0) > 0 ? "text-accent" : "text-muted"}>
                ₪{(restaurant.balance ?? 0).toLocaleString("he-IL")}
              </b>
            </span>
            <span className="text-muted">
              סה&quot;כ שולם: ₪{totalPaid.toLocaleString("he-IL")}
            </span>
          </div>
        </div>

        {/* Manual balance update */}
        <form action={updateBalance} className="mb-4 flex items-center gap-2">
          <input type="hidden" name="id" value={restaurant.id} />
          <label className="text-sm font-medium">עדכון יתרת חוב ₪</label>
          <input
            type="number"
            name="balance"
            step="0.01"
            defaultValue={restaurant.balance ?? 0}
            dir="ltr"
            className="h-9 w-28 rounded-lg border border-border bg-white px-2 text-center outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            שמירה
          </button>
        </form>

        <div className="mb-5 rounded-xl bg-background p-4">
          <ReceiptForm restaurantId={restaurant.id} />
        </div>

        {restaurant.receipts.length === 0 ? (
          <p className="text-sm text-muted">עדיין לא נרשמו קבלות.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-muted">
                  <th className="px-3 py-2 font-medium">מס׳ קבלה</th>
                  <th className="px-3 py-2 font-medium">סכום</th>
                  <th className="px-3 py-2 font-medium">תאריך</th>
                  <th className="px-3 py-2 font-medium">הערה</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {restaurant.receipts.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium" dir="ltr">
                      {r.receiptNumber}
                    </td>
                    <td className="px-3 py-2 text-brand">
                      ₪{r.amount.toLocaleString("he-IL")}
                    </td>
                    <td className="px-3 py-2 text-muted">{formatDateHe(r.createdAt)}</td>
                    <td className="px-3 py-2 text-muted">{r.note ?? "—"}</td>
                    <td className="px-3 py-2 text-left">
                      <form action={deleteReceipt}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:underline"
                          title="מחיקת הקבלה תחזיר את הסכום ליתרת החוב"
                        >
                          מחיקה
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {canDelete && (
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
          <h2 className="mb-1 text-lg font-bold text-red-700">אזור מסוכן</h2>
          <p className="mb-3 text-sm text-muted">
            מחיקת המסעדה תסיר לצמיתות את כל הנתונים שלה (הזמנות, קבלות, מחירים) — אין שחזור.
          </p>
          <DeleteRestaurant id={restaurant.id} name={restaurant.name} />
        </div>
      )}
    </div>
  );
}
