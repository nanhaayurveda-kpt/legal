// मुवक्किल को भेजने के लिए wa.me लिंक (हिंदी संदेश)
export function waReminderLink(phone, caseNumber, dateHindi, court) {
  const digits = (phone || "").replace(/\D/g, "");
  const num = digits.startsWith("91") ? digits : `91${digits}`;
  const chowki = process.env.NEXT_PUBLIC_CHOWKI_NAME || "";
  const msg = `नमस्ते, आपके केस ${caseNumber} की अगली पेशी ${dateHindi} को ${court || "कोर्ट"} में है। — ${chowki} चौकी`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}