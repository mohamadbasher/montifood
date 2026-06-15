"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, requireOwner, hashPassword, PERMISSIONS } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

export type FormResult = { error?: string; success?: string };

// A long random token for magic-link login.
function genLoginToken(): string {
  return randomBytes(24).toString("hex");
}

export async function createRestaurant(
  _prev: FormResult,
  formData: FormData
): Promise<FormResult> {
  await requirePermission("restaurants.create");

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const customerNumber = String(formData.get("customerNumber") ?? "").trim() || null;
  const contactName = String(formData.get("contactName") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const cityId = parseInt(String(formData.get("cityId") ?? ""));

  if (!username || !password || !name || !cityId) {
    return { error: "נא למלא שם משתמש, סיסמה, שם מסעדה ועיר" };
  }
  if (password.length < 4) {
    return { error: "הסיסמה חייבת להיות באורך 4 תווים לפחות" };
  }

  // The chosen city determines the area (region) + delivery day.
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) return { error: "העיר שנבחרה לא נמצאה" };

  const exists = await prisma.restaurant.findUnique({ where: { username } });
  if (exists) return { error: "שם המשתמש כבר קיים" };

  await prisma.restaurant.create({
    data: {
      username,
      passwordHash: await hashPassword(password),
      loginToken: genLoginToken(),
      name,
      customerNumber,
      city: city.name,
      contactName,
      phone,
      regionId: city.regionId,
    },
  });

  revalidatePath("/admin/restaurants");
  return { success: `המסעדה "${name}" נוספה בהצלחה` };
}

export async function createRegion(
  _prev: FormResult,
  formData: FormData
): Promise<FormResult> {
  await requirePermission("regions.manage");

  const name = String(formData.get("name") ?? "").trim();
  const weekday = parseInt(String(formData.get("weekday") ?? ""));

  if (!name || Number.isNaN(weekday)) {
    return { error: "נא למלא שם אזור ויום אספקה" };
  }

  const exists = await prisma.region.findUnique({ where: { name } });
  if (exists) return { error: "אזור בשם זה כבר קיים" };

  await prisma.region.create({ data: { name, weekday } });
  revalidatePath("/admin/regions");
  return { success: `האזור "${name}" נוסף בהצלחה` };
}

export async function updateRegion(formData: FormData) {
  await requirePermission("regions.manage");
  const id = parseInt(String(formData.get("id") ?? ""));
  const name = String(formData.get("name") ?? "").trim();
  const weekday = parseInt(String(formData.get("weekday") ?? ""));
  if (!id || !name || Number.isNaN(weekday)) return;
  await prisma.region.update({ where: { id }, data: { name, weekday } }).catch(() => {});
  revalidatePath("/admin/regions");
}

// Bulk-set the catalog (which products + prices) for many restaurants at once.
// Included products are upserted with the given price; unchecked products are removed
// from the selected restaurants (so they see exactly the chosen products).
export async function bulkSetCatalog(
  _prev: FormResult,
  formData: FormData
): Promise<FormResult> {
  await requirePermission("restaurants.prices");
  const restaurantIds = formData
    .getAll("rid")
    .map((x) => parseInt(String(x)))
    .filter(Boolean);
  const includedProductIds = new Set(
    formData.getAll("includedProduct").map((x) => parseInt(String(x)))
  );
  if (restaurantIds.length === 0) return { error: "לא נבחרו מסעדות" };
  if (includedProductIds.size === 0) return { error: "לא נבחרו מוצרים" };

  const products = await prisma.product.findMany({ where: { active: true } });
  const priceById = new Map<number, number>();
  for (const p of products) {
    if (includedProductIds.has(p.id)) {
      priceById.set(p.id, parseFloat(String(formData.get(`price_${p.id}`) ?? "0")) || 0);
    }
  }

  for (const rid of restaurantIds) {
    for (const p of products) {
      if (priceById.has(p.id)) {
        await prisma.restaurantProduct.upsert({
          where: { restaurantId_productId: { restaurantId: rid, productId: p.id } },
          update: { price: priceById.get(p.id) },
          create: { restaurantId: rid, productId: p.id, price: priceById.get(p.id)! },
        });
      } else {
        await prisma.restaurantProduct.deleteMany({
          where: { restaurantId: rid, productId: p.id },
        });
      }
    }
  }
  revalidatePath("/admin/restaurants");
  return { success: `עודכנו ${restaurantIds.length} מסעדות` };
}

