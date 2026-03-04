"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Email login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E2E2E2] px-4">
      <div className="bg-white w-full max-w-sm rounded-[18px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] p-7 space-y-6">

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-[#111827]">
            Welcome Back
          </h1>
          <p className="text-sm text-[#6E7271]">
            Continue your focused journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Email Login */}
        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-[#D8D4D5] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ACAD94]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-[#D8D4D5] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#ACAD94]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#384D48] text-white rounded-xl py-3 font-medium active:scale-95 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>
        

        {/* Signup Link */}
        <p className="text-sm text-center text-[#6E7271]">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-[#384D48] font-medium cursor-pointer"
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
        }
