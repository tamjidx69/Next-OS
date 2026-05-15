import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Zap, FileText, CheckSquare, Target, Activity } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';

export default function Spotlight() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl mac-card bg-white/90 backdrop-blur-2xl border border-white/40 shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden"
      >
        <div className="p-4 flex items-center gap-4 border-b border-slate-100">
          <Search size={24} className="text-slate-400" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search files, tasks, or ask Gemini..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-xl font-medium outline-none text-slate-800 placeholder:text-slate-300"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 glass rounded-lg text-[10px] text-slate-400 font-black">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>

        <div className="p-4 max-h-[400px] overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 mb-4">Quick Actions</p>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all text-slate-600 group">
              <Zap size={18} className="group-hover:text-white text-blue-500" />
              <span className="font-bold text-sm">Start Focus Session</span>
              <span className="ml-auto text-[10px] opacity-40 font-black">ACTION</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all text-slate-600 group">
              <CheckSquare size={18} className="group-hover:text-white text-amber-500" />
              <span className="font-bold text-sm">Create New Task</span>
              <span className="ml-auto text-[10px] opacity-40 font-black">DATA</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all text-slate-600 group">
              <FileText size={18} className="group-hover:text-white text-emerald-500" />
              <span className="font-bold text-sm">New Brain Dump</span>
              <span className="ml-auto text-[10px] opacity-40 font-black">DATA</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100">
          <div className="flex gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>NextOS Spotlight</span>
        </div>
      </motion.div>
    </div>
  );
}
