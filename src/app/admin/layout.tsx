import Link from "next/link";
import Header from "@/components/Header";
import { requireStaff, canArea } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaff();

  return (
    <>
      <Header subtitle={staff.isOwner ? "ניהול" : "ניהול (צוות)"} />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <nav className="mb-6 flex gap-2 overflow-x-auto">
          {canArea(staff, "orders") && <NavLink href="/admin">הזמנות</NavLink>}
          {canArea(staff, "restaurants") && <NavLink href="/admin/restaurants">מסעדות</NavLink>}
          {canArea(staff, "regions") && <NavLink href="/admin/regions">אזורים</NavLink>}
          {canArea(staff, "whatsapp") && <NavLink href="/admin/whatsapp">וואטסאפ</NavLink>}
          {staff.isOwner && <NavLink href="/admin/team">צוות</NavLink>}
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
      className="whitespace-nowrap rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-brand-light hover:text-brand-dark"
    >
      {children}
    </Link>
  );
}
