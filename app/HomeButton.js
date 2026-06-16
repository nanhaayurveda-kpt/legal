"use client";

import { usePathname } from "next/navigation";

export default function HomeButton() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/dashboard") return null;

  return (
    <a
      href="/dashboard"
      aria-label="होम"
      className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg active:scale-95"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    </a>
  );
}