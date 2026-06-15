"use client";

import { useState, useEffect, useRef } from "react";
import { generateDraftAction } from "./actions";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-800 focus:border-slate-500 focus:outline-none";

export default function DraftForm({ types }) {
  const [typeId, setTypeId] = useState(types[0].id);
  const [facts, setFacts] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

  // browser में voice सपोर्ट है या नहीं — mount पर जाँचो
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // माइक — हिंदी बोलकर तथ्य में जोड़ो
  function handleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SR();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setFacts((prev) => (prev ? prev + " " + text : text));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  // मसौदा बनाओ — server action को बुलाओ
  async function handleGenerate() {
    if (!facts.trim()) return;
    setLoading(true);
    setDraft("");
    try {
      const text = await generateDraftAction(typeId, facts);
      setDraft(text);
    } catch {
      setDraft("मसौदा बनाने में दिक़्क़त हुई। थोड़ी देर बाद फिर कोशिश करें।");
    }
    setLoading(false);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(draft);
  }

  // साफ़ A4 PDF/print — नई विंडो में मसौदा, देवनागरी फ़ॉन्ट सहित
  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    const safe = draft
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    win.document.write(
      `<!DOCTYPE html><html lang="hi"><head><meta charset="utf-8" /><title>मसौदा</title>` +
        `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;700&display=swap" rel="stylesheet" />` +
        `<style>@page{size:A4;margin:2cm}body{font-family:'Noto Sans Devanagari',sans-serif;font-size:13pt;line-height:1.9;color:#000;white-space:pre-wrap}</style>` +
        `</head><body>${safe}</body></html>`,
    );
    win.document.close();
    win.focus();
    // फ़ॉन्ट लोड होने का वक़्त देकर print
    setTimeout(() => win.print(), 600);
  }

  return (
    <section className="space-y-4 px-4 pt-4">
      {/* ड्राफ़्ट प्रकार */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          ड्राफ़्ट प्रकार
        </label>
        <select
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className={inputClass + " mt-1"}
        >
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* तथ्य */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          तथ्य / ब्योरा
        </label>
        <textarea
          value={facts}
          onChange={(e) => setFacts(e.target.value)}
          rows={5}
          placeholder="केस का ब्योरा और कारण — जैसे आरोपी का नाम, धारा, गिरफ़्तारी की तारीख़, ज़मानत का आधार…"
          className={inputClass + " mt-1"}
        />
        {voiceSupported && (
          <button
            type="button"
            onClick={handleMic}
            className={
              "mt-2 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition active:scale-[0.98] " +
              (listening
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-slate-300 bg-white text-slate-700")
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
            {listening ? "सुन रहा हूँ… रोकने के लिए दबाएँ" : "बोलकर लिखें"}
          </button>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !facts.trim()}
        className="w-full rounded-xl bg-slate-800 px-4 py-3.5 text-base font-medium text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "मसौदा बन रहा है…" : "मसौदा बनाएँ"}
      </button>

      {/* नतीजा */}
      {draft && (
        <div className="space-y-2">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠️ यह सिर्फ़ पहला मसौदा है — दाख़िल करने से पहले वकील साहब ज़रूर
            जाँचें और [____] भरें।
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={16}
            className={inputClass + " text-sm leading-relaxed"}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition active:scale-[0.98]"
            >
              कॉपी करें
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition active:scale-[0.98]"
            >
              प्रिंट / PDF
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
