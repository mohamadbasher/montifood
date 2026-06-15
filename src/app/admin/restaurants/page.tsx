import { prisma } from "@/lib/prisma";
import { hebrewWeekday } from "@/lib/dates";
import { requireArea, can } from "@/lib/auth";
import RestaurantsBrowser from "./RestaurantsBrowser";

export default async function RestaurantsPage() {
  const staff = await requireArea("restaurants");
  const canCreate = can(staff, "restaurants.create");
  const canPrices = can(staff, "restaurants.prices");
  const [regions, cities, restaurants] = await Promise.all([
    prisma.region.findMany({ where: { active: true }, orderBy: { weekday: "asc" } }),
    prisma.city.findMany({ orderBy: { name: "asc" }, include: { region: true } }),
    prisma.restaurant.findMany({
      orderBy: { createdAt: "desc" },
      include: { region: true },
    }),
  ]);

  return (
    <RestaurantsBrowser
      canCreate={canCreate}
      canPrices={canPrices}
      regions={regions.map((r) => ({ id: r.id, name: r.name }))}
      cities={cities.map((c) => ({ id: c.id, name: c.name, regionName: c.region.name }))}
      restaurants={restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        username: r.username,
        customerNumber: r.customerNumber,
        city: r.city,
        contactName: r.contactName,
        phone: r.phone,
        active: r.active,
        balance: r.balance ?? 0,
        regionId: r.regionId,
        regionName: r.region.name,
        weekdayName: hebrewWeekday(r.region.weekday),
      }))}
    />
  );
}
