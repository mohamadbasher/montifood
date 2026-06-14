import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getStaff, firstAllowedAdminPath } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  if (session.role === "RESTAURANT") redirect("/order");
  if (session.role === "ADMIN" || session.role === "MANAGER") {
    const staff = await getStaff();
    if (staff.ok) redirect(firstAllowedAdminPath(staff));
  }
  redirect("/login");
}
