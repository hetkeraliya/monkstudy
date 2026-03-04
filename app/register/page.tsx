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
        
        {/* Google Button */}
        

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
