import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession, type SessionData } from "@/lib/session";
import { redirect } from "next/navigation";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Attempt to log in with a username + password.
// Checks the Admin table first, then the Restaurant table.
// Returns the session payload on success, or null on failure.
export async function authenticate(
  username: string,
  password: string
): Promise<SessionData | null> {
  const uname = username.trim();

  const admin = await prisma.admin.findUnique({ where: { username: uname } });
  if (admin && (await verifyPassword(password, admin.passwordHash))) {
    return { userId: admin.id, role: "ADMIN", username: admin.username, displayName: "MontiFood" };
  }

  const manager = await prisma.manager.findUnique({ where: { username: uname } });
  if (manager && manager.active && (await verifyPassword(password, manager.passwordHash))) {
    return {
      userId: manager.id,
      role: "MANAGER",
      username: manager.username,
      displayName: manager.name,
      permissions: manager.permissions.split(",").filter(Boolean),
    };
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { username: uname } });
  if (
    restaurant &&
    restaurant.active &&
    (await verifyPassword(password, restaurant.passwordHash))
  ) {
    return {
      userId: restaurant.id,
      role: "RESTAURANT",
      username: restaurant.username,
      displayName: restaurant.name,
    };
  }

  return null;
}

import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  hasPerm,
  hasArea,
} from "@/lib/permissions";

export { PERMISSIONS };
export type Permission = string;

export type Staff = {
  ok: boolean;
  isOwner: boolean;
  userId?: number;
  displayName?: string;
  perms: string[];
};

// Resolve the current staff member (owner or manager), loading manager
// permissions FRESH from the DB so changes/deactivation take effect immediately.
export async function getStaff(): Promise<Staff> {
  const session = await getSession();
  if (session.role === "ADMIN") {
    return {
      ok: true,
      isOwner: true,
      userId: session.userId,
      displayName: session.displayName,
      perms: [...PERMISSIONS],
    };
  }
  if (session.role === "MANAGER" && session.userId) {
    const m = await prisma.manager.findUnique({ where: { id: session.userId } });
    if (m && m.active) {
      return {
        ok: true,
        isOwner: false,
        userId: m.id,
        displayName: m.name,
        perms: m.permissions.split(",").filter(Boolean),
      };
    }
  }
  return { ok: false, isOwner: false, perms: [] };
}

export function can(staff: Staff, perm: Permission): boolean {
  return hasPerm(staff.perms, staff.isOwner, perm);
}

export function canArea(staff: Staff, area: string): boolean {
  return hasArea(staff.perms, staff.isOwner, area);
}

export function firstAllowedAdminPath(staff: Staff): string {
  for (const g of PERMISSION_GROUPS) {
    if (canArea(staff, g.area)) return g.path;
  }
  return "/admin/no-access";
}

// Guards for use at the top of protected pages/actions.
export async function requireStaff(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff.ok) redirect("/login");
  return staff;
}

export async function requirePermission(perm: Permission): Promise<Staff> {
  const staff = await requireStaff();
  if (!can(staff, perm)) redirect(firstAllowedAdminPath(staff));
  return staff;
}

// Allow access to an area if the user has any permission within it.
export async function requireArea(area: string): Promise<Staff> {
  const staff = await requireStaff();
  if (!canArea(staff, area)) redirect(firstAllowedAdminPath(staff));
  return staff;
}

export async function requireOwner(): Promise<Staff> {
  const staff = await requireStaff();
  if (!staff.isOwner) redirect(firstAllowedAdminPath(staff));
  return staff;
}

// Kept for compatibility: allow any staff (owner or manager).
export async function requireAdmin() {
  return requireStaff();
}

export async function requireRestaurant() {
  const session = await getSession();
  if (session.role !== "RESTAURANT" || !session.userId) redirect("/login");
  return session;
}
