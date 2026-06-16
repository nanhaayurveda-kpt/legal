import { redirect } from "next/navigation";
import { and, eq, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, clients } from "@/lib/schema";
import { todayIST } from "@/lib/dates";
import CasesList from "./CasesList";

export default async function CasesPage({ searchParams }) {
  // सुरक्षा — session न हो तो login पर वापस
  const session = await getSession();
  if (!session) redirect("/");

  const sp = await searchParams;
  const showDisposed = sp?.show === "disposed";

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
    .where(
      and(
        eq(cases.userId, session.id),
        eq(cases.status, showDisposed ? "disposed" : "active"),
      ),
    )
    .orderBy(asc(cases.nextHearingDate));

  const today = todayIST();

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* header — वापस + नया केस */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <a
          href="/dashboard"
          className="text-sm text-slate-500 active:text-slate-800"
        >
          ← वापस
        </a>
        <p className="text-base font-bold text-slate-800">सभी केस</p>
        <a href="/cases/new" className="text-sm font-medium text-slate-800">
          + नया
        </a>
      </header>
      {/* सक्रिय / निस्तारित टैब */}
      <div className="flex gap-2 px-4 pt-3">
        <a
          href="/cases"
          className={
            "rounded-lg px-3 py-1.5 text-sm font-medium " +
            (!showDisposed
              ? "bg-slate-800 text-white"
              : "border border-slate-200 bg-white text-slate-600")
          }
        >
          सक्रिय
        </a>
        <a
          href="/cases?show=disposed"
          className={
            "rounded-lg px-3 py-1.5 text-sm font-medium " +
            (showDisposed
              ? "bg-slate-800 text-white"
              : "border border-slate-200 bg-white text-slate-600")
          }
        >
          निस्तारित
        </a>
      </div>

      <section className="px-4 pt-4">
        {rows.length === 0 ? (
          <p className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            {showDisposed
              ? "कोई निस्तारित केस नहीं।"
              : "अभी कोई केस नहीं। ऊपर “+ नया” से जोड़ें।"}
          </p>
        ) : (
          <CasesList cases={rows} today={today} />
        )}
      </section>
    </main>
  );
}