// Add a city to an area. (Used as a plain form action, so returns void.)
export async function addCity(formData: FormData) {
  await requirePermission("regions.manage");
  const regionId = parseInt(String(formData.get("regionId") ?? ""));
  const name = String(formData.get("name") ?? "").trim();
  if (!regionId || !name) return;
  const exists = await prisma.city.findUnique({ where: { name } });
  if (exists) return; // city already exists somewhere — ignore
  await prisma.city.create({ data: { name, regionId } });
  revalidatePath("/admin/regions");
}

export async function removeCity(formData: FormData) {
  await requirePermission("regions.manage");
  const id = parseInt(String(formData.get("id") ?? ""));
  if (!id) return;
  await prisma.city.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/regions");
}

export async function deleteRegion(formData: FormData) {
  await requirePermission("regions.manage");
  const id = parseInt(String(formData.get("id") ?? ""));
  if (!id) return;
  // Only delete if nothing references this region.
  const counts = await prisma.region.findUnique({
    where: { id },
    include: { _count: { select: { restaurants: true, orders: true } } },
  });
  if (counts && counts._count.restaurants === 0 && counts._count.orders === 0) {
    await prisma.region.delete({ where: { id } }).catch(() => {});
  }
  revalidatePath("/admin/regions");
}

// Permanently delete an order. Reverses its debt if it was already applied.
export async function deleteOrder(formData: FormData) {
  await requirePermission("orders.delete");
  const id = parseInt(String(formData.get("id") ?? ""));
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return;

  const total = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
  await prisma.$transaction(async (tx) => {
    if (order.balanceApplied) {
      await tx.restaurant.update({
        where: { id: order.restaurantId },
        data: { balance: { decrement: total } },
      });
    }
    await tx.order.delete({ where: { id } });
  });
  revalidatePath("/admin");
  revalidatePath("/admin/delivered");
  revalidatePath("/admin/archive");
}

export async function archiveOrder(formData: FormData) {
  await requirePermission("orders.archive");
  const id = parseInt(String(formData.get("id") ?? ""));
  if (!id) return;
  await prisma.order.update({ where: { id }, data: { archived: true } }).catch(() => {});
  revalidatePath("/admin");
  revalidatePath("/admin/delivered");
  revalidatePath("/admin/archive");
}

export async function unarchiveOrder(formData: FormData) {
  await requirePermission("orders.archive");
  const id = parseInt(String(formData.get("id") ?? ""));
  if (!id) return;
  await prisma.order.update({ where: { id }, data: { archived: false } }).catch(() => {});
  revalidatePath("/admin");
  revalidatePath("/admin/delivered");
  revalidatePath("/admin/archive");
}

