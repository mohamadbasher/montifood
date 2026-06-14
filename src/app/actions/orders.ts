"use server";

import { prisma } from "@/lib/prisma";
import { requireRestaurant } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { nextDeliveryDate, formatDateHe, hebrewWeekday } from "@/lib/dates";
import { refresh } from "next/cache";

export type OrderState = { error?: string; success?: boolean };

// Submits an order for the logged-in restaurant.
// `items` arrives as JSON: [{ productId, quantity }]
export async function submitOrder(
  _prev: OrderState,
  formData: FormData
): Promise<OrderState> {
  const session = await requireRestaurant();

  const notes = String(formData.get("notes") ?? "").trim() || null;
  let parsed: { productId: number; quantity: number }[] = [];
  try {
    parsed = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "אירעה שגיאה בקריאת ההזמנה" };
  }

  const lines = parsed.filter((l) => l.quantity > 0);
  if (lines.length === 0) {
    return { error: "נא לבחור לפחות מוצר אחד בכמות גדולה מ-0" };
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.userId },
    include: { region: true },
  });
  if (!restaurant) return { error: "המסעדה לא נמצאה" };

  // Only products in this restaurant's catalog are orderable, at their custom price.
  const productIds = lines.map((l) => l.productId);
  const catalog = await prisma.restaurantProduct.findMany({
    where: { restaurantId: restaurant.id, productId: { in: productIds }, product: { active: true } },
    include: { product: true },
  });
  const catalogByProduct = new Map(catalog.map((c) => [c.productId, c]));

  const validLines = lines.filter((l) => catalogByProduct.has(l.productId));
  if (validLines.length === 0) {
    return { error: "המוצרים שנבחרו אינם זמינים עבורך" };
  }

  const deliveryDate = nextDeliveryDate(restaurant.region.weekday);

  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      regionId: restaurant.regionId,
      deliveryDate,
      notes,
      status: "NEW",
      items: {
        create: validLines.map((l) => {
          const c = catalogByProduct.get(l.productId)!;
          return {
            productId: l.productId,
            productName: c.product.name,
            quantity: l.quantity,
            price: c.price,
          };
        }),
      },
    },
    include: { items: true },
  });

  const orderTotal = order.items.reduce((s, i) => s + i.quantity * i.price, 0);

  // Notify the MontiFood owner by email.
  const admin = await prisma.admin.findFirst();
  if (admin?.alertEmail) {
    const rows = order.items
      .map(
        (i) =>
          `<tr><td style="padding:4px 12px">${i.productName}</td><td style="padding:4px 12px"><b>${i.quantity}</b></td><td style="padding:4px 12px">₪${i.price.toLocaleString("he-IL")}</td><td style="padding:4px 12px">₪${(i.quantity * i.price).toLocaleString("he-IL")}</td></tr>`
      )
      .join("");
    await sendEmail({
      to: admin.alertEmail,
      subject: `הזמנה חדשה — ${restaurant.name}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif">
          <h2>הזמנה חדשה התקבלה 🟢</h2>
          <p><b>מסעדה:</b> ${restaurant.name}<br/>
          <b>אזור:</b> ${restaurant.region.name}<br/>
          <b>יום אספקה:</b> ${hebrewWeekday(restaurant.region.weekday)} (${formatDateHe(deliveryDate)})<br/>
          ${restaurant.contactName ? `<b>איש קשר:</b> ${restaurant.contactName}<br/>` : ""}
          ${restaurant.phone ? `<b>טלפון:</b> ${restaurant.phone}<br/>` : ""}</p>
          <table style="border-collapse:collapse"><tr><th align="right" style="padding:4px 12px">מוצר</th><th align="right" style="padding:4px 12px">כמות</th><th align="right" style="padding:4px 12px">מחיר</th><th align="right" style="padding:4px 12px">סה"כ</th></tr>${rows}</table>
          <p style="font-size:16px"><b>סה"כ הזמנה: ₪${orderTotal.toLocaleString("he-IL")}</b></p>
          ${notes ? `<p><b>הערות:</b> ${notes}</p>` : ""}
        </div>`,
    });
  }

  refresh();
  return { success: true };
}
