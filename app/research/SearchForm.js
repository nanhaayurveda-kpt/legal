"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-800 focus:border-slate-500 focus:outline-none";

export default function SearchForm({ initialQuery, initialAll }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery || "");
  const [allIndia, setAllIndia] = useState(initialAll || false);
  const [isPending, startTransition] = useTransition();

  // खोज चलाओ — URL बदलते ही server दुबारा खोजेगा, तब तक isPending true रहेगा
  function handleSubmit() {
    const query = q.trim();
    if (!query) return;
    const suffix = allIndia ? "&all=1" : "";
    startTransition(() => {
      router.push(`/research?q=${encodeURIComponent(query)}${suffix}`);
    });
  }
  return (
    <div className="px-4 pt-4">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          type="text"
          placeholder="विषय या सवाल — जैसे ज़मानत दहेज मामला"
          className={inputClass}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !q.trim()}
          className="shrink-0 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "खोज रहे…" : "खोजें"}
        </button>
      </div>
      <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={allIndia}
          onChange={(e) => setAllIndia(e.target.checked)}
          className="h-4 w-4"
        />
        पूरे भारत में खोजें (दूसरे हाईकोर्ट भी)
      </label>

      {isPending && (
        <p className="mt-3 text-sm text-slate-500">
          असली जजमेंट खोजे जा रहे हैं और सार बन रहा है… थोड़ा रुकें।
        </p>
      )}
    </div>
  );
}
