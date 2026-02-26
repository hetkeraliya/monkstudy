"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) setError(error.message);
    else router.push("/");
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://monkstudy.vercel.app",
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E2E2E2] px-4">
      <div className="bg-white w-full max-w-sm rounded-[18px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-7 space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">
            Create Account
          </h1>
          <p className="text-sm text-[#6E7271]">
            Start your focused journey
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-[#D8D4D5] rounded-xl p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-[#D8D4D5] rounded-xl p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-[#384D48] text-white rounded-xl py-3 active:scale-95 transition">
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#D8D4D5]" />
          <span className="text-xs text-[#6E7271]">OR</span>
          <div className="flex-1 h-px bg-[#D8D4D5]" />
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 border border-[#D8D4D5] rounded-xl py-3 active:scale-95 transition"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.86-6.86C35.65 2.4 30.2 0 24 0 14.64 0 6.73 5.82 2.7 14.09l8.01 6.22C12.82 14.14 17.99 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.21-.43-4.73H24v9h12.73c-.55 2.96-2.22 5.47-4.73 7.14l7.27 5.65C43.87 37.36 46.5 31.43 46.5 24.5z"/>
            <path fill="#FBBC05" d="M10.71 28.31a14.48 14.48 0 010-8.62L2.7 13.47a24.02 24.02 0 000 21.06l8.01-6.22z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2.05 15.2-5.58l-7.27-5.65c-2.02 1.36-4.6 2.16-7.93 2.16-6.01 0-11.18-4.64-13.29-10.81l-8.01 6.22C6.73 42.18 14.64 48 24 48z"/>
          </svg>

          Continue with Google
        </button>

        <p className="text-sm text-center text-[#6E7271]">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-[#384D48] font-medium cursor-pointer"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}