export async function updateOrderStatus(formData: FormData) {
  await requirePermission("orders.status");
  const orderId = parseInt(String(formData.get("orderId") ?? ""));
  const status = String(formData.get("status") ?? "");
  if (!orderId || !["NEW", "CONFIRMED", "DELIVERED", "CANCELLED"].includes(status)) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const total = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const shouldApply = status === "DELIVERED";

  // Add the order total to the restaurant's debt when delivered;
  // reverse it if the order moves away from "delivered". Never double-counts.
  await prisma.$transaction(async (tx) => {
    if (shouldApply && !order.balanceApplied) {
      await tx.restaurant.update({
        where: { id: order.restaurantId },
        data: { balance: { increment: total } },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status, balanceApplied: true },
      });
    } else if (!shouldApply && order.balanceApplied) {
      await tx.restaurant.update({
        where: { id: order.restaurantId },
        data: { balance: { decrement: total } },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status, balanceApplied: false },
      });
    } else {
      await tx.order.update({ where: { id: orderId }, data: { status } });
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/delivered");
  revalidatePath("/admin/restaurants");
}

export async function updateRestaurantDetails(
  _prev: FormResult,
  formData: FormData
): Promise<FormResult> {
  await requirePermission("restaurants.edit");
  const id = parseInt(String(formData.get("id") ?? ""));
  const name = String(formData.get("name") ?? "").trim();
  const customerNumber = String(formData.get("customerNumber") ?? "").trim() || null;
  const contactName = String(formData.get("contactName") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const cityId = parseInt(String(formData.get("cityId") ?? ""));

  if (!id || !name || !cityId) {
    return { error: "נא למלא שם מסעדה ועיר" };
  }

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) return { error: "העיר שנבחרה לא נמצאה" };

  await prisma.restaurant.update({
    where: { id },
    data: { name, customerNumber, contactName, phone, city: city.name, regionId: city.regionId },
  });
  revalidatePath(`/admin/restaurants/${id}`);
  revalidatePath("/admin/restaurants");
  return { success: "הפרטים עודכנו" };
}

export async function resetRestaurantPassword(
  _prev: FormResult,
  formData: FormData
): Promise<FormResult> {
  await requirePermission("restaurants.password");
  const id = parseInt(String(formData.get("id") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!id || password.length < 4) {
    return { error: "סיסמה חדשה חייבת להיות באורך 4 תווים לפחות" };
  }
  await prisma.restaurant.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) },
  });
  return { success: "הסיסמה עודכנה" };
}

export async function updateBalance(formData: FormData) {
  await requirePermission("restaurants.balance");
  const id = parseInt(String(formData.get("id") ?? ""));
  const balance = parseFloat(String(formData.get("balance") ?? ""));
  if (id && !Number.isNaN(balance)) {
    await prisma.restaurant.update({ where: { id }, data: { balance } });
    revalidatePath("/admin/restaurants");
  }
}

// Add a product to a restaurant's catalog, or update its price.
export async function setRestaurantProduct(formData: FormData) {
  await requirePermission("restaurants.prices");
  const restaurantId = parseInt(String(formData.get("restaurantId") ?? ""));
  const productId = parseInt(String(formData.get("productId") ?? ""));
  const price = parseFloat(String(formData.get("price") ?? "0")) || 0;
  if (!restaurantId || !productId) return;

  await prisma.restaurantProduct.upsert({
    where: { restaurantId_productId: { restaurantId, productId } },
    update: { price },
    create: { restaurantId, productId, price },
  });
  revalidatePath(`/admin/restaurants/${restaurantId}`);
}

// Remove a product from a restaurant's catalog.
export async function removeRestaurantProduct(formData: FormData) {
  await requirePermission("restaurants.prices");
  const restaurantId = parseInt(String(formData.get("restaurantId") ?? ""));
  const productId = parseInt(String(formData.get("productId") ?? ""));
  if (!restaurantId || !productId) return;

  await prisma.restaurantProduct
    .delete({ where: { restaurantId_productId: { restaurantId, productId } } })
    .catch(() => {});
  revalidatePath(`/admin/restaurants/${restaurantId}`);
}

// Record a payment receipt and reduce the restaurant's debt by the amount.
export async function addReceipt(
  _prev: FormResult,
  formData: FormData
): Promise<FormResult> {
  await requirePermission("restaurants.balance");
  const restaurantId = parseInt(String(formData.get("restaurantId") ?? ""));
  const receiptNumber = String(formData.get("receiptNumber") ?? "").trim();
  const amount = parseFloat(String(formData.get("amount") ?? ""));
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!restaurantId || !receiptNumber || Number.isNaN(amount) || amount <= 0) {
    return { error: "נא למלא מספר קבלה וסכום תקין" };
  }

  await prisma.$transaction([
    prisma.receipt.create({
      data: { restaurantId, receiptNumber, amount, note },
    }),
    prisma.restaurant.update({
      where: { id: restaurantId },
      data: { balance: { decrement: amount } },
    }),
  ]);

  revalidatePath(`/admin/restaurants/${restaurantId}`);
  revalidatePath("/admin/restaurants");
  return { success: `קבלה ${receiptNumber} נרשמה (₪${amount.toLocaleString("he-IL")})` };
}

