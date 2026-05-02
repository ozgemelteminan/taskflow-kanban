"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Hatalı e-posta veya şifre");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
      style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(124,110,245,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(78,202,139,0.08) 0%, transparent 50%), var(--bg)" }}>
      <div className="w-full max-w-md rounded-2xl p-12 border"
        style={{ background: "var(--surface)", borderColor: "var(--border2)" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-9">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold"
            style={{ background: "var(--accent)" }}>⚡</div>
          <span className="text-xl font-semibold tracking-tight">TaskFlow</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-2">Hoş geldin</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text2)" }}>Hesabına giriş yap</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(240,82,82,0.12)", border: "0.5px solid rgba(240,82,82,0.3)", color: "var(--red)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: "var(--text2)" }}>E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ornek@eposta.com"
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              style={{ background: "var(--surface2)", border: "0.5px solid var(--border2)", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: "var(--text2)" }}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              style={{ background: "var(--surface2)", border: "0.5px solid var(--border2)", color: "var(--text)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity mt-2"
            style={{ background: "var(--accent)", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--text2)" }}>
          Hesabın yok mu?{" "}
          <Link href="/register" style={{ color: "var(--accent2)" }} className="hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  );
}
