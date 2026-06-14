import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import BroadcastTool from "./BroadcastTool";

export default async function WhatsappPage() {
  await requirePermission("whatsapp.use");
  const [regions, restaurants] = await Promise.all([
    prisma.region.findMany({ where: { active: true }, orderBy: { weekday: "asc" } }),
    prisma.restaurant.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: { region: true },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">וואטסאפ</h1>
      <BroadcastTool
        regions={regions.map((r) => ({ id: r.id, name: r.name }))}
        restaurants={restaurants.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          regionId: r.regionId,
          regionName: r.region.name,
        }))}
      />
    </div>
  );
}
