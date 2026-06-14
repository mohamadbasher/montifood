// Plain helpers (no server-only) — usable from both server and client components.

// Normalize an Israeli phone number to international digits for wa.me (e.g. 0501234567 -> 972501234567).
export function normalizeIlPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("972")) return d;
  if (d.startsWith("0")) return "972" + d.slice(1);
  if (d.length === 9) return "972" + d; // number given without leading 0
  return d;
}

// Build a click-to-send WhatsApp link with a pre-filled message, or null if no valid phone.
export function waLink(phone: string | null | undefined, text: string): string | null {
  const p = normalizeIlPhone(phone);
  if (!p) return null;
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}
