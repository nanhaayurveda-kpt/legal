import { redirect } from "next/navigation";
import { and, eq, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, clients } from "@/lib/schema";
import { formatDateHindi, todayIST } from "@/lib/dates";

export default async function CasesPage() {
  // सुरक्षा — session न हो तो login पर वापस
  const session = await getSession();
  if (!session) redirect("/");

  // चौकी के सभी active केस, मुवक्किल सहित, अगली पेशी के क्रम में
  const rows = await db
    .select({
      id: cases.id,
      caseNumber: cases.caseNumber,
      courtName: cases.courtName,
      stage: cases.stage,
      nextHearingDate: cases.nextHearingDate,
      clientName: clients.name,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .where(and(eq(cases.userId, session.id), eq(cases.status, "active")))
    .orderBy(asc(cases.nextHearingDate));

  const today = todayIST();

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* header — वापस + नया केस */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <a href="/dashboard" className="text-sm text-slate-500 active:text-slate-800">
          ← वापस
        </a>
        <p className="text-base font-bold text-slate-800">सभी केस</p>
        <a href="/cases/new" className="text-sm font-medium text-slate-800">
          + नया
        </a>
      </header>

      <section className="px-4 pt-4">
        {rows.length === 0 ? (
          <p className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            अभी कोई केस नहीं। ऊपर “+ नया” से जोड़ें।
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((c) => {
              const overdue = c.nextHearingDate && c.nextHearingDate < today;
              const isToday = c.nextHearingDate === today;
              return (
                <li key={c.id}>
                  <a
                    href={`/cases/${c.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 transition active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-800">{c.clientName}</p>
                        <p className="mt-0.5 text-sm text-slate-600">
                          केस {c.caseNumber}
                          {c.courtName ? ` • ${c.courtName}` : ""}
                        </p>
                        {c.stage && <p className="mt-0.5 text-sm text-slate-500">{c.stage}</p>}
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
      </section>
    </main>
  );
}