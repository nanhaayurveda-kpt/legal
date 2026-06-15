import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, clients } from "@/lib/schema";
import { updateCase } from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-800 focus:border-slate-500 focus:outline-none";

const CASE_TYPES = ["दीवानी", "फौजदारी", "राजस्व", "किराया", "अन्य"];

export default async function EditCasePage({ params, searchParams }) {
  // सुरक्षा
  const session = await getSession();
  if (!session) redirect("/");

  const { id } = await params;
  const caseId = parseInt(id, 10);
  if (!caseId) redirect("/cases");

  const sp = await searchParams;
  const showError = sp?.error === "missing";

  // केस + मुवक्किल लाओ (ownership)
  const row = (
    await db
      .select({
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

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <a href={`/cases/${caseId}`} className="text-sm text-slate-500 active:text-slate-800">
          ← वापस
        </a>
        <p className="text-base font-bold text-slate-800">केस संपादन</p>
        <span className="w-10" />
      </header>

      {showError && (
        <p className="mx-4 mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          मुवक्किल का नाम और केस नंबर ज़रूरी है।
        </p>
      )}

      <form action={updateCase} className="space-y-4 px-4 pt-4">
        <input type="hidden" name="caseId" defaultValue={caseId} />

        <div>
          <label className="text-sm font-medium text-slate-700">मुवक्किल का नाम *</label>
          <input name="clientName" type="text" required defaultValue={row.clientName || ""} className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">मुवक्किल का फ़ोन</label>
          <input name="clientPhone" type="tel" inputMode="numeric" defaultValue={row.clientPhone || ""} className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">केस नंबर *</label>
          <input name="caseNumber" type="text" required defaultValue={row.caseNumber || ""} className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">कोर्ट</label>
          <input name="courtName" type="text" defaultValue={row.courtName || ""} className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">केस प्रकार</label>
          <select name="caseType" defaultValue={row.caseType || ""} className={inputClass}>
            <option value="">चुनें (वैकल्पिक)</option>
            {CASE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">विपक्षी</label>
          <input name="oppositeParty" type="text" defaultValue={row.oppositeParty || ""} className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">अगली पेशी</label>
          <input name="nextHearingDate" type="date" defaultValue={row.nextHearingDate || ""} className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">किस चीज़ के लिए (चरण)</label>
          <input name="stage" type="text" defaultValue={row.stage || ""} className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">स्थिति</label>
          <select name="status" defaultValue={row.status || "active"} className={inputClass}>
            <option value="active">सक्रिय</option>
            <option value="disposed">निस्तारित</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">टिप्पणी</label>
          <textarea name="notes" rows={3} defaultValue={row.notes || ""} className={inputClass} />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-800 px-4 py-3.5 text-base font-medium text-white transition active:scale-[0.98]"
        >
          अपडेट करें
        </button>
      </form>
    </main>
  );
}