"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async (e: any) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    else router.push("/");
  };

  const googleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E2E2E2] p-4">
      <div className="bg-white rounded-[18px] shadow-md p-6 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-center">
          Study Monk Login
        </h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={login} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-xl p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-xl p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-[#384D48] text-white rounded-xl py-3">
            Login
          </button>
        </form>

        <button
          onClick={googleLogin}
          className="w-full border rounded-xl py-3"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
