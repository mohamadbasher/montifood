import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Magic-link login: GET /enter/<token> logs the restaurant in and sends them to /order.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const restaurant = token
    ? await prisma.restaurant.findUnique({ where: { loginToken: token } })
    : null;

  if (!restaurant || !restaurant.active) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await getSession();
  session.userId = restaurant.id;
  session.role = "RESTAURANT";
  session.username = restaurant.username;
  session.displayName = restaurant.name;
  await session.save();

  return NextResponse.redirect(new URL("/order", request.url));
}
