"use client";

import { useState, useEffect } from "react";
import { waLink } from "@/lib/whatsapp";

export default function LoginLink({
  token,
  name,
  phone,
}: {
  token: string | null;
  name: string;
  phone: string | null;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!token) {
    return <p className="text-sm text-muted">אין קישור כניסה. לחצו &quot;יצירת קישור חדש&quot;.</p>;
  }

  const url = `${origin}/enter/${token}`;
  const waMessage = `שלום ${name}, זהו קישור הכניסה האישי שלך למערכת ההזמנות של MontiFood. לחיצה עליו תכניס אותך ישירות:\n${url}`;
  const wa = waLink(phone, waMessage);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={url}
          dir="ltr"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={copy}
          className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          {copied ? "הועתק ✓" : "העתקה"}
        </button>
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            שליחה בוואטסאפ
          </a>
        )}
      </div>
      <p className="text-xs text-muted">
        כל מי שמחזיק בקישור יוכל להיכנס לחשבון זה. ליצירת קישור חדש (שיבטל את הישן) השתמשו בכפתור למטה.
      </p>
    </div>
  );
}
