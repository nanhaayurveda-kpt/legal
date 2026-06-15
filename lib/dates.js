// तारीख़ से जुड़े साझा helpers — पूरे ऐप में यहीं से

const HINDI_MONTHS = [
  "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
  "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
];

// IST के हिसाब से आज की तारीख़ — YYYY-MM-DD
export function todayIST() {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

// YYYY-MM-DD → "15 जून 2026"
export function formatDateHindi(ymd) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${parseInt(d, 10)} ${HINDI_MONTHS[parseInt(m, 10) - 1]} ${y}`;
}