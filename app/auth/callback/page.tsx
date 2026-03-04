"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const finishLogin = async () => {
      await supabase.auth.getSession();
      router.replace("/");
    };

    finishLogin();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E2E2E2]">
      <div className="w-8 h-8 border-4 border-[#384D48] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
