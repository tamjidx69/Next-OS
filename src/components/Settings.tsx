import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, Bell, Palette, Globe, LogOut, ChevronRight, 
  Settings as SettingsIcon, Trash2, Database, Check, X, CreditCard, Zap, Star
} from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsProps {
  onShowAuth: () => void;
}

export default function Settings({ onShowAuth }: SettingsProps) {
  const { user, logout, updateUserProfile } = useFirebase();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [securityLevel, setSecurityLevel] = useState('High');
  const [language, setLanguage] = useState('English (US)');
  const [showToast, setShowToast] = useState<string | null>(null);

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editPhoto, setEditPhoto] = useState(user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: editName,
        photoURL: editPhoto
      });
      triggerToast('Profile updated successfully');
      setIsEditingProfile(false);
    } catch (error) {
      triggerToast('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemClick = (label: string) => {
    switch (label) {
      case 'Appearance':
        toggleTheme();
        triggerToast(`Theme switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
        break;
      case 'Notifications':
        setNotifications(!notifications);
        triggerToast(`Notifications ${!notifications ? 'Enabled' : 'Disabled'}`);
        break;
      case 'Privacy & Security':
        const levels = ['Standard', 'High', 'Maximum'];
        const next = levels[(levels.indexOf(securityLevel) + 1) % levels.length];
        setSecurityLevel(next);
        triggerToast(`Security Level set to ${next}`);
        break;
      case 'Language & Region':
        const langs = ['English (US)', 'German', 'Japanese', 'System Default'];
        const nextLang = langs[(langs.indexOf(language) + 1) % langs.length];
        setLanguage(nextLang);
        triggerToast(`Language updated to ${nextLang}`);
        break;
      case 'Profile Information':
        setIsEditingProfile(true);
        break;
      default:
        triggerToast(`${label} settings updated`);
    }
  };

  const sections = [
    {
      title: 'Personalization',
      items: [
        { icon: User, label: 'Profile Information', value: user?.displayName, color: 'text-blue-500' },
        { icon: Palette, label: 'Appearance', value: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Mode`, color: 'text-violet-500' },
        { icon: Globe, label: 'Language & Region', value: language, color: 'text-emerald-500' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Bell, label: 'Notifications', value: notifications ? 'Enabled' : 'DND Mode', color: 'text-amber-500' },
        { icon: Shield, label: 'Privacy & Security', value: `${securityLevel} Protection`, color: 'text-rose-500' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 reveal text-white pb-32 relative">
      {/* Profile Edit Overlay */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="mac-card w-full max-w-md p-10 space-y-8 bg-white dark:bg-slate-900 border-none shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-visible tracking-tighter">Edit Neural Identity</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Sync with Global Network</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Display Name</label>
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 py-4 outline-none transition-all font-bold text-visible"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Avatar URL</label>
                  <input 
                    type="text"
                    value={editPhoto}
                    onChange={(e) => setEditPhoto(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 py-4 outline-none transition-all font-bold text-visible"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-200 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Syncing...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-12 left-1/2 z-[100] px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 border border-indigo-400/30"
          >
            <Check size={16} strokeWidth={3} />
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="space-y-3 px-4">
        <div className="flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">
          <SettingsIcon size={12} />
          <span>System Preference</span>
        </div>
        <h1 className="text-6xl font-black text-visible tracking-tighter">Control Center</h1>
      </header>

      <div className="grid grid-cols-1 gap-12 px-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600 px-4">{section.title}</h2>
            <div className="mac-card divide-y divide-slate-200 dark:divide-white/5 overflow-hidden">
              {section.items.map((item) => (
                <button 
                  key={item.label}
                  onClick={() => handleItemClick(item.label)}
                  className="w-full flex items-center justify-between p-7 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-visible group"
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-3.5 rounded-2xl bg-white dark:bg-[#0F0F10] border border-slate-200 dark:border-white/5 shadow-2xl ${item.color}`}>
                      <item.icon size={22} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm tracking-tight text-visible">{item.label}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1 opacity-80">{item.value}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 dark:text-slate-700 group-hover:text-indigo-500 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600 px-4">Workspace Management</h2>
          <div className="mac-card divide-y divide-slate-200 dark:divide-white/5">
            <button 
              onClick={() => triggerToast('Storage Optimized: 42MB Recovered')}
              className="w-full flex items-center justify-between p-7 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-visible group"
            >
              <div className="flex items-center gap-6">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F0F10] border border-slate-200 dark:border-white/5 shadow-2xl text-indigo-500">
                  <Database size={22} />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm tracking-tight text-visible">Optimize Storage</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Deep clean cache and artifacts</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 dark:text-slate-700 group-hover:text-indigo-500 dark:group-hover:text-white" />
            </button>
            <button 
              onClick={() => triggerToast('Requires Administrative Authorization')}
              className="w-full flex items-center justify-between p-7 hover:bg-rose-500/5 transition-all text-visible group"
            >
              <div className="flex items-center gap-6">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F0F10] border border-slate-200 dark:border-white/5 shadow-2xl text-rose-500">
                  <Trash2 size={22} />
                </div>
                <div className="text-left">
                  <p className="font-black text-sm tracking-tight text-rose-500">Wipe All Neural Data</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/40 mt-1">Irreversible wipe of all missions & concepts</p>
                </div>
              </div>
              <X size={20} className="text-rose-500/20 group-hover:text-rose-500" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600 px-4">Identity</h2>
          {user ? (
            <button 
              onClick={logout}
              className="w-full mac-card p-7 flex items-center justify-between hover:bg-rose-500/10 border-slate-200 dark:border-white/5 group transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F0F10] border border-slate-200 dark:border-white/5 shadow-2xl text-rose-500">
                  <LogOut size={22} />
                </div>
                <div className="text-left">
                  <p className="text-rose-500 font-black text-sm tracking-tight">Sign Out from NextOS</p>
                  <p className="text-rose-900/50 text-[10px] font-black tracking-widest mt-1">SECURED SESSION: {user.email}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-rose-900/40 group-hover:text-rose-500" />
            </button>
          ) : (
            <button 
              onClick={onShowAuth}
              className="w-full mac-card p-7 flex items-center justify-between hover:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 group transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F0F10] border border-slate-200 dark:border-white/5 shadow-2xl text-indigo-500">
                  <Globe size={22} />
                </div>
                <div className="text-left">
                  <p className="text-indigo-500 font-black text-sm tracking-tight">Sync Workspace Account</p>
                  <p className="text-indigo-900/50 text-[10px] font-black tracking-widest mt-1">GUEST SESSION: Persist your neuro-patterns</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-indigo-900/40 group-hover:text-indigo-500" />
            </button>
          )}
        </div>
      </div>
      
      <div className="text-center space-y-2 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-visible">
          NEXT OS ARCHITECTURE
        </p>
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">
          Build 2.8.5.FINAL // STABLE KERNEL
        </p>
      </div>
    </div>
  );
}

