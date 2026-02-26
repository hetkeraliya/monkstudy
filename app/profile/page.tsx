"use client";

import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { ArrowLeft, LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const setAuthUser = useStore((state) => state.setAuthUser);

  const handleLogout = async () => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([20, 20]);
    
    try {
      // 1. Tell Firebase to kill the session
      await signOut(auth);
      // 2. Clear the local store
      setAuthUser(null);
      // 3. Redirect to login
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#E2E2E2] p-6 selection:bg-[#ACAD94] selection:text-[#384D48]">
      
      {/* Top Navigation */}
      <div className="flex items-center mb-8">
        <Link href="/" className="w-12 h-12 bg-[#FFFFFF] rounded-2xl shadow-[0_4px_12px_rgba(56,77,72,0.05)] flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft className="text-[#384D48]" size={24} />
        </Link>
        <h1 className="flex-grow text-center text-[#384D48] font-black tracking-widest text-sm uppercase pr-12">
          Identity
        </h1>
      </div>

      {/* Profile Card */}
      <div className="bg-[#FFFFFF] rounded-[24px] p-6 shadow-[0_4px_12px_rgba(56,77,72,0.05)] mb-6 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4 border-4 border-[#E2E2E2]">
          <User className="text-[#ACAD94]" size={36} />
        </div>
        
        <h2 className="text-xl font-black text-[#384D48] tracking-tight">
          {user?.displayName || "Initiated Monk"}
        </h2>
        <p className="text-xs font-bold text-[#6E7271] mt-1">
          {user?.email || "No email linked"}
        </p>

        <div className="w-full h-px bg-[#E2E2E2] my-6"></div>

        {/* User Stats / Info */}
        <div className="w-full flex justify-between px-4">
          <div className="text-center">
            <p className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">Target</p>
            <p className="text-lg font-black text-[#384D48]">JEE '26</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">Status</p>
            <p className="text-lg font-black text-[#ACAD94]">Active</p>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <button 
        onClick={handleLogout}
        className="w-full bg-[#FFFFFF] border-2 border-[#D8D4D5] text-[#384D48] rounded-xl py-4 font-black text-sm flex justify-center items-center gap-3 active:scale-[0.98] transition-transform shadow-sm"
      >
        <LogOut size={18} />
        Disconnect Sanctuary
      </button>

    </div>
  );
}
