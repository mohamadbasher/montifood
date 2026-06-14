import { requireStaff } from "@/lib/auth";

export default async function NoAccessPage() {
  await requireStaff();
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <p className="text-lg font-semibold">אין לך הרשאות עדיין</p>
      <p className="mt-2 text-muted">פנה לבעל העסק כדי שיגדיר לך הרשאות גישה.</p>
    </div>
  );
}
