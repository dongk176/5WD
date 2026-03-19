import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthConfigured,
  verifyAdminSessionToken,
} from "../../../lib/admin-auth";
import { isDatabaseConfigured } from "../../../lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (!isDatabaseConfigured()) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-24">
        <h1 className="mb-6 text-4xl font-black tracking-tight uppercase">Database Not Configured</h1>
        <p className="text-slate-500">
          <code>DATABASE_URL</code> 환경변수를 먼저 설정해 주세요.
        </p>
      </main>
    );
  }

  if (!isAdminAuthConfigured()) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-24">
        <h1 className="mb-6 text-4xl font-black tracking-tight uppercase">Admin Auth Not Configured</h1>
        <p className="text-slate-500">
          <code>ADMIN_PASSWORD</code>와 <code>ADMIN_SESSION_SECRET</code> 환경변수를 설정해 주세요.
        </p>
      </main>
    );
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (verifyAdminSessionToken(sessionToken)) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background-light px-6 py-24 text-charcoal">
      <section className="mx-auto max-w-xl border border-slate-200 bg-white p-8 md:p-10">
        <p className="mb-4 text-xs font-bold tracking-[0.3em] text-primary uppercase">Protected Access</p>
        <h1 className="mb-6 text-4xl font-black tracking-tight uppercase md:text-5xl">Admin Login</h1>
        <p className="mb-8 text-slate-500">어드민 비밀번호를 입력해 주세요.</p>
        <LoginForm />
      </section>
    </main>
  );
}
