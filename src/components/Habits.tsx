import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, TrendingUp, Flame, Zap, PlusCircle } from 'lucide-react';
import { Habit } from '../types';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Habits() {
  const { user, isGuest, guestId } = useFirebase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  useEffect(() => {
    if (!user && !isGuest) return;
    const uid = user?.uid || guestId;

    const q = query(
      collection(db, 'habits'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitData: Habit[] = [];
      snapshot.forEach((doc) => {
        habitData.push({ id: doc.id, ...doc.data() } as Habit);
      });
      setHabits(habitData);
    }, (error) => {
      if (!isGuest) handleFirestoreError(error, OperationType.LIST, 'habits');
    });

    return () => unsubscribe();
  }, [user, isGuest, guestId]);

  const addHabit = async () => {
    const uid = user?.uid || guestId;
    if (!newHabitTitle.trim() || !uid) return;
    
    const newHabit = {
      userId: uid,
      title: newHabitTitle,
      streak: 0,
      lastCompleted: null,
      createdAt: Date.now()
    };
    
    try {
      await addDoc(collection(db, 'habits'), newHabit);
      setNewHabitTitle('');
    } catch (err) {
      if (!isGuest) handleFirestoreError(err, OperationType.CREATE, 'habits');
    }
  };

  const completeHabit = async (habit: Habit) => {
    const today = new Date().setHours(0, 0, 0, 0);
    if (habit.lastCompleted === today) return;

    try {
      await updateDoc(doc(db, 'habits', habit.id), {
        streak: habit.streak + 1,
        lastCompleted: today
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `habits/${habit.id}`);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'habits', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `habits/${id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 reveal">
      <header className="flex justify-between items-end mb-8 px-4">
        <div>
          <h1 className="text-5xl font-black text-visible tracking-tighter">Habits</h1>
          <p className="text-secondary-visible mt-2">Compound progress begins with small choices.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        <div className="space-y-6">
          <div className="relative group">
            <input 
              type="text" 
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              placeholder="Build a new habit..."
              className="w-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all text-visible font-bold shadow-2xl placeholder:text-slate-400 dark:placeholder:text-white/20"
            />
            <button 
              onClick={addHabit}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-600 text-white p-2.5 rounded-xl hover:bg-rose-700 transition-all active:scale-95 shadow-xl shadow-rose-500/20"
            >
              <PlusCircle size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {habits.map((habit) => (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mac-card p-6 group flex items-center justify-between hover:translate-x-2 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => completeHabit(habit)}
                      disabled={habit.lastCompleted === new Date().setHours(0, 0, 0, 0)}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        habit.lastCompleted === new Date().setHours(0, 0, 0, 0)
                          ? 'bg-rose-600 text-white shadow-2xl shadow-rose-500/30'
                          : 'bg-slate-200 dark:bg-white/5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 border border-transparent dark:border-white/5'
                      }`}
                    >
                      {habit.lastCompleted === new Date().setHours(0, 0, 0, 0) ? <CheckCircle2 size={28} /> : <Zap size={28} />}
                    </button>
                    <div>
                      <h3 className="font-black text-lg text-visible tracking-tight">{habit.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">
                        <span className="flex items-center gap-1.5 text-rose-500">
                          <Flame size={12} className="fill-rose-500" />
                          {habit.streak} Day Streak
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-8">
          <div className="mac-card p-10 bg-gradient-to-br from-rose-600 to-rose-800 text-white border-none space-y-8 shadow-2xl shadow-rose-900/40 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 opacity-10 rotate-12">
               <TrendingUp size={160} />
            </div>
            <h2 className="text-2xl font-black flex items-center gap-3 relative z-10">
              <TrendingUp size={28} /> Neural Momentum
            </h2>
            <div className="flex items-baseline gap-3 relative z-10">
              <span className="text-[8rem] font-black leading-none tracking-tighter">{habits.reduce((acc, h) => acc + h.streak, 0)}</span>
              <span className="text-rose-200 font-black uppercase tracking-[0.2em] text-xs">Total Accumulation</span>
            </div>
            <p className="text-rose-100/80 leading-relaxed text-sm font-bold max-w-xs relative z-10">
              Your neuroplasticity is increasing. Every completed habit rewires your future identity.
            </p>
          </div>

          <div className="mac-card p-8 border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Neural Insight</h2>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-500/50 border-t-emerald-500 animate-spin" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">
                Consistency is up <span className="text-emerald-500">14%</span> this week. <br/>Sunday is your highest completion node.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
