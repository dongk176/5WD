import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionDurationSeconds,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from "../../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AttemptState = {
  failures: number;
  blockedUntil: number;
};

const MAX_FAILURES = 5;
const BLOCK_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPTS = new Map<string, AttemptState>();

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return "unknown";
}

function isBlocked(state: AttemptState | undefined): boolean {
  if (!state) return false;
  return state.blockedUntil > Date.now();
}

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ message: "Admin auth is not configured." }, { status: 503 });
  }

  const clientKey = getClientKey(request);
  const current = LOGIN_ATTEMPTS.get(clientKey);
  if (isBlocked(current)) {
    return NextResponse.json({ message: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password?.toString() || "";
  } catch {
    password = "";
  }

  if (!verifyAdminPassword(password)) {
    const nextFailures = (current?.failures || 0) + 1;
    const blockedUntil = nextFailures >= MAX_FAILURES ? Date.now() + BLOCK_MS : 0;
    LOGIN_ATTEMPTS.set(clientKey, {
      failures: blockedUntil ? 0 : nextFailures,
      blockedUntil,
    });
    return NextResponse.json({ message: "Invalid password." }, { status: 401 });
  }

  LOGIN_ATTEMPTS.delete(clientKey);

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json({ message: "Failed to create session." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAdminSessionDurationSeconds(),
  });

  return response;
}