// Delete a receipt and add its amount back to the restaurant's debt.
export async function deleteReceipt(formData: FormData) {
  await requirePermission("restaurants.balance");
  const id = parseInt(String(formData.get("id") ?? ""));
  const receipt = await prisma.receipt.findUnique({ where: { id } });
  if (!receipt) return;

  await prisma.$transaction([
    prisma.receipt.delete({ where: { id } }),
    prisma.restaurant.update({
      where: { id: receipt.restaurantId },
      data: { balance: { increment: receipt.amount } },
    }),
  ]);

  revalidatePath(`/admin/restaurants/${receipt.restaurantId}`);
  revalidatePath("/admin/restaurants");
}

// Generate a fresh magic-link token (invalidates the old link).
export async function regenerateLoginToken(formData: FormData) {
  await requirePermission("restaurants.password");
  const id = parseInt(String(formData.get("id") ?? ""));
  if (!id) return;
  await prisma.restaurant.update({ where: { id }, data: { loginToken: genLoginToken() } });
  revalidatePath(`/admin/restaurants/${id}`);
}

// Permanently delete a restaurant and all its data (orders, catalog, receipts).
export async function deleteRestaurant(formData: FormData) {
  await requirePermission("restaurants.delete");
  const id = parseInt(String(formData.get("id") ?? ""));
  if (!id) return;
  // Orders aren't set to cascade, so remove them first (their items cascade).
  // RestaurantProduct + Receipt cascade automatically with the restaurant.
  await prisma.$transaction([
    prisma.order.deleteMany({ where: { restaurantId: id } }),
    prisma.restaurant.delete({ where: { id } }),
  ]);
  revalidatePath("/admin/restaurants");
  redirect("/admin/restaurants");
}

export async function toggleRestaurant(formData: FormData) {
  await requirePermission("restaurants.edit");
  const id = parseInt(String(formData.get("id") ?? ""));
  const r = await prisma.restaurant.findUnique({ where: { id } });
  if (r) {
    await prisma.restaurant.update({ where: { id }, data: { active: !r.active } });
    revalidatePath("/admin/restaurants");
  }
}

// ---- Team / managers (owner only) ----

function cleanPermissions(values: string[]): string {
  return values.filter((v) => (PERMISSIONS as readonly string[]).includes(v)).join(",");
}

export async function createManager(
  _prev: FormResult,
  formData: FormData
): Promise<FormResult> {
  await requireOwner();
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const permissions = cleanPermissions(formData.getAll("perm").map(String));

  if (!name || !username || !password) {
    return { error: "נא למלא שם, שם משתמש וסיסמה" };
  }
  if (password.length < 4) {
    return { error: "הסיסמה חייבת להיות באורך 4 תווים לפחות" };
  }
  const [mExists, rExists, aExists] = await Promise.all([
    prisma.manager.findUnique({ where: { username } }),
    prisma.restaurant.findUnique({ where: { username } }),
    prisma.admin.findUnique({ where: { username } }),
  ]);
  if (mExists || rExists || aExists) return { error: "שם המשתמש כבר קיים" };

  await prisma.manager.create({
    data: { name, username, passwordHash: await hashPassword(password), permissions },
  });
  revalidatePath("/admin/team");
  return { success: `המשתמש "${name}" נוצר` };
}

export async function updateManager(formData: FormData) {
  await requireOwner();
  const id = parseInt(String(formData.get("id") ?? ""));
  if (!id) return;
  const permissions = cleanPermissions(formData.getAll("perm").map(String));
  const active = formData.get("active") != null;
  await prisma.manager.update({ where: { id }, data: { permissions, active } });
  revalidatePath("/admin/team");
}

export async function resetManagerPassword(formData: FormData) {
  await requireOwner();
  const id = parseInt(String(formData.get("id") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!id || password.length < 4) return;
  await prisma.manager.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) },
  });
  revalidatePath("/admin/team");
}

export async function deleteManager(formData: FormData) {
  await requireOwner();
  const id = parseInt(String(formData.get("id") ?? ""));
  if (!id) return;
  await prisma.manager.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/team");
}
