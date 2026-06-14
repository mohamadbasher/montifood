"use client";

import { useState, useMemo } from "react";
import { waLink } from "@/lib/whatsapp";

type Region = { id: number; name: string };
type Row = {
  id: number;
  name: string;
  phone: string | null;
  regionId: number;
  regionName: string;
};

const TEMPLATES: { label: string; text: string }[] = [
  {
    label: "תזכורת הזמנה",
    text: "שלום, כאן MontiFood 👋\nמשלוח יגיע לאזורכם בקרוב — נא לבצע הזמנה דרך האתר. תודה!",
  },
  {
    label: "מבצע / הנחה",
    text: "שלום, כאן MontiFood 🎉\nמבצע מיוחד החודש על הטחינה שלנו! פרטים בהזמנה הבאה.",
  },
  {
    label: "עדכון מחירון",
    text: "שלום, כאן MontiFood.\nשימו לב לעדכון מחירים שייכנס לתוקף בקרוב. לפרטים נא ליצור קשר.",
  },
];

export default function BroadcastTool({
  restaurants,
  regions,
}: {
  restaurants: Row[];
  regions: Region[];
}) {
  const [message, setMessage] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [sent, setSent] = useState<Record<number, boolean>>({});

  const recipients = useMemo(
    () =>
      restaurants.filter((r) => !regionFilter || r.regionId === Number(regionFilter)),
    [restaurants, regionFilter]
  );

  const withPhone = recipients.filter((r) => r.phone);
  const withoutPhone = recipients.filter((r) => !r.phone);

  const field =
    "rounded-xl border border-border bg-white px-4 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-lg font-bold">הודעת וואטסאפ למסעדות</h2>
        <p className="mb-4 text-sm text-muted">
          כתבו הודעה, ולחצו על &quot;שליחה&quot; ליד כל מסעדה — וואטסאפ ייפתח עם ההודעה
          מוכנה, ואתם רק מאשרים שליחה.
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setMessage(t.text)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-brand-light"
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="כתבו כאן את ההודעה שתישלח..."
          className={`${field} w-full`}
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className={field}
          >
            <option value="">כל האזורים</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted">
            {withPhone.length} נמענים עם טלפון
            {withoutPhone.length > 0 && ` · ${withoutPhone.length} ללא טלפון`}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 font-bold">רשימת נמענים</h3>
        {recipients.length === 0 ? (
          <p className="text-sm text-muted">אין מסעדות מתאימות.</p>
        ) : (
          <div className="space-y-2">
            {withPhone.map((r) => {
              const link = message.trim() ? waLink(r.phone, message) : null;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                >
                  <div>
                    <span className="font-medium">{r.name}</span>
                    <span className="mr-2 text-sm text-muted" dir="ltr">
                      {r.phone}
                    </span>
                    <span className="text-xs text-muted">· {r.regionName}</span>
                  </div>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSent((s) => ({ ...s, [r.id]: true }))}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white ${
                        sent[r.id] ? "bg-brand-dark" : "bg-[#25D366] hover:opacity-90"
                      }`}
                    >
                      {sent[r.id] ? "✓ נשלח" : "שליחה בוואטסאפ"}
                    </a>
                  ) : (
                    <span className="text-sm text-muted">כתבו הודעה תחילה</span>
                  )}
                </div>
              );
            })}

            {withoutPhone.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border p-3 opacity-70"
              >
                <span className="font-medium">{r.name}</span>
                <span className="text-sm text-red-500">אין מספר טלפון</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
