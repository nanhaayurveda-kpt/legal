import { NextResponse } from "next/server";
import { generateState, generateCodeVerifier } from "arctic";
import { google } from "@/lib/auth";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  // Arctic latest — sync, scopes array. email चाहिए ताकि ALLOWED_EMAILS गेट लग सके
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  const isProd = process.env.NODE_ENV === "production";
  const response = NextResponse.redirect(url.toString());

  // state और code verifier short-lived httpOnly cookies में — callback में verify होंगे
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 मिनट
  });
  response.cookies.set("google_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 मिनट
  });

  return response;
}