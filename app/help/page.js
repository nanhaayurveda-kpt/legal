import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

// हर विषय एक कार्ड बनेगा
const TOPICS = [
  {
    title: "लॉगिन कैसे करें",
    steps: [
      "“Google से लॉगिन करें” दबाएँ।",
      "चौकी वाली ईमेल चुनें — बस, अंदर आ जाएँगे।",
    ],
  },
  {
    title: "नया केस जोड़ें",
    steps: [
      "होम पर “नया केस जोड़ें” दबाएँ।",
      "मुवक्किल का नाम, फ़ोन, केस नंबर और अगली पेशी की तारीख़ भरें।",
      "नीचे “सहेजें” दबाएँ।",
    ],
  },
  {
    title: "आज की पेशी देखें",
    steps: ["होम खुलते ही “आज की पेशी” में आज की तारीख़ वाले केस दिखते हैं।"],
  },
  {
    title: "आने वाली पेशियाँ देखें",
    steps: [
      "होम पर “आने वाली पेशियाँ” दबाएँ।",
      "आगे की सब तारीख़ें तारीख़-वार दिखेंगी।",
    ],
  },
  {
    title: "मुवक्किल को रिमाइंडर भेजें",
    steps: [
      "केस के नीचे हरा “रिमाइंडर भेजें” दबाएँ।",
      "WhatsApp अपने-आप खुलेगा, संदेश पहले से भरा होगा।",
      "बस “Send” दबा दें।",
    ],
  },
  {
    title: "तारीख़ या ब्योरा बदलें",
    steps: [
      "किसी केस पर टैप करें।",
      "ऊपर “संपादित करें” दबाएँ।",
      "अगली पेशी या कुछ भी बदलें, फिर “अपडेट करें” दबाएँ।",
    ],
  },
  {
    title: "केस बंद (निस्तारित) करें",
    steps: [
      "केस → “संपादित करें” → “स्थिति” को “निस्तारित” चुनें → “अपडेट करें”।",
    ],
  },
  {
    title: "केस लॉ खोजें",
    steps: [
      "होम पर “केस लॉ खोज” दबाएँ।",
      "विषय लिखें — जैसे “ज़मानत दहेज मामला” — और “खोजें” दबाएँ।",
      "असली फ़ैसले और हिंदी सार आएँगे; लिंक दबाकर पूरा फ़ैसला पढ़ें।",
    ],
  },
  {
    title: "ऐप को फ़ोन में लगाएँ",
    steps: [
      "Chrome में ऊपर तीन बिंदु (⋮) दबाएँ।",
      "“होम स्क्रीन पर जोड़ें” चुनें।",
      "आइकन बन जाएगा — अब ऐप की तरह खुलेगा।",
    ],
  },
  {
    title: "लॉगआउट",
    steps: ["होम पर ऊपर-दाएँ “लॉगआउट” दबाएँ।"],
  },
];

export default async function HelpPage() {
  // सुरक्षा
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <a href="/dashboard" className="text-sm text-slate-500 active:text-slate-800">
          ← वापस
        </a>
        <p className="text-base font-bold text-slate-800">सहायता</p>
        <span className="w-10" />
      </header>

      <section className="px-4 pt-4">
        <p className="mb-4 text-sm text-slate-600">
          घबराएँ नहीं — सब आसान है। नीचे हर काम का तरीक़ा दिया है।
        </p>

        <ul className="space-y-3">
          {TOPICS.map((t, i) => (
            <li key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-800">{t.title}</p>
                  <ul className="mt-1 space-y-1">
                    {t.steps.map((s, j) => (
                      <li key={j} className="text-sm leading-relaxed text-slate-600">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}