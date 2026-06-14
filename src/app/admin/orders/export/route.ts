import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getStaff, can } from "@/lib/auth";
import { hebrewWeekday } from "@/lib/dates";

export async function GET(request: Request) {
  const staff = await getStaff();
  if (!staff.ok || !can(staff, "orders.export")) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date") ?? "";
  const regionId = parseInt(searchParams.get("regionId") ?? "");
  const type = searchParams.get("type") ?? "all"; // active | completed | archive | all

  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m || Number.isNaN(regionId)) {
    return new Response("נא לבחור אזור ותאריך", { status: 400 });
  }

  // Build the chosen calendar day as a [start, nextDay) range in local time.
  const [, y, mo, d] = m.map(Number);
  const start = new Date(y, mo - 1, d, 0, 0, 0, 0);
  const end = new Date(y, mo - 1, d + 1, 0, 0, 0, 0);

  // Order-type filter (matches the tabs in the orders screen).
  const typeWhere =
    type === "active"
      ? { archived: false, status: { notIn: ["DELIVERED", "CANCELLED"] } }
      : type === "completed"
        ? { archived: false, status: "DELIVERED" }
        : type === "archive"
          ? { archived: true }
          : { archived: false, status: { not: "CANCELLED" } }; // "all" = active + completed

  const orders = await prisma.order.findMany({
    where: {
      regionId,
      deliveryDate: { gte: start, lt: end },
      ...typeWhere,
    },
    orderBy: { restaurant: { name: "asc" } },
    include: { restaurant: true, items: true },
  });

  const region = await prisma.region.findUnique({ where: { id: regionId } });

  // Build the workbook.
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("הזמנות", { views: [{ rightToLeft: true }] });

  // Column widths (no auto header — we write our own title + header rows).
  const widths = [14, 24, 28, 10, 14, 14, 30];
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  // Row 1: title with area + day.
  ws.mergeCells("A1:G1");
  ws.getCell("A1").value = region
    ? `MontiFood — הזמנות לאזור ${region.name} (יום ${hebrewWeekday(region.weekday)}) · ${d}/${mo}/${y}`
    : `MontiFood — הזמנות · ${d}/${mo}/${y}`;
  ws.getCell("A1").font = { bold: true, size: 14 };
  ws.getCell("A1").alignment = { horizontal: "right" };

  // Row 2: header.
  const header = ws.addRow([
    "מספר לקוח",
    "שם מסעדה",
    "מוצר",
    "כמות",
    "מחיר ליחידה",
    'סה"כ',
    "הערות",
  ]);
  header.font = { bold: true };
  header.alignment = { horizontal: "right" };

  let grandTotal = 0;
  for (const o of orders) {
    o.items.forEach((it, idx) => {
      const lineTotal = it.quantity * it.price;
      grandTotal += lineTotal;
      ws.addRow([
        o.restaurant.customerNumber ?? "",
        o.restaurant.name,
        it.productName,
        it.quantity,
        it.price || "",
        lineTotal || "",
        idx === 0 ? (o.notes ?? "") : "",
      ]);
    });
  }

  // Summary row.
  ws.addRow([]);
  const totalRow = ws.addRow(["", "", 'סה"כ כללי', "", "", grandTotal, ""]);
  totalRow.font = { bold: true };

  const buf = await wb.xlsx.writeBuffer();
  const filename = `montifood-orders-${dateStr}-area${regionId}.xlsx`;

  return new Response(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
