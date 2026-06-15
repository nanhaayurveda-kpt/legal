import { Google } from "arctic";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Arctic Google OAuth client — login और callback दोनों यही use करेंगे
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const SESSION_COOKIE = "session";
const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET);

// session cookie के options — callback में set करते वक़्त इस्तेमाल होंगे
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 दिन
};

// jose से signed session token बनाओ
export async function createSession(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

// token verify → payload; ग़लत/expire हो तो null
export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

// अभी logged-in user — cookie पढ़ो फिर verify करो
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifySession(token);
}

// logout — session cookie हटाओ
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}