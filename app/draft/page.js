import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DRAFT_TYPES } from "@/lib/draftTypes";
import DraftForm from "./DraftForm";

export default async function DraftPage() {
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
        <p className="text-base font-bold text-slate-800">मसौदा बनाएँ</p>
        <span className="w-10" />
      </header>

      <DraftForm types={DRAFT_TYPES} />
    </main>
  );
}