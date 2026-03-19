"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="border border-slate-300 px-4 py-2 text-xs font-bold tracking-[0.2em] text-slate-600 uppercase transition hover:border-charcoal hover:text-charcoal"
    >
      Logout
    </button>
  );
}
