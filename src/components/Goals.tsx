import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Target, Trash2, Milestone, ChevronRight, Award, PlusCircle } from 'lucide-react';
import { Goal } from '../types';
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

export default function Goals() {
  const { user } = useFirebase();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(100);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'goals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalData: Goal[] = [];
      snapshot.forEach((doc) => {
        goalData.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(goalData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'goals');
    });

    return () => unsubscribe();
  }, [user]);

  const addGoal = async () => {
    if (!newGoalTitle.trim() || !user) return;
    
    const newGoal = {
      userId: user.uid,
      title: newGoalTitle,
      target: newGoalTarget,
      current: 0,
      createdAt: Date.now()
    };
    
    try {
      await addDoc(collection(db, 'goals'), newGoal);
      setNewGoalTitle('');
      setNewGoalTarget(100);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'goals');
    }
  };

  const updateProgress = async (goal: Goal, increment: number) => {
    const nextValue = Math.min(goal.target, Math.max(0, goal.current + increment));
    try {
      await updateDoc(doc(db, 'goals', goal.id), { current: nextValue });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `goals/${goal.id}`);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `goals/${id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 reveal pb-32">
      <header className="flex justify-between items-end mb-8 px-4">
        <div>
          <h1 className="text-5xl font-black text-visible tracking-tighter">Mission Control</h1>
          <p className="text-secondary-visible mt-2">Track your major milestones and strategic outcomes.</p>
        </div>
      </header>

      <div className="flex flex-col gap-10 px-4">
        <div className="mac-card p-12 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <Target size={240} strokeWidth={1} />
          </div>
          <div className="relative z-10 max-w-xl space-y-8">
            <h2 className="text-3xl font-black tracking-tight">Launch a new initiative</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Core Mission Name"
                className="flex-1 bg-white/10 border border-white/10 rounded-[1.5rem] px-8 py-5 outline-none placeholder:text-indigo-200/50 font-bold focus:bg-white/20 transition-all shadow-inner"
              />
              <div className="flex gap-4">
                <input 
                  type="number" 
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(parseInt(e.target.value))}
                  className="w-24 bg-white/10 border border-white/10 rounded-[1.5rem] px-4 py-5 outline-none font-black text-center focus:bg-white/20 transition-all shadow-inner"
                />
                <button 
                  onClick={addGoal}
                  className="bg-white text-indigo-900 p-5 rounded-[1.5rem] font-black hover:bg-white/90 transition-all shadow-2xl active:scale-95 border-none"
                >
                  <Plus size={28} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {goals.map((goal, idx) => (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="mac-card p-8 flex flex-col space-y-8 hover:translate-y-[-4px] transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 text-indigo-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5">
                      <Milestone size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-visible tracking-tight leading-tight">{goal.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1.5">Strategic Outcome</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/5 transition-all rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-4xl font-black text-visible tracking-tighter">
                      {Math.round((goal.current / goal.target) * 100)}%
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      {goal.current} / {goal.target} units
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-300 dark:border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => updateProgress(goal, -1)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-slate-200 dark:border-white/5"
                  >
                    - Reduce
                  </button>
                  <button 
                    onClick={() => updateProgress(goal, 1)}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 border-none"
                  >
                    + Progress
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {goals.length === 0 && (
            <div className="col-span-2 text-center py-20 bg-slate-100/30 rounded-3xl border-2 border-dashed border-slate-200">
              <Award size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold tracking-tight">No goals defined yet. Reach for the stars.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
