import { searchKanoon } from "@/lib/kanoon";
import { DRAFT_TYPES } from "@/lib/draftTypes";

const MODEL = "gemini-3.5-flash"; // model बदले तो सिर्फ़ यहीं बदलो
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Gemini को prompt भेजो, सिर्फ़ text जवाब लौटाओ
async function askGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "x-goog-api-key": process.env.GEMINI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// केस लॉ खोजो (Indian Kanoon) + Gemini सिर्फ़ उन्हीं नतीजों पर हिंदी सार दे (RAG)
export async function findCaseLaw(query, { doctypes } = {}) {
  // 1. असली judgments retrieve करो
  const sources = await searchKanoon(query, { doctypes });

  if (sources.length === 0) {
    return { answer: "इस विषय पर कोई जजमेंट नहीं मिला।", sources: [] };
  }

  // 2. सिर्फ़ इन्हीं नतीजों से Gemini को सार बनाने को कहो — गढ़ना मना
  const docsText = sources
    .map(
      (s, i) =>
        `[${i + 1}] शीर्षक: ${s.title}\nकोर्ट: ${s.source}\nअंश: ${s.headline}\nलिंक: ${s.url}`
    )
    .join("\n\n");

  const prompt = `तुम एक क़ानूनी शोध सहायक हो। नीचे Indian Kanoon से मिले असली जजमेंट के अंश दिए हैं। सिर्फ़ इन्हीं दिए गए दस्तावेज़ों के आधार पर हिंदी में संक्षिप्त सार दो — कौन-सा फ़ैसला किस बारे में है और कैसे काम आ सकता है।

सख़्त नियम:
- सिर्फ़ नीचे दिए दस्तावेज़ों से बताओ। अपनी याद से कोई फ़ैसला, धारा या citation मत गढ़ो।
- अगर दस्तावेज़ों में जवाब नहीं है तो साफ़ लिखो "दिए गए दस्तावेज़ों में यह नहीं मिला"।
- हर बिंदु के साथ उसका [नंबर] दो ताकि वकील असली लिंक से ख़ुद जाँच ले।

प्रश्न: ${query}

दस्तावेज़:
${docsText}`;

  const answer = await askGemini(prompt);

  // 3. AI सार + असली source links दोनों लौटाओ
  return { answer, sources };
}

// हिंदी क़ानूनी मसौदा बनाओ — type + तथ्य से (पहला मसौदा, वकील जाँचे)
export async function generateDraft(typeId, facts) {
  const type = DRAFT_TYPES.find((t) => t.id === typeId);
  if (!type) {
    return "अमान्य ड्राफ़्ट प्रकार।";
  }

  const prompt = `तुम एक क़ानूनी मसौदा सहायक हो। नीचे दिए तथ्यों के आधार पर "${type.label}" का हिंदी मसौदा तैयार करो, भारतीय कोर्ट के सामान्य ढाँचे में।

ढाँचा:
- ऊपर कोर्ट का शीर्षक और पक्षकारों का विवरण
- मुख्य भाग
- आधार (grounds) — बिंदुवार
- प्रार्थना (prayer)
- अंत में दिनांक और हस्ताक्षर की पंक्ति

सख़्त नियम:
- जो जानकारी तथ्यों में नहीं है (नाम, केस नंबर, कोर्ट, तारीख़ आदि), वहाँ [____] placeholder छोड़ो ताकि वकील भर दे।
- कोई फ़र्ज़ी तथ्य, धारा या केस citation मत गढ़ो। ज़रूरी लगे तो [धारा/निर्णय — वकील भरें] लिख दो।
- भाषा औपचारिक हिंदी, कोर्ट में दाख़िल करने लायक।

तथ्य:
${facts}`;

  return askGemini(prompt);
}