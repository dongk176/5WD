import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "fivewd_admin_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const MIN_PASSWORD_LENGTH = 8;
const MIN_SECRET_LENGTH = 16;

type AdminAuthConfig = {
  password: string;
  secret: string;
};

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function getConfig(): AdminAuthConfig | null {
  const password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";

  if (password.length < MIN_PASSWORD_LENGTH) return null;
  if (secret.length < MIN_SECRET_LENGTH) return null;

  return { password, secret };
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function isAdminAuthConfigured(): boolean {
  return getConfig() !== null;
}

export function verifyAdminPassword(input: string): boolean {
  const config = getConfig();
  if (!config) return false;
  return safeCompare(input, config.password);
}

export function createAdminSessionToken(now = Date.now()): string | null {
  const config = getConfig();
  if (!config) return null;

  const expiresAt = now + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(12).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  const signature = sign(payload, config.secret);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const config = getConfig();
  if (!config) return false;

  const pieces = token.split(".");
  if (pieces.length !== 3) return false;

  const [expiresAtRaw, nonce, providedSignature] = pieces;
  if (!expiresAtRaw || !nonce || !providedSignature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt)) return false;
  if (Date.now() > expiresAt) return false;

  const payload = `${expiresAtRaw}.${nonce}`;
  const expectedSignature = sign(payload, config.secret);
  return safeCompare(providedSignature, expectedSignature);
}

export function getAdminSessionDurationSeconds(): number {
  return Math.floor(SESSION_TTL_MS / 1000);
}
