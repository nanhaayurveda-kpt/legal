import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findCaseLaw } from "@/lib/gemini";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-800 focus:border-slate-500 focus:outline-none";

// IK headline में HTML होता है — tags हटाकर सादा text
function plainText(html) {
  return (html || "").replace(/<[^>]+>/g, "");
}

export default async function ResearchPage({ searchParams }) {
  // सुरक्षा
  const session = await getSession();
  if (!session) redirect("/");

  const params = await searchParams;
  const q = params?.q?.trim() || "";

  let result = null;
  let error = null;
  if (q) {
    try {
      result = await findCaseLaw(q);
    } catch {
      error = "खोज में दिक़्क़त हुई। थोड़ी देर बाद फिर कोशिश करें।";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <a href="/dashboard" className="text-sm text-slate-500 active:text-slate-800">
          ← वापस
        </a>
        <p className="text-base font-bold text-slate-800">केस लॉ खोज</p>
        <span className="w-10" />
      </header>

      {/* search form — GET */}
      <form method="get" className="flex gap-2 px-4 pt-4">
        <input
          name="q"
          type="text"
          defaultValue={q}
          placeholder="विषय या सवाल — जैसे ज़मानत दहेज मामला"
          className={inputClass}
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition active:scale-[0.98]"
        >
          खोजें
        </button>
      </form>

      <section className="px-4 pt-4">
        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!q && !error && (
          <p className="mt-2 text-sm text-slate-500">
            ऊपर कोई विषय डालकर खोजें। नतीजे असली Indian Kanoon जजमेंट से आएँगे — हर लिंक ख़ुद जाँच सकते हैं।
          </p>
        )}

        {result && (
          <div className="space-y-4">
            {/* AI सार */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-bold text-slate-700">सार (AI)</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {result.answer}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                ⚠️ यह सिर्फ़ नीचे दिए असली जजमेंट पर आधारित है — पैरवी से पहले मूल फ़ैसला ज़रूर पढ़ें।
              </p>
            </div>

            {/* असली judgments */}
            {result.sources.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-bold text-slate-700">
                  असली जजमेंट ({result.sources.length})
                </p>
                <ul className="space-y-3">
                  {result.sources.map((s, i) => (
                    <li key={s.tid} className="rounded-xl border border-slate-200 bg-white p-4">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="block">
                        <p className="text-sm font-semibold text-slate-800">
                          [{i + 1}] {s.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{s.source}</p>
                        {s.headline && (
                          <p className="mt-1 text-xs text-slate-600">{plainText(s.headline)}</p>
                        )}
                        <p className="mt-2 text-xs font-medium text-blue-600">
                          Indian Kanoon पर पढ़ें →
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}