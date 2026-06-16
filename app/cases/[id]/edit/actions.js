"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, cases } from "@/lib/schema";

export async function updateCase(formData) {
  // auth
  const session = await getSession();
  if (!session) redirect("/");

  const caseId = parseInt(formData.get("caseId"), 10);
  if (!caseId) redirect("/cases");

  // केस लाओ (ownership) — clientId पाने को
  const existing = (
    await db
      .select({ clientId: cases.clientId })
      .from(cases)
      .where(and(eq(cases.id, caseId), eq(cases.userId, session.id)))
      .limit(1)
  )[0];

  if (!existing) redirect("/cases");

  // फ़ॉर्म से मान
  const clientName = formData.get("clientName")?.trim();
  const clientPhone = formData.get("clientPhone")?.trim() || null;
  const caseNumber = formData.get("caseNumber")?.trim();
  const courtName = formData.get("courtName")?.trim() || null;
  const caseType = formData.get("caseType") || null;
  const oppositeParty = formData.get("oppositeParty")?.trim() || null;
  const nextHearingDate = formData.get("nextHearingDate") || null;
  const stage = formData.get("stage")?.trim() || null;
  const notes = formData.get("notes")?.trim() || null;
  const status = formData.get("status") === "disposed" ? "disposed" : "active";

  // ज़रूरी
  if (!clientName || !caseNumber) {
    redirect(`/cases/${caseId}/edit?error=missing`);
  }

  // मुवक्किल अपडेट (ownership)
  await db
    .update(clients)
    .set({ name: clientName, phone: clientPhone })
    .where(
      and(eq(clients.id, existing.clientId), eq(clients.userId, session.id)),
    );

  // केस अपडेट (ownership) — updatedAt schema के $onUpdate से अपने-आप
  await db
    .update(cases)
    .set({
      caseNumber,
      courtName,
      caseType,
      oppositeParty,
      nextHearingDate,
      stage,
      notes,
      status,
    })
    .where(and(eq(cases.id, caseId), eq(cases.userId, session.id)));

  revalidatePath("/cases");
  revalidatePath("/dashboard");
  revalidatePath(`/cases/${caseId}`);
  redirect(`/cases/${caseId}`);
}

export async function deleteCase(formData) {
  // auth
  const session = await getSession();
  if (!session) redirect("/");

  const caseId = parseInt(formData.get("caseId"), 10);
  if (!caseId) redirect("/cases");

  // सिर्फ़ अपना ही केस हटाओ (ownership)
  await db
    .delete(cases)
    .where(and(eq(cases.id, caseId), eq(cases.userId, session.id)));

  revalidatePath("/cases");
  revalidatePath("/dashboard");
  redirect("/cases");
}
