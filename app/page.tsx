"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- Added this back
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { User, Flame, Target, Play, BookOpen } from 'lucide-react';


export default function Dashboard() {
  const router = useRouter(); // <-- Initialize router
  const [mounted, setMounted] = useState(false);
  const [firebaseChecked, setFirebaseChecked] = useState(false);
  
  const user = useStore((state) => state.user);
  const subjects = useStore((state) => state.subjects);
  const xp = useStore((state) => state.xp);
  const streak = useStore((state) => state.streak);

  useEffect(() => {
    setMounted(true);


    return () => unsubscribe();
  }, [router]);

  if (!mounted || !firebaseChecked) {
    return (
      <div className="min-h-screen bg-[#E2E2E2] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#384D48] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E2E2E2] pb-24 px-5 pt-6 selection:bg-[#ACAD94] selection:text-[#384D48]">
      {/* ... KEEP THE REST OF YOUR DASHBOARD CODE EXACTLY THE SAME BELOW THIS LINE ... */}
      
      {/* 1. HEADER: Profile Icon & App Title */}
      <header className="flex justify-between items-center mb-8">
        <Link 
          href="/profile" 
          className="w-12 h-12 bg-[#FFFFFF] rounded-[16px] shadow-[0_4px_12px_rgba(56,77,72,0.05)] flex items-center justify-center active:scale-95 transition-transform"
        >
          <User className="text-[#384D48]" size={22} strokeWidth={2.5} />
        </Link>
        
        <h1 className="text-[#384D48] font-black tracking-[0.2em] text-[11px] uppercase">
          Monk OS
        </h1>
        
        <div className="w-12 h-12"></div>
      </header>

      {/* 2. GREETING & QUICK STATS */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[#384D48] tracking-tight mb-4">
          Welcome back,<br />
          <span className="text-[#ACAD94]">{user?.displayName?.split(' ')[0] || "Initiate"}</span>.
        </h2>

        <div className="flex gap-4">
          <div className="flex-1 bg-[#FFFFFF] rounded-[20px] p-4 shadow-[0_4px_12px_rgba(56,77,72,0.05)] flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center">
              <Flame className="text-[#ACAD94]" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">Streak</p>
              <p className="text-lg font-black text-[#384D48]">{streak} Days</p>
            </div>
          </div>

          <div className="flex-1 bg-[#FFFFFF] rounded-[20px] p-4 shadow-[0_4px_12px_rgba(56,77,72,0.05)] flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F5F5F5] rounded-xl flex items-center justify-center">
              <Target className="text-[#384D48]" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest">Focus XP</p>
              <p className="text-lg font-black text-[#384D48]">{xp}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION: Pomodoro Trigger */}
      <button 
        className="w-full bg-[#384D48] text-[#FFFFFF] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(56,77,72,0.08)] flex justify-between items-center mb-8 active:scale-[0.98] transition-transform"
        onClick={() => { if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(20); }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#FFFFFF]/10 rounded-xl flex items-center justify-center">
            <Play className="text-[#FFFFFF]" size={20} fill="currentColor" />
          </div>
          <div className="text-left">
            <p className="font-black text-[15px] tracking-wide">Deep Work Protocol</p>
            <p className="text-xs text-[#ACAD94] font-bold mt-0.5">Start 25m Timer</p>
          </div>
        </div>
      </button>

      {/* 4. SUBJECT CARDS GRID */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[11px] font-black text-[#6E7271] uppercase tracking-widest flex items-center gap-2">
          <BookOpen size={14} /> Active Syllabus
        </h3>
      </div>

      <div className="space-y-4">
        {subjects.map((subject) => {
          const progressPercent = Math.round((subject.completedChapters / subject.totalChapters) * 100);
          const hours = Math.floor(subject.dailyStudyMinutes / 60);
          const mins = subject.dailyStudyMinutes % 60;
          
          const radius = 16;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

          return (
            <div 
              key={subject.id} 
              className="bg-[#FFFFFF] rounded-[22px] p-5 shadow-[0_4px_12px_rgba(56,77,72,0.05)] active:scale-[0.98] transition-transform"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-[17px] text-[#384D48]">{subject.name}</h4>
                
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r={radius} fill="none" stroke="#F5F5F5" strokeWidth="4" />
                    <circle 
                      cx="20" cy="20" r={radius} 
                      fill="none" 
                      stroke="#ACAD94" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-black text-[#384D48]">{progressPercent}%</span>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest mb-1">Current Focus</p>
                <p className="font-bold text-[14px] text-[#111827] mb-3">{subject.currentChapter}</p>
                
                <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#384D48] rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-[10px] font-black text-[#6E7271] uppercase tracking-widest mb-0.5">Time Logged</p>
                  <p className="font-bold text-[13px] text-[#384D48]">{hours}h {mins}m today</p>
                </div>
                
                <button 
                  className="bg-[#F5F5F5] text-[#384D48] px-4 py-2 rounded-[12px] text-xs font-black uppercase tracking-widest active:bg-[#E2E2E2] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                  }}
                >
                  Enter
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
      }
                  
