import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Search, Command, Zap, User, Sun, Moon } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useTheme } from '../contexts/ThemeContext';

export default function TopBar() {
  const [time, setTime] = useState(new Date());
  const { user, logout } = useFirebase();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <header className="h-7 glass flex items-center justify-between px-4 text-[10px] font-black uppercase tracking-widest fixed top-0 w-full z-50 transition-all duration-500 border-none bg-transparent">
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-1.5 cursor-default group">
          <Zap size={14} className="fill-indigo-500 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="text-visible opacity-80">NextOS</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-500">
          <span className="cursor-default hover:text-visible transition-colors">File</span>
          <span className="cursor-default hover:text-visible transition-colors">Neural</span>
          <span className="cursor-default hover:text-visible transition-colors">Window</span>
          <span className="cursor-default hover:text-visible transition-colors">View</span>
        </div>
      </div>

      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-4 text-slate-500">
          <button 
            onClick={toggleTheme}
            className="p-1 hover:text-visible transition-all duration-300 active:scale-90"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={14} strokeWidth={3} /> : <Sun size={14} strokeWidth={3} />}
          </button>
          <Wifi size={14} strokeWidth={3} />
          <Battery size={14} strokeWidth={3} />
          <Search size={14} strokeWidth={3} className="cursor-pointer hover:text-visible transition-colors" />
          <button onClick={logout} className="flex items-center gap-2 hover:text-visible transition-colors">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-4 h-4 rounded-full border border-white/20" alt="avatar" />
            ) : (
              <User size={14} strokeWidth={3} />
            )}
            <span>{user?.displayName?.split(' ')[0]}</span>
          </button>
        </div>
        <span className="cursor-default select-none text-slate-500 font-black">
          {formatTime(time)}
        </span>
      </div>
    </header>
  );
}
