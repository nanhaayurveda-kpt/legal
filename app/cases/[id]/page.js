import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, clients } from "@/lib/schema";
import { formatDateHindi, todayIST } from "@/lib/dates";
import { waReminderLink } from "@/lib/whatsapp";

export default async function CaseDetailPage({ params }) {
  // सुरक्षा
  const session = await getSession();
  if (!session) redirect("/");

  const { id } = await params;
  const caseId = parseInt(id, 10);
  if (!caseId) redirect("/cases");

  // केस लाओ — सिर्फ़ अपनी चौकी का (ownership)
  const row = (
    await db
      .select({
        id: cases.id,
        caseNumber: cases.caseNumber,
        courtName: cases.courtName,
        caseType: cases.caseType,
        oppositeParty: cases.oppositeParty,
        nextHearingDate: cases.nextHearingDate,
        stage: cases.stage,
        notes: cases.notes,
        status: cases.status,
        clientName: clients.name,
        clientPhone: clients.phone,
      })
      .from(cases)
      .leftJoin(clients, eq(cases.clientId, clients.id))
      .where(and(eq(cases.id, caseId), eq(cases.userId, session.id)))
      .limit(1)
  )[0];

  if (!row) redirect("/cases");

  const dateHindi = formatDateHindi(row.nextHearingDate);
  const today = todayIST();
  const isToday = row.nextHearingDate === today;
  const overdue = row.nextHearingDate && row.nextHearingDate < today;

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <a href="/cases" className="text-sm text-slate-500 active:text-slate-800">
          ← वापस
        </a>
        <p className="text-base font-bold text-slate-800">केस ब्योरा</p>
     <a
     href={`/cases/${row.id}/edit`}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white active:scale-[0.98]"
        >
          संपादित करें
        </a>
      </header>

      <section className="px-4 pt-4">
        {/* मुवक्किल + अगली पेशी + रिमाइंडर */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-lg font-bold text-slate-800">{row.clientName}</p>
          <p className="mt-0.5 text-sm text-slate-600">
            केस {row.caseNumber}
            {row.courtName ? ` • ${row.courtName}` : ""}
          </p>

          {row.nextHearingDate && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-slate-500">अगली पेशी:</span>
              <span
                className={
                  "rounded-lg px-2 py-1 text-sm font-medium " +
                  (isToday
                    ? "bg-green-100 text-green-700"
                    : overdue
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-700")
                }
              >
                {dateHindi}
              </span>
            </div>
          )}

          {row.clientPhone && row.nextHearingDate && (
            <a
              href={waReminderLink(row.clientPhone, row.caseNumber, dateHindi, row.courtName)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition active:scale-[0.98]"
            >
              रिमाइंडर भेजें
            </a>
          )}
        </div>

        {/* बाक़ी ब्योरा */}
        <dl className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <Detail label="केस प्रकार" value={row.caseType} />
          <Detail label="चरण" value={row.stage} />
          <Detail label="विपक्षी" value={row.oppositeParty} />
          <Detail label="मुवक्किल फ़ोन" value={row.clientPhone} />
          <Detail label="स्थिति" value={row.status === "disposed" ? "निस्तारित" : "सक्रिय"} />
          <Detail label="टिप्पणी" value={row.notes} />
        </dl>
      </section>
    </main>
  );
}

// छोटा row — label + value
function Detail({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value || "—"}</dd>
    </div>
  );
}