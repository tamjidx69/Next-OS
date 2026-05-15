/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import TopBar from './components/TopBar';
import Dock from './components/Dock';
import Dashboard from './components/Dashboard';
import TasksView from './components/Tasks';
import NotesView from './components/Notes';
import HabitsView from './components/Habits';
import GoalsView from './components/Goals';
import SettingsView from './components/Settings';
import PricingView from './components/Pricing';
import AIAssistant from './components/AIAssistant';
import Spotlight from './components/Spotlight';
import FocusTimer from './components/FocusTimer';
import { ViewType } from './types';
import { LogIn, Zap, Cpu, Check } from 'lucide-react';
import { db } from './lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

function ZenLayout() {
  const { user, login, loading } = useFirebase();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success' && user) {
      const updateProStatus = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, { isPro: true }, { merge: true });
          setShowToast('Neural Workspace Upgraded to Pro');
          setTimeout(() => setShowToast(null), 5000);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Failed to update Pro status:', err);
        }
      };
      updateProStatus();
    } else if (params.get('payment') === 'fail') {
      setShowToast('Subscription Transfer Failed');
      setTimeout(() => setShowToast(null), 5000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-mesh flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-4 text-slate-800"
        >
          <Zap size={48} className="fill-slate-800" />
          <span className="font-bold tracking-widest text-sm uppercase">Loading NextOS</span>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-mesh flex items-center justify-center p-6 bg-slate-900 transition-colors duration-700">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mac-card max-w-lg w-full p-16 text-center space-y-10 bg-white/90 dark:bg-black/90"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="w-24 h-24 bg-slate-900 dark:bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              <Cpu size={48} className="text-white dark:text-black" />
            </motion.div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">NextOS</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed max-w-sm mx-auto">
              The minimalist workspace for deep work and strategic thinking.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={login}
              className="w-full flex items-center justify-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-black py-5 rounded-[2rem] font-black text-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.98] group"
            >
              <LogIn size={24} className="group-hover:translate-x-1 transition-transform" />
              Unlock Workspace
            </button>
            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">
              Powered by Cloud Sync & Gemini AI
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard onEnterFocusMode={() => setIsFocusMode(true)} />;
      case 'tasks': return <TasksView />;
      case 'notes': return <NotesView />;
      case 'habits': return <HabitsView />;
      case 'goals': return <GoalsView />;
      case 'settings': return <SettingsView onShowPricing={() => setActiveView('pricing')} />;
      case 'pricing': return <PricingView />;
      case 'ai': return <AIAssistant />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen bg-mesh overflow-hidden relative transition-colors duration-500">
      <TopBar />

      {/* Global Pro Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[100] px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 border border-white/20"
          >
            <Check size={16} strokeWidth={3} />
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-400/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-sky-400/20 blur-[140px] rounded-full pointer-events-none" />

      <main className="h-full w-full pt-12 pb-24 px-8 overflow-y-auto custom-scrollbar relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Dock activeView={activeView} setActiveView={setActiveView} />
      <Spotlight />
      <AnimatePresence>
        {isFocusMode && <FocusTimer isOpen={isFocusMode} onClose={() => setIsFocusMode(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FirebaseProvider>
        <ZenLayout />
      </FirebaseProvider>
    </ThemeProvider>
  );
}
