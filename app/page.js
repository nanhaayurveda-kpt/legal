import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

// error code → हिंदी संदेश
const ERROR_MESSAGES = {
  auth: "लॉगिन में दिक़्क़त हुई। कृपया दोबारा कोशिश करें।",
  unauthorized:
    "यह ईमेल अधिकृत नहीं है। सिर्फ़ चौकी की रजिस्टर्ड ईमेल से लॉगिन करें।",
};

export default async function LoginPage({ searchParams }) {
  // पहले से logged in हो तो सीधे dashboard
  const session = await getSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const error = params?.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">
            {process.env.NEXT_PUBLIC_CHOWKI_NAME}
          </h1>
          <p className="mt-1 text-sm text-slate-500">पेशी और मुवक्किल प्रबंधन</p>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <a
          href="/api/auth/login"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-base font-medium text-white transition active:scale-[0.98]"
        >
          Google से लॉगिन करें
        </a>

        <p className="mt-6 text-center text-xs text-slate-400">
          सिर्फ़ चौकी की अधिकृत ईमेल से प्रवेश
        </p>
      </div>
    </main>
  );
}