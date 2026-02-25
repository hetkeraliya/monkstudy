"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Target } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  
  const login = useStore((state) => state.login);
  const router = useRouter();

  const handleLogin = () => {
    // Vibrate on tap for tactile feedback
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    
    const success = login(name, pin);
    if (success) {
      router.push('/');
    } else {
      setError(true);
      if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50]);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#E2E2E2] flex flex-col justify-center items-center p-6 selection:bg-[#ACAD94] selection:text-[#384D48]">
      <div className="w-full max-w-sm bg-[#FFFFFF] rounded-[24px] p-8 shadow-[0_8px_24px_rgba(56,77,72,0.08)]">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#384D48] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Target className="text-[#ACAD94]" size={24} />
          </div>
          <h1 className="text-2xl font-black text-[#384D48] tracking-tight font-heading">STUDY MONK</h1>
          <p className="text-xs font-bold text-[#6E7271] uppercase tracking-widest mt-1">Access Protocol</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-[#6E7271] uppercase tracking-widest mb-2 px-1">Identity</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name" 
              className="w-full bg-[#F5F5F5] border-2 border-transparent focus:border-[#ACAD94] text-[#111827] rounded-xl px-4 py-3.5 font-bold text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#6E7271] uppercase tracking-widest mb-2 px-1">Access PIN</label>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••" 
              maxLength={4}
              pattern="\d*"
              className={`w-full bg-[#F5F5F5] border-2 ${error ? 'border-red-400 text-red-500' : 'border-transparent focus:border-[#ACAD94] text-[#111827]'} rounded-xl px-4 py-3.5 font-black text-lg outline-none transition-colors text-center tracking-[0.5em]`}
            />
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-[#384D48] text-[#FFFFFF] rounded-xl py-4 font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-transform shadow-md mt-4"
          >
            Enter Sanctuary
          </button>
        </div>

      </div>
    </div>
  );
}
