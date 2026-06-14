import Link from "next/link";
import Header from "@/components/Header";
import { requireRestaurant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OrderLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRestaurant();
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.userId },
    select: { name: true },
  });

  return (
    <>
      <Header subtitle={restaurant?.name ?? undefined} />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <nav className="mb-5 flex gap-2">
          <NavLink href="/order">הזמנה חדשה</NavLink>
          <NavLink href="/order/history">ההזמנות שלי</NavLink>
        </nav>
        {children}
      </div>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-brand-light hover:text-brand-dark"
    >
      {children}
    </Link>
  );
}
