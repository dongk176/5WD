"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setErrorMessage(payload.message || "로그인에 실패했습니다.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setErrorMessage("로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-xs font-bold tracking-widest text-primary uppercase">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border border-slate-300 px-4 py-3 text-base focus:border-primary focus:outline-none"
          required
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-charcoal px-8 py-4 text-sm font-bold tracking-[0.2em] text-white uppercase transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Verifying..." : "Enter Admin"}
      </button>

      {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
    </form>
  );
}
