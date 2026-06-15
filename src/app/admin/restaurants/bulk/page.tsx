import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hebrewWeekday } from "@/lib/dates";
import { requirePermission } from "@/lib/auth";
import BulkCatalog from "./BulkCatalog";

export default async function BulkCatalogPage() {
  await requirePermission("restaurants.prices");

  const [regions, products, restaurants] = await Promise.all([
    prisma.region.findMany({ where: { active: true }, orderBy: { weekday: "asc" } }),
    prisma.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.restaurant.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { region: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/restaurants" className="text-sm text-muted hover:text-brand">
          ← חזרה לרשימת המסעדות
        </Link>
        <h1 className="mt-2 text-2xl font-bold">ניהול מוצרים ומחירים למספר מסעדות</h1>
        <p className="text-sm text-muted">
          בחר מוצרים ומחירים, סנן לפי אזור ובחר מסעדות (או הכל) — והחל על כולן בבת אחת.
        </p>
      </div>

      <BulkCatalog
        regions={regions.map((r) => ({ id: r.id, name: `${r.name} (יום ${hebrewWeekday(r.weekday)})` }))}
        products={products.map((p) => ({ id: p.id, name: p.name, imageUrl: p.imageUrl }))}
        restaurants={restaurants.map((r) => ({
          id: r.id,
          name: r.name,
          city: r.city,
          regionId: r.regionId,
          regionName: r.region.name,
        }))}
      />
    </div>
  );
}
