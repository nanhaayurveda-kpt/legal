import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createCase } from "./actions";
import { CASE_TYPES } from "@/lib/caseTypes";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-800 focus:border-slate-500 focus:outline-none";

export default async function NewCasePage({ searchParams }) {
  // सुरक्षा
  const session = await getSession();
  if (!session) redirect("/");

  const params = await searchParams;
  const showError = params?.error === "missing";

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <a
          href="/cases"
          className="text-sm text-slate-500 active:text-slate-800"
        >
          ← वापस
        </a>
        <p className="text-base font-bold text-slate-800">नया केस</p>
        <span className="w-10" />
      </header>

      {showError && (
        <p className="mx-4 mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          मुवक्किल का नाम और केस नंबर ज़रूरी है।
        </p>
      )}

      <form action={createCase} className="space-y-4 px-4 pt-4">
        {/* मुवक्किल */}
        <div>
          <label className="text-sm font-medium text-slate-700">
            मुवक्किल का नाम *
          </label>
          <input
            name="clientName"
            type="text"
            required
            placeholder="नाम डालें"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            मुवक्किल का फ़ोन
          </label>
          <input
            name="clientPhone"
            type="tel"
            inputMode="numeric"
            placeholder="WhatsApp नंबर"
            className={inputClass}
          />
        </div>

        {/* केस */}
        <div>
          <label className="text-sm font-medium text-slate-700">
            केस नंबर *
          </label>
          <input
            name="caseNumber"
            type="text"
            required
            placeholder="केस नंबर डालें"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">कोर्ट</label>
          <input
            name="courtName"
            type="text"
            placeholder="कोर्ट का नाम"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            केस प्रकार
          </label>
          <select name="caseType" defaultValue="" className={inputClass}>
            <option value="">चुनें (वैकल्पिक)</option>
            {CASE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">विपक्षी</label>
          <input
            name="oppositeParty"
            type="text"
            placeholder="विपक्षी पक्ष"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            अगली पेशी
          </label>
          <input name="nextHearingDate" type="date" className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            किस चीज़ के लिए (चरण)
          </label>
          <input
            name="stage"
            type="text"
            placeholder="जैसे — बहस, गवाही"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">टिप्पणी</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="कोई नोट"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-800 px-4 py-3.5 text-base font-medium text-white transition active:scale-[0.98]"
        >
          सहेजें
        </button>
      </form>
    </main>
  );
}
