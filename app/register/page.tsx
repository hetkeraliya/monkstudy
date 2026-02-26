"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
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
    <div className="min-h-screen flex items-center justify-center bg-[#E2E2E2] p-4">
      <div className="bg-white rounded-[18px] shadow-md p-6 w-full max-w-sm space-y-5">

        <h1 className="text-2xl font-semibold text-center text-[#111827]">
          Create Account
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

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
            className="w-full bg-[#384D48] text-white rounded-xl py-3 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

        </form>

        <p className="text-sm text-center text-[#6E7271]">
          Already have an account?{" "}
          <span
            className="text-[#384D48] font-medium cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
          }
