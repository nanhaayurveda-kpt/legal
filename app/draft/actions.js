"use server";

import { getSession } from "@/lib/auth";
import { generateDraft } from "@/lib/ai";

// मसौदा बनाओ — auth जाँच के बाद Gemini से
export async function generateDraftAction(typeId, facts) {
  const session = await getSession();
  if (!session) return "लॉगिन ज़रूरी है।";
  if (!facts?.trim()) return "कृपया तथ्य भरें।";
  return generateDraft(typeId, facts);
}