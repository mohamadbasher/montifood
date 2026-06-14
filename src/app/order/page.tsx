import OrderForm from "./OrderForm";
import { requireRestaurant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextDeliveryDate, formatDateHe, hebrewWeekday } from "@/lib/dates";

export default async function OrderPage(props: PageProps<"/order">) {
  const session = await requireRestaurant();
  const sp = await props.searchParams;
  const repeatId = parseInt(Array.isArray(sp.repeat) ? sp.repeat[0] : (sp.repeat ?? ""));

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.userId },
    include: { region: true },
  });
  if (!restaurant) {
    return <p className="p-8">המסעדה לא נמצאה.</p>;
  }

  // Only the products assigned to this restaurant, at their custom prices.
  const catalog = await prisma.restaurantProduct.findMany({
    where: { restaurantId: restaurant.id, product: { active: true } },
    include: { product: true },
  });
  const products = catalog
    .sort((a, b) => a.product.sortOrder - b.product.sortOrder)
    .map((c) => ({
      id: c.productId,
      name: c.product.name,
      imageUrl: c.product.imageUrl,
      price: c.price,
    }));

  // If reordering, pre-fill quantities from a previous order (this restaurant's only).
  let initialQuantities: Record<number, number> = {};
  if (repeatId) {
    const prev = await prisma.order.findFirst({
      where: { id: repeatId, restaurantId: restaurant.id },
      include: { items: true },
    });
    if (prev) {
      initialQuantities = Object.fromEntries(prev.items.map((i) => [i.productId, i.quantity]));
    }
  }

  const delivery = nextDeliveryDate(restaurant.region.weekday);

  return (
    <>
      <div className="mb-5 rounded-2xl bg-brand-light p-4">
        <h1 className="text-xl font-bold text-brand-dark">ביצוע הזמנה חדשה</h1>
        <p className="mt-1 text-sm text-brand-dark/80">
          {restaurant.city ? "העיר שלך: " : "אזור החלוקה שלך: "}
          <b>{restaurant.city || restaurant.region.name}</b> · אספקה ביום{" "}
          <b>{hebrewWeekday(restaurant.region.weekday)}</b> ({formatDateHe(delivery)})
        </p>
      </div>

      {(restaurant.balance ?? 0) > 0 && (
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <span className="font-medium text-foreground">יתרת חוב</span>
          <span className="text-lg font-bold text-accent">
            ₪{(restaurant.balance ?? 0).toLocaleString("he-IL")}
          </span>
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted">
          עדיין לא הוגדרו עבורך מוצרים. נא לפנות ל-MontiFood.
        </div>
      ) : (
        <OrderForm products={products} initialQuantities={initialQuantities} />
      )}
    </>
  );
}
