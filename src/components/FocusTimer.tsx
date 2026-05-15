import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, X, Volume2, TreePine, Moon, Target } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FocusTimer({ isOpen, onClose }: FocusTimerProps) {
  const { user, isGuest, guestId } = useFirebase();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    if (!user && !isGuest) return;
    const uid = user?.uid || guestId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'focusSessions'),
      where('userId', '==', uid),
      where('completedAt', '>=', today.getTime()),
      where('type', '==', 'focus')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessionCount(snapshot.size);
    }, (error) => {
      if (!isGuest) handleFirestoreError(error, OperationType.LIST, 'focusSessions');
    });

    return () => unsubscribe();
  }, [user, isGuest, guestId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionComplete = async () => {
    const uid = user?.uid || guestId;
    if (!uid) return;

    const session = {
      userId: uid,
      duration: mode === 'focus' ? 25 : 5,
      type: mode,
      completedAt: Date.now()
    };

    try {
      await addDoc(collection(db, 'focusSessions'), session);
      // Play sound notification
      if (typeof window !== 'undefined') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      }
    } catch (err) {
      if (!isGuest) handleFirestoreError(err, OperationType.CREATE, 'focusSessions');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#0A0A0B] flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,hsla(250,50%,30%,0.3)_0,transparent_60%)]"
        />
      </div>

      <div className="absolute top-12 left-12 flex items-center gap-4 text-white/40">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md">
          <Target size={16} className="text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Sessions: {sessionCount}</span>
        </div>
      </div>

      <button 
        onClick={onClose}
        className="absolute top-12 right-12 p-4 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-all active:scale-95 border border-transparent hover:border-white/10"
      >
        <X size={24} />
      </button>

      <div className="relative text-center space-y-16">
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="space-y-6"
        >
          <div className="flex items-center justify-center gap-3 text-indigo-400 font-black uppercase tracking-[0.4em] text-xs">
            {mode === 'focus' ? <TreePine size={20} /> : <Moon size={20} />}
            <span>{mode === 'focus' ? 'Deep Work Mission' : 'Neural Recovery'}</span>
          </div>
          <h1 className="text-[18rem] md:text-[22rem] font-black text-white tracking-tighter leading-none select-none drop-shadow-[0_20px_100px_rgba(255,255,255,0.05)]">
            {formatTime(timeLeft)}
          </h1>
        </motion.div>

        <div className="flex items-center justify-center gap-12">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            <RotateCcw size={28} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, shadow: '0 0 80px rgba(255,255,255,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className="w-32 h-32 rounded-[2.5rem] bg-white text-slate-950 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all"
          >
            {isActive ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            <Volume2 size={28} />
          </motion.button>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
            className={`px-10 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all ${mode === 'focus' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            Focus Session
          </button>
          <button 
           onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
            className={`px-10 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all ${mode === 'break' ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            Peaceful Break
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-4">
        <p className="text-white/10 font-black uppercase tracking-[0.3em] text-xs">
          NextOS Immersive Neural Engine
        </p>
        <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </motion.div>
  );
}
