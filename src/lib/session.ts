import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type Role = "ADMIN" | "MANAGER" | "RESTAURANT";

export interface SessionData {
  userId?: number;
  role?: Role;
  username?: string;
  displayName?: string;
  permissions?: string[];
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "dev_only_change_me_to_a_long_random_string_32+",
  cookieName: "montifood_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
