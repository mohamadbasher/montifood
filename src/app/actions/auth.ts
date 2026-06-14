"use server";

import { authenticate, firstAllowedAdminPath } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "נא למלא שם משתמש וסיסמה" };
  }

  const data = await authenticate(username, password);
  if (!data) {
    return { error: "שם משתמש או סיסמה שגויים" };
  }

  const session = await getSession();
  session.userId = data.userId;
  session.role = data.role;
  session.username = data.username;
  session.displayName = data.displayName;
  session.permissions = data.permissions;
  await session.save();

  if (data.role === "RESTAURANT") redirect("/order");
  if (data.role === "ADMIN") redirect("/admin");
  // Manager: send to the first section they're allowed to use.
  redirect(
    firstAllowedAdminPath({
      ok: true,
      isOwner: false,
      perms: data.permissions ?? [],
    })
  );
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
