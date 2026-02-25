"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithRedirect,
  getRedirectResult 
} from 'firebase/auth';
import { Target } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Login() {
  const [mounted, setMounted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // New Diagnostic States
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState(''); 
  
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  // 1. Mount & Check Google Redirect
  useEffect(() => {
    setMounted(true);
    
    // THIS CATCHES THE GOOGLE LOGIN WHEN YOU RETURN TO THE PAGE
    setStatusText('Checking secure connection...');
    getRedirectResult(auth).then((result) => {
      if (result) {
        setStatusText('Google identity confirmed!');
      } else {
        setStatusText(''); // Clear text if no redirect happened
      }
    }).catch((error) => {
      setErrorMsg(`Google Error: ${error.message}`);
      setStatusText('');
    });
  }, []);

  // 2. Auto-Redirect to Dashboard
  useEffect(() => {
    if (mounted && isAuthenticated) {
      setStatusText('Access granted. Entering OS...');
      router.push('/');
    }
  }, [mounted, isAuthenticated, router]);

  const handleEmailAuth = async () => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    setErrorMsg('');
    
    // FIREBASE REQUIREMENT: Passwords must be 6+ chars
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setStatusText(isRegistering ? 'Creating Sanctuary on Firebase...' : 'Verifying credentials...');

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setStatusText('Success! Redirecting...');
    } catch (error: any) {
      // Print the exact reason it failed to the screen
      setErrorMsg(`FAILED: ${error.code.replace('auth/', '')}`);
      setLoading(false);
      setStatusText('');
      if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50]);
    }
  };

  const handleGoogleAuth = async () => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    setErrorMsg('');
    setLoading(true);
    setStatusText('Redirecting to Google...');

    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
      setErrorMsg(`Google Failed: ${error.message}`);
      setLoading(false);
      setStatusText('');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#E2E2E2] flex flex-col justify-center items-center p-6 selection:bg-[#ACAD94] selection:text-[#384D48]">
      <div className="w-full max-w-sm bg-[#FFFFFF] rounded-[24px] p-8 shadow-[0_8px_24px_rgba(56,77,72,0.08)]">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-[#384D48] rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Target className="text-[#ACAD94]" size={24} />
          </div>
          <h1 className="text-2xl font-black text-[#384D48] tracking-tight font-heading">STUDY MONK</h1>
          <p className="text-xs font-bold text-[#6E7271] uppercase tracking-widest mt-1">
            {isRegistering ? 'Initialize Sanctuary' : 'Access Protocol'}
          </p>
        </div>

        {/* DIAGNOSTIC MESSAGES */}
        {statusText && !errorMsg && (
          <div className="bg-[#F5F5F5] text-[#384D48] text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl mb-4 text-center animate-pulse">
            {statusText}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-[11px] font-bold px-4 py-3 rounded-xl mb-4 text-center border border-red-100">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-[#6E7271] uppercase tracking-widest mb-2 px-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="monk@study.com" 
              className="w-full bg-[#F5F5F5] border-2 border-transparent focus:border-[#ACAD94] text-[#111827] rounded-xl px-4 py-3.5 font-bold text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#6E7271] uppercase tracking-widest mb-2 px-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ Characters" 
              className="w-full bg-[#F5F5F5] border-2 border-transparent focus:border-[#ACAD94] text-[#111827] rounded-xl px-4 py-3.5 font-black text-lg outline-none transition-colors tracking-widest"
            />
          </div>

          <button 
            onClick={handleEmailAuth}
            disabled={loading}
            className="w-full bg-[#384D48] text-[#FFFFFF] rounded-xl py-4 font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-transform shadow-md mt-2 disabled:opacity-70"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Sanctuary' : 'Enter Sanctuary')}
          </button>

          <div className="text-center mt-2">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); setStatusText(''); }}
              className="text-[#6E7271] text-[11px] font-bold uppercase tracking-widest p-2 active:scale-95 transition-transform"
            >
              {isRegistering ? 'Already have access? Login' : 'Need a sanctuary? Create one'}
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#D8D4D5]"></div>
            <span className="flex-shrink-0 mx-4 text-[#6E7271] text-[10px] font-black uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-[#D8D4D5]"></div>
          </div>

          <button 
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-[#F5F5F5] text-[#384D48] border border-[#D8D4D5] rounded-xl py-3.5 font-black text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

      </div>
    </div>
  );
        }
                
