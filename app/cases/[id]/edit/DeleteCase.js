"use client";

import { useState } from "react";
import { deleteCase } from "./actions";

export default function DeleteCase({ caseId }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-4 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-700 transition active:scale-[0.98]"
      >
        केस हटाएँ
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-700">
        पक्का इस केस को हमेशा के लिए हटाना है? यह वापस नहीं आएगा।
      </p>
      <div className="mt-3 flex gap-2">
        <form action={deleteCase}>
          <input type="hidden" name="caseId" defaultValue={caseId} />
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            हाँ, हटाएँ
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition active:scale-[0.98]"
        >
          रद्द करें
        </button>
      </div>
    </div>
  );
}