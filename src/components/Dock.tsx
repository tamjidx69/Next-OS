import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Bot, 
  Activity, 
  Target,
  Search,
  Settings
} from 'lucide-react';
import { ViewType } from '../types';

interface DockProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const dockItems: { id: ViewType; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Neural Desktop', color: 'bg-indigo-600' },
  { id: 'tasks', icon: <CheckSquare size={24} />, label: 'Directives', color: 'bg-indigo-700' },
  { id: 'notes', icon: <FileText size={24} />, label: 'Concepts', color: 'bg-slate-700' },
  { id: 'habits', icon: <Activity size={24} />, label: 'Synthetics', color: 'bg-rose-600' },
  { id: 'goals', icon: <Target size={24} />, label: 'Missions', color: 'bg-violet-600' },
  { id: 'ai', icon: <Bot size={24} />, label: 'Core AI', color: 'bg-cyan-600' },
];

export default function Dock({ activeView, setActiveView }: DockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ backgroundColor: 'var(--dock-bg)' }}
        className="px-3 py-3 rounded-[2.5rem] flex items-end gap-2 border border-slate-200 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl"
      >
        {dockItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            whileHover={{ scale: 1.25, y: -15 }}
            whileTap={{ scale: 0.9 }}
            className={`relative group w-12 h-12 flex items-center justify-center rounded-[1rem] transition-all duration-200 ${
              activeView === item.id 
                ? 'shadow-lg shadow-indigo-500/20 brightness-110' 
                : 'hover:brightness-110'
            }`}
          >
            <div className={`absolute inset-0 rounded-[1rem] opacity-90 ${item.color} shadow-inner bg-gradient-to-br from-white/10 to-transparent`} />
            <div className="relative text-white drop-shadow-md">
              {item.icon}
            </div>
            
            {activeView === item.id && (
              <div className="absolute -bottom-2 w-1.5 h-1.5 bg-indigo-500 dark:bg-white rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)] dark:shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            )}

            {/* Tooltip */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 dark:bg-black/80 border border-slate-700 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl backdrop-blur-xl scale-90 group-hover:scale-100">
              {item.label}
            </div>
          </motion.button>
        ))}
        
        <div className="w-[1px] h-8 bg-slate-300 dark:bg-white/5 mx-1 mb-2" />

        <motion.button
          onClick={() => setActiveView('settings')}
          whileHover={{ scale: 1.25, y: -15 }}
          whileTap={{ scale: 0.9 }}
          className={`relative group w-12 h-12 flex items-center justify-center rounded-[1rem] transition-all shadow-inner ${
            activeView === 'settings' 
              ? 'bg-slate-200 dark:bg-white/20 text-indigo-600 dark:text-white' 
              : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-indigo-600 dark:hover:text-white'
          }`}
        >
          <Settings size={22} className="relative z-10" />
          {activeView === 'settings' && (
            <div className="absolute -bottom-2 w-1.5 h-1.5 bg-indigo-500 dark:bg-white rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)] dark:shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
          )}
          {/* Tooltip */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 dark:bg-black/80 border border-slate-700 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl backdrop-blur-xl scale-90 group-hover:scale-100">
            Internal Config
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}
