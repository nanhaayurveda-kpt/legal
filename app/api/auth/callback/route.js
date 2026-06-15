import { NextResponse } from "next/server";
import { decodeIdToken } from "arctic";
import { eq } from "drizzle-orm";
import { google, createSession, SESSION_COOKIE, cookieOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// हर redirect पर session cookie साथ भेजने वाला helper
function redirectWithCookie(path, token) {
  const response = NextResponse.redirect(new URL(path, BASE_URL));
  response.cookies.set(SESSION_COOKIE, token, cookieOptions);
  // अस्थायी OAuth cookies साफ़ करो
  response.cookies.delete("google_oauth_state");
  response.cookies.delete("google_code_verifier");
  return response;
}

// auth नाकाम हो तो वापस login पर
function redirectError(reason) {
  return NextResponse.redirect(new URL(`/?error=${reason}`, BASE_URL));
}

export async function GET(request) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("google_oauth_state")?.value;
  const codeVerifier = request.cookies.get("google_code_verifier")?.value;

  // ज़रूरी चीज़ें मौजूद हों और state मेल खाता हो
  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return redirectError("auth");
  }

  let claims;
  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    claims = decodeIdToken(tokens.idToken());
  } catch {
    return redirectError("auth");
  }

  const email = claims.email;

  // ALLOWED_EMAILS गेट — सिर्फ़ चौकी की ईमेल अंदर आए
  const allowed = (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!email || !allowed.includes(email.toLowerCase())) {
    return redirectError("unauthorized");
  }

  // user upsert — googleId से ढूँढो, न मिले तो डालो (no .returning())
  let user = (
    await db.select().from(users).where(eq(users.googleId, claims.sub)).limit(1)
  )[0];

  if (!user) {
    await db.insert(users).values({
      googleId: claims.sub,
      email,
      name: claims.name,
      picture: claims.picture,
    });
    user = (
      await db.select().from(users).where(eq(users.googleId, claims.sub)).limit(1)
    )[0];
  }

  // session बनाओ और cookie के साथ dashboard भेजो
  const token = await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
  });

  return redirectWithCookie("/dashboard", token);
}