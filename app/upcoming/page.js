import { redirect } from "next/navigation";
import { and, eq, gt, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, clients } from "@/lib/schema";
import { formatDateHindi, todayIST } from "@/lib/dates";
import { waReminderLink } from "@/lib/whatsapp";

export default async function UpcomingPage() {
  // सुरक्षा
  const session = await getSession();
  if (!session) redirect("/");

  const today = todayIST();

  // आज के बाद की active पेशियाँ, तारीख़ के क्रम में
  const rows = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      courtName: cases.courtName,
      stage: cases.stage,
      nextHearingDate: cases.nextHearingDate,
      clientName: clients.name,
      clientPhone: clients.phone,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(
      and(
        eq(cases.userId, session.id),
        eq(cases.status, "active"),
        gt(cases.nextHearingDate, today)
      )
    )
    .orderBy(asc(cases.nextHearingDate));

  // तारीख़ के हिसाब से समूह बनाओ (rows पहले से क्रम में)
  const groups = [];
  for (const c of rows) {
    let g = groups.find((x) => x.date === c.nextHearingDate);
    if (!g) {
      g = { date: c.nextHearingDate, items: [] };
      groups.push(g);
    }
    g.items.push(c);
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <a href="/dashboard" className="text-sm text-slate-500 active:text-slate-800">
          ← वापस
        </a>
        <p className="text-base font-bold text-slate-800">आने वाली पेशियाँ</p>
        <span className="w-10" />
      </header>

      <section className="px-4 pt-4">
        {groups.length === 0 ? (
          <p className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            आगे कोई पेशी नहीं।
          </p>
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.date}>
                <h2 className="mb-2 text-sm font-bold text-slate-700">
                  {formatDateHindi(g.date)}
                  <span className="ml-1 font-normal text-slate-400">({g.items.length})</span>
                </h2>
                <ul className="space-y-3">
                  {g.items.map((c) => (
                    <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <a href={`/cases/${c.id}`} className="block">
                        <p className="text-base font-semibold text-slate-800">{c.clientName}</p>
                        <p className="mt-0.5 text-sm text-slate-600">
                          केस {c.caseNumber}
                          {c.courtName ? ` • ${c.courtName}` : ""}
                        </p>
                        {c.stage && <p className="mt-0.5 text-sm text-slate-500">{c.stage}</p>}
                      </a>

                      {c.clientPhone && (
                        
                          href={waReminderLink(c.clientPhone, c.caseNumber, formatDateHindi(g.date), c.courtName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition active:scale-[0.98]"
                        >
                          रिमाइंडर भेजें
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}