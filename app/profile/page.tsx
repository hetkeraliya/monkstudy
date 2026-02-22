"use client";

import { motion } from "framer-motion";
import { 
  User, 
  Flame, 
  Award, 
  Clock, 
  Download, 
  Upload, 
  Settings,
  ShieldCheck
} from "lucide-react";

// Use the correct two-level path to reach the root store/lib from app/profile
import { useStore } from "../../store/useStore";
import { vibrate } from "../../lib/db";

export default function Profile() {
  const { xp, streak } = useStore();

  const handleBackup = () => {
    vibrate(50);
    console.log("Exporting JSON backup...");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="space-y-6 pb-24"
    >
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-monk-textMain tracking-tight">Monk Profile</h1>
      </header>

      {/* Identity Card */}
      <div className="matte-card p-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-monk-bg rounded-2xl flex items-center justify-center text-monk-olive border-2 border-monk-sand/30">
          <User size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-monk-textMain">Het Keraliya</h2>
          <p className="text-sm text-monk-muted font-medium flex items-center gap-1 mt-1">
            <ShieldCheck size={14} /> 11th Standard • JEE Aspirant
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="matte-card p-4 flex flex-col items-center text-center">
          <Flame className="text-orange-500 mb-2" size={24} />
          <span className="text-2xl font-bold text-monk-dark">{streak}</span>
          <span className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Day Streak</span>
        </div>
        <div className="matte-card p-4 flex flex-col items-center text-center">
          <Award className="text-monk-olive mb-2" size={24} />
          <span className="text-2xl font-bold text-monk-dark">{xp}</span>
          <span className="text-[10px] font-bold text-monk-muted uppercase tracking-widest">Total XP</span>
        </div>
      </div>

      {/* Data Management Section */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-[0.2em] pl-1">Data & Security</h3>
        
        <div className="space-y-2">
          <button 
            onClick={handleBackup}
            className="w-full matte-card p-4 flex items-center justify-between active:bg-monk-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download size={20} className="text-monk-muted" />
              <span className="font-bold text-sm text-monk-textMain">Export JSON Backup</span>
            </div>
            <Settings size={16} className="text-monk-sand" />
          </button>

          <button className="w-full matte-card p-4 flex items-center justify-between active:bg-monk-bg transition-colors">
            <div className="flex items-center gap-3">
              <Upload size={20} className="text-monk-muted" />
              <span className="font-bold text-sm text-monk-textMain">Restore from File</span>
            </div>
            <Settings size={16} className="text-monk-sand" />
          </button>
        </div>
      </section>

      {/* Study Settings */}
      <section className="space-y-3">
        <h3 className="text-[10px] font-bold text-monk-muted uppercase tracking-[0.2em] pl-1">Monk Settings</h3>
        <div className="matte-card p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-monk-muted" />
              <span className="text-sm font-bold text-monk-textMain">Focus Duration</span>
            </div>
            <span className="text-sm font-bold text-monk-olive">25m</span>
          </div>
          <div className="h-[1px] bg-monk-bg w-full" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Award size={18} className="text-monk-muted" />
              <span className="text-sm font-bold text-monk-textMain">Haptic Feedback</span>
            </div>
            <div className="w-10 h-5 bg-monk-olive rounded-full relative">
              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
