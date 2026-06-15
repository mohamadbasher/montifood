import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Admin (the MontiFood owner) ---
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "montifood123";
  const alertEmail = process.env.ADMIN_ALERT_EMAIL ?? "owner@example.com";

  await prisma.admin.upsert({
    where: { username: adminUsername },
    update: { alertEmail },
    create: {
      username: adminUsername,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      alertEmail,
    },
  });

  // --- Regions (weekday: 0=ראשון ... 6=שבת) ---
  const regions = [
    { name: "אום אל פחם והסביבה", weekday: 0 }, // ראשון
    { name: "מרכז", weekday: 1 }, // שני
    { name: "צפון", weekday: 2 }, // שלישי
    { name: "עפולה והסביבה", weekday: 3 }, // רביעי
  ];
  for (const r of regions) {
    await prisma.region.upsert({
      where: { name: r.name },
      update: { weekday: r.weekday },
      create: r,
    });
  }

  // --- Products (the 3 tahini items) ---
  const products = [
    { name: "טחינה אלהילאל 18 ק\"ג", sortOrder: 1 },
    { name: "טחינה בארכב 17 ק\"ג", sortOrder: 2 },
    { name: "טחינה אלהילאל 3 ק\"ג", sortOrder: 3 },
  ];
  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log("Seed complete ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
