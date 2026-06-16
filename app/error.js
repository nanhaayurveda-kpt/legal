"use client";

export default function Error({ error, reset }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <p className="text-lg font-bold text-slate-800">कुछ गड़बड़ हो गई</p>
      <p className="text-sm text-slate-500">
        थोड़ी देर बाद दोबारा कोशिश करें। दिक़्क़त बनी रहे तो डेवलपर को बताएँ।
      </p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-white active:scale-[0.98]"
      >
        फिर कोशिश करें
      </button>
    </main>
  );
}