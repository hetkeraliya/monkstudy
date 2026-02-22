"use client";

import { motion } from "framer-motion";
import { User, Flame, Award, ShieldCheck } from "lucide-react";
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Profile() {
  const { xp, streak } = useStore(); // This will now find 'xp' in the store

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24 p-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-dark tracking-tight">Monk Profile</h1>
      </header>

      <div className="matte-card p-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-monk-bg rounded-2xl flex items-center justify-center text-monk-olive border-2 border-monk-sand/30">
          <User size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-monk-dark textMain">Het Keraliya</h2>
          <p className="text-sm text-monk-muted font-medium flex items-center gap-1 mt-1">
            <ShieldCheck size={14} /> 11th Standard • JEE Aspirant
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="matte-card p-5 flex flex-col items-center text-center">
          <Flame className="text-orange-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-monk-dark">{streak}</span>
          <span className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Day Streak</span>
        </div>
        <div className="matte-card p-5 flex flex-col items-center text-center">
          <Award className="text-monk-olive mb-2" size={24} />
          <span className="text-2xl font-bold text-monk-dark">{xp}</span>
          <span className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Total XP</span>
        </div>
      </div>
    </motion.div>
  );
}
