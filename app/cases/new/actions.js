"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, cases } from "@/lib/schema";

export async function createCase(formData) {
  // auth — session ज़रूरी
  const session = await getSession();
  if (!session) redirect("/");

  // फ़ॉर्म से मान निकालो
  const clientName = formData.get("clientName")?.trim();
  const clientPhone = formData.get("clientPhone")?.trim() || null;
  const caseNumber = formData.get("caseNumber")?.trim();
  const courtName = formData.get("courtName")?.trim() || null;
  const caseType = formData.get("caseType") || null;
  const oppositeParty = formData.get("oppositeParty")?.trim() || null;
  const nextHearingDate = formData.get("nextHearingDate") || null;
  const stage = formData.get("stage")?.trim() || null;
  const notes = formData.get("notes")?.trim() || null;

  // ज़रूरी — मुवक्किल का नाम और केस नंबर
  if (!clientName || !caseNumber) {
    redirect("/cases/new?error=missing");
  }

  // पहले मुवक्किल जोड़ो (Turso पर .returning() नहीं), फिर उसकी id लो
  await db.insert(clients).values({
    userId: session.id,
    name: clientName,
    phone: clientPhone,
  });
  const client = (
    await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.userId, session.id))
      .orderBy(desc(clients.id))
      .limit(1)
  )[0];

  // फिर केस जोड़ो, उसी मुवक्किल से जुड़ा
  await db.insert(cases).values({
    userId: session.id,
    clientId: client.id,
    caseNumber,
    courtName,
    caseType,
    oppositeParty,
    nextHearingDate,
    stage,
    notes,
    status: "active",
  });

  // सूचियाँ ताज़ा करो, फिर केस सूची पर भेजो
  revalidatePath("/cases");
  revalidatePath("/dashboard");
  redirect("/cases");
}