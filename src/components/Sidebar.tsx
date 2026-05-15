import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, CheckSquare, FileText, Bot, Settings, LogOut } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={18} /> },
  { id: 'notes', label: 'Notes', icon: <FileText size={18} /> },
  { id: 'ai', label: 'AI Assistant', icon: <Bot size={18} /> },
];

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-64 h-full glass border-r border-slate-200/50 flex flex-col p-4 z-20">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="flex gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-500/50" />
          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500/50" />
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-emerald-500/50" />
        </div>
        <span className="font-semibold text-slate-800 tracking-tight ml-4">NextOS</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
              activeView === item.id 
                ? 'text-blue-600 bg-blue-500/10' 
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            {activeView === item.id && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-blue-500/10 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={`relative z-10 ${activeView === item.id ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
              {item.icon}
            </span>
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-200/50 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-all">
          <Settings size={18} className="text-slate-500" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-500/10 hover:text-red-600 transition-all">
          <LogOut size={18} className="text-slate-500 group-hover:text-red-600" />
          <span>Exit</span>
        </button>
      </div>
    </aside>
  );
}
