import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cloud, Clock, CheckCircle2, Zap, Bot, Target, Activity } from 'lucide-react';
import { Task, Goal, Habit } from '../types';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface DashboardProps {
  onEnterFocusMode?: () => void;
  onShowAuth?: () => void;
}

export default function Dashboard({ onEnterFocusMode, onShowAuth }: DashboardProps) {
  const { user, isGuest, guestId } = useFirebase();
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    pendingTasks: 3,
    activeGoals: 1,
    dailyHabitsCount: 5,
    focusSessionsToday: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    const hour = time.getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    return () => clearInterval(timer);
  }, [time]);

  useEffect(() => {
    if (!user && !isGuest) return;
    const uid = user?.uid || guestId;

    const qTasks = query(collection(db, 'tasks'), where('userId', '==', uid), where('completed', '==', false));
    const unsubTasks = onSnapshot(qTasks, (s) => setStats(prev => ({ ...prev, pendingTasks: s.size })), (e) => {
      // For guests, we don't handleFirestoreError as they might not have permissions
      if (!isGuest) handleFirestoreError(e, OperationType.LIST, 'tasks');
    });

    const qGoals = query(collection(db, 'goals'), where('userId', '==', uid));
    const unsubGoals = onSnapshot(qGoals, (s) => setStats(prev => ({ ...prev, activeGoals: s.size })), (e) => {
      if (!isGuest) handleFirestoreError(e, OperationType.LIST, 'goals');
    });

    const qHabits = query(collection(db, 'habits'), where('userId', '==', uid));
    const unsubHabits = onSnapshot(qHabits, (s) => setStats(prev => ({ ...prev, dailyHabitsCount: s.size })), (e) => {
      if (!isGuest) handleFirestoreError(e, OperationType.LIST, 'habits');
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const qSessions = query(
      collection(db, 'focusSessions'), 
      where('userId', '==', uid),
      where('completedAt', '>=', today.getTime()),
      where('type', '==', 'focus')
    );
    const unsubSessions = onSnapshot(qSessions, (s) => setStats(prev => ({ ...prev, focusSessionsToday: s.size })), (e) => {
      if (!isGuest) handleFirestoreError(e, OperationType.LIST, 'focusSessions');
    });

    return () => { unsubTasks(); unsubGoals(); unsubHabits(); unsubSessions(); };
  }, [user, isGuest, guestId]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 reveal">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]"
          >
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl font-black text-visible tracking-tighter"
          >
            {greeting}, {user?.displayName?.split(' ')[0] || 'User'}
          </motion.h1>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2 text-slate-500 mb-1 font-black text-xs uppercase tracking-widest">
            <Cloud size={14} className="text-indigo-400" />
            <span>Mostly Cloudy · 72°F</span>
          </div>
          <span className="text-6xl font-black text-visible tracking-tighter">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
      </header>
      
      {isGuest && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mac-card p-8 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6 group"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white dark:bg-[#0F0F10] rounded-3xl flex items-center justify-center shadow-xl text-indigo-500 border border-indigo-500/20">
              <Zap size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-visible tracking-tight">Guest Mode Active</h3>
              <p className="text-slate-500 font-bold text-sm">Your neural data is stored locally but not synced to the cloud. Unlock permanent sync to secure your progress.</p>
            </div>
          </div>
          <button 
            onClick={onShowAuth}
            className="w-full md:w-fit bg-indigo-500 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Unlock Global Sync
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="mac-card p-10 flex flex-col justify-between h-72 bg-gradient-to-br from-indigo-700 to-violet-800 border-none relative overflow-hidden group shadow-2xl shadow-indigo-500/30"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700 group-hover:rotate-12">
            <Zap size={200} strokeWidth={1} className="text-white" />
          </div>
          <div className="relative z-10 text-white">
            <h3 className="text-indigo-200 font-black uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
              <Zap size={14} className="fill-indigo-300" /> System Focus
            </h3>
            <p className="text-4xl font-black leading-none tracking-tighter">Eliminate<br/>Distractions.</p>
          </div>
          <button 
            onClick={onEnterFocusMode}
            className="relative z-10 w-fit bg-white text-indigo-700 text-xs font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-2xl hover:bg-indigo-50 active:scale-95"
          >
            Enter Deep Work
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="mac-card p-10 h-72 flex flex-col justify-between shadow-2xl"
        >
          <div>
            <h3 className="text-slate-500 font-black mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
              <CheckCircle2 size={12} className="text-indigo-400" /> Task Momentum
            </h3>
            <div className="flex items-baseline gap-3">
              <span className="text-8xl font-black text-visible tracking-tighter">{stats.pendingTasks}</span>
              <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Remaining</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: stats.pendingTasks > 0 ? '65%' : '100%' }}
              className="bg-indigo-500 h-full shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="mac-card p-10 h-72 flex flex-col justify-between shadow-2xl"
        >
          <div>
            <h3 className="text-slate-500 font-black mb-8 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
              <Target size={12} className="text-violet-400" /> Strategic Goals
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-visible font-black text-sm">
                <span className="opacity-60 uppercase tracking-widest text-[10px]">Active Targets</span>
                <span className="text-2xl text-violet-400 tracking-tighter">{stats.activeGoals}</span>
              </div>
              <div className="flex justify-between items-center text-visible font-black text-sm">
                <span className="opacity-60 uppercase tracking-widest text-[10px]">Habit Pulse</span>
                <span className="text-2xl text-rose-400 tracking-tighter">{stats.dailyHabitsCount}</span>
              </div>
              <div className="flex justify-between items-center text-visible font-black text-sm pt-4 border-t border-white/5">
                <span className="opacity-60 uppercase tracking-widest text-[10px]">Neural Sessions</span>
                <span className="text-2xl text-emerald-400 tracking-tighter">{stats.focusSessionsToday}</span>
              </div>
            </div>
          </div>
          <span className="text-slate-600 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">NextOS Analytics Engine</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mac-card p-10 shadow-2xl"
        >
          <h2 className="text-2xl font-black text-visible mb-8 flex items-center gap-3">
             <Activity size={24} className="text-rose-500" /> Cognitive Insight
          </h2>
          <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-8 border border-slate-200 dark:border-white/5 space-y-6">
            <p className="text-slate-700 dark:text-slate-300 text-lg font-bold leading-relaxed">
              Your "Neural Deep Work" frequency has increased by 12% since last week. You are most effective when starting tasks before 09:30.
            </p>
            <div className="flex gap-3">
              <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Optimized</span>
              <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Neural Peak</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mac-card p-10 bg-slate-900 dark:bg-slate-950 flex flex-col justify-center items-center text-center space-y-8"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40">
            <Bot size={40} />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white tracking-tight">Need a Strategy?</h2>
            <p className="text-slate-400 text-lg font-bold max-w-xs mx-auto">
              Ask Gemini to neutralize distractions or reorganize your neural pathways.
            </p>
          </div>
          <button className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] hover:tracking-[0.6em] transition-all">
            Consult NextOS Artificial Intelligence →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
