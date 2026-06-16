"use client";

import { useState } from "react";
import { formatDateHindi } from "@/lib/dates";

export default function CasesList({ cases, today }) {
  const [query, setQuery] = useState("");

  // बिना तारीख़ वाले केस सबसे नीचे, बाक़ी अगली पेशी के क्रम में
  const sorted = [...cases].sort((a, b) => {
    if (!a.nextHearingDate && !b.nextHearingDate) return 0;
    if (!a.nextHearingDate) return 1;
    if (!b.nextHearingDate) return -1;
    return a.nextHearingDate < b.nextHearingDate ? -1 : 1;
  });

  // नाम या केस नंबर से फ़िल्टर
  const q = query.trim().toLowerCase();
  const filtered = q
    ? sorted.filter(
        (c) =>
          (c.clientName || "").toLowerCase().includes(q) ||
          (c.caseNumber || "").toLowerCase().includes(q),
      )
    : sorted;

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder="नाम या केस नंबर से खोजें"
        className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-800 focus:border-slate-500 focus:outline-none"
      />

      {filtered.length === 0 ? (
        <p className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
          कोई मेल नहीं मिला।
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => {
            const overdue = c.nextHearingDate && c.nextHearingDate < today;
            const isToday = c.nextHearingDate === today;
            return (
              <li key={c.id}>
                
                  href={`/cases/${c.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-800">
                        {c.clientName}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        केस {c.caseNumber}
                        {c.courtName ? ` • ${c.courtName}` : ""}
                      </p>
                      {c.stage && (
                        <p className="mt-0.5 text-sm text-slate-500">{c.stage}</p>
                      )}
                    </div>
                    {c.nextHearingDate && (
                      <span
                        className={
                          "shrink-0 rounded-lg px-2 py-1 text-xs font-medium " +
                          (isToday
                            ? "bg-green-100 text-green-700"
                            : overdue
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600")
                        }
                      >
                        {formatDateHindi(c.nextHearingDate)}
                      </span>
                    )}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}