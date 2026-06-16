import { redirect } from "next/navigation";
import { and, eq, lt, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, clients } from "@/lib/schema";
import { todayIST, formatDateHindi } from "@/lib/dates";
import { waReminderLink } from "@/lib/whatsapp";

export default async function DashboardPage() {
  // सुरक्षा — session न हो तो login पर वापस
  const session = await getSession();
  if (!session) redirect("/");

  const today = todayIST();

  // आज की पेशी वाले active केस, मुवक्किल के नाम/फ़ोन सहित
  const rows = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      courtName: cases.courtName,
      stage: cases.stage,
      clientName: clients.name,
      clientPhone: clients.phone,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(
      and(
        eq(cases.userId, session.id),
        eq(cases.status, "active"),
        eq(cases.nextHearingDate, today),
      ),
    );

  // छूटी पेशी — active, पर अगली तारीख़ आज से पहले की (अपडेट होनी बाक़ी)
  const overdueRows = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      courtName: cases.courtName,
      clientName: clients.name,
      nextHearingDate: cases.nextHearingDate,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(
      and(
        eq(cases.userId, session.id),
        eq(cases.status, "active"),
        lt(cases.nextHearingDate, today),
      ),
    )
    .orderBy(asc(cases.nextHearingDate));
  const todayHindi = formatDateHindi(today);

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* header — चौकी का नाम + logout */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-base font-bold text-slate-800">
            {process.env.NEXT_PUBLIC_CHOWKI_NAME}
          </p>
          <p className="text-xs text-slate-500">{todayHindi}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/help"
            className="text-sm text-slate-500 active:text-slate-800"
          >
            सहायता
          </a>
          <a
            href="/api/auth/logout"
            className="text-sm text-slate-500 active:text-slate-800"
          >
            लॉगआउट
          </a>
        </div>
      </header>

      {/* त्वरित बटन */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <a
          href="/cases/new"
          className="rounded-xl bg-slate-800 px-4 py-4 text-center text-base font-medium text-white transition active:scale-[0.98]"
        >
          नया केस जोड़ें
        </a>
        <a
          href="/cases"
          className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-base font-medium text-slate-800 transition active:scale-[0.98]"
        >
          सभी केस
        </a>
      </div>
      <a
        href="/upcoming"
        className="mx-4 mt-3 block rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-base font-medium text-slate-800 transition active:scale-[0.98]"
      >
        आने वाली पेशियाँ
      </a>
      <a
        href="/research"
        className="mx-4 mt-3 block rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-base font-medium text-slate-800 transition active:scale-[0.98]"
      >
        केस लॉ खोज
      </a>

      <a
        href="/draft"
        className="mx-4 mt-3 block rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-base font-medium text-slate-800 transition active:scale-[0.98]"
      >
        मसौदा बनाएँ
      </a>

      {/* छूटी पेशी — सबसे ऊपर, लाल */}
      {overdueRows.length > 0 && (
        <section className="px-4 pt-6">
          <h2 className="text-lg font-bold text-red-700">
            छूटी पेशी <span className="text-red-400">({overdueRows.length})</span>
          </h2>
          <ul className="mt-4 space-y-3">
            {overdueRows.map((c) => (
              <li key={c.id}>
                
                  href={`/cases/${c.id}`}
                  className="block rounded-xl border border-red-200 bg-red-50 p-4 transition active:scale-[0.99]"
                >
                  <p className="text-base font-semibold text-slate-800">
                    {c.clientName}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    केस {c.caseNumber}
                    {c.courtName ? ` • ${c.courtName}` : ""}
                  </p>
                  <p className="mt-1 text-sm font-medium text-red-700">
                    बीती तारीख़: {formatDateHindi(c.nextHearingDate)} — खोलकर नई तारीख़ डालें
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* आज की पेशी */}
      <section className="px-4 pt-6">
        <h2 className="text-lg font-bold text-slate-800">
          आज की पेशी{" "}
          {rows.length > 0 && (
            <span className="text-slate-400">({rows.length})</span>
          )}
        </h2>

        {rows.length === 0 ? (
          <p className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            आज कोई पेशी नहीं।
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
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

                {c.clientPhone ? (
                  <a
                    href={waReminderLink(
                      c.clientPhone,
                      c.caseNumber,
                      todayHindi,
                      c.courtName,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition active:scale-[0.98]"
                  >
                    रिमाइंडर भेजें
                  </a>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">
                    फ़ोन नंबर नहीं — रिमाइंडर नहीं भेज सकते
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
