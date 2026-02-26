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
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user) {
      setMessage("Account created successfully!");
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E2E2E2] p-4">
      <div className="bg-white rounded-[18px] shadow-md p-6 w-full max-w-sm space-y-4">

        <h1 className="text-2xl font-semibold text-center">
          Create Account
        </h1>

        {message && (
          <p className="text-sm text-center text-red-500">{message}</p>
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
            placeholder="Password (min 6 characters)"
            className="w-full border border-[#D8D4D5] rounded-xl p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#384D48] text-white rounded-xl py-3 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

        </form>

      </div>
    </div>
  );
}
