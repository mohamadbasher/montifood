import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const map = [
  { match: "18", url: "/product-hilal-18.png" },
  { match: "בארכב", url: "/product-barkav-17.png" },
  { match: "3 ", url: "/product-hilal-3.png" },
];

const products = await prisma.product.findMany();
for (const prod of products) {
  const hit = map.find((m) => prod.name.includes(m.match));
  if (hit) {
    await prisma.product.update({ where: { id: prod.id }, data: { imageUrl: hit.url } });
    console.log("✓", prod.name, "->", hit.url);
  }
}
await prisma.$disconnect();
