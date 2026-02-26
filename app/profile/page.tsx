"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Profile</h1>
      <button
        onClick={logout}
        className="mt-4 bg-[#384D48] text-white px-4 py-2 rounded-xl"
      >
        Logout
      </button>
    </div>
  );
}
