import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Search, Filter, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Task } from '../types';
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

export default function Tasks() {
  const { user, isGuest, guestId } = useFirebase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (!user && !isGuest) return;
    const uid = user?.uid || guestId;

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData: Task[] = [];
      snapshot.forEach((doc) => {
        taskData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(taskData);
    }, (error) => {
      if (!isGuest) handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    return () => unsubscribe();
  }, [user, isGuest, guestId]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = user?.uid || guestId;
    if (!newTaskText.trim() || (!user && !isGuest)) return;
    
    const newTask = {
      userId: uid,
      text: newTaskText,
      completed: false,
      priority: 'medium',
      createdAt: Date.now()
    };
    
    try {
      await addDoc(collection(db, 'tasks'), newTask);
      setNewTaskText('');
    } catch (err) {
      if (!isGuest) handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { completed: !completed });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 reveal">
      <header className="flex justify-between items-end mb-8 px-4">
        <div>
          <h1 className="text-5xl font-black text-visible tracking-tighter">Tasks</h1>
          <p className="text-secondary-visible mt-2">Manage your workflow with NextOS Precision.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter brainwaves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 w-48 shadow-2xl transition-all focus:w-72 text-visible"
            />
          </div>
          <button className="p-3.5 rounded-2xl mac-card bg-slate-200 dark:bg-white/5 text-visible transition-all border-none">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <form onSubmit={addTask} className="relative group">
          <input 
            type="text" 
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What's the next variable for success?"
            className="w-full bg-slate-200 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-3xl px-10 py-7 outline-none transition-all text-xl font-bold text-visible placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-2xl group-focus-within:shadow-indigo-500/5"
          />
          <button 
            type="submit"
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30 active:scale-95"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </form>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 200, damping: 25 }}
                className="mac-card group flex items-center justify-between p-6 hover:translate-x-2 transition-all cursor-default"
              >
                <div className="flex items-center gap-6 flex-1">
                  <button 
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={`transition-all h-8 w-8 flex items-center justify-center rounded-2xl border-2 shrink-0 ${
                      task.completed 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/30' 
                        : 'border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:border-indigo-400 hover:scale-110'
                    }`}
                  >
                    {task.completed && <CheckCircle2 size={18} strokeWidth={3} />}
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-lg font-black transition-all tracking-tight ${
                      task.completed ? 'text-slate-400 dark:text-white/30 line-through' : 'text-visible'
                    }`}>
                      {task.text}
                    </span>
                    <div className="flex items-center gap-4 mt-1.5 text-[10px] uppercase font-black tracking-widest">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock size={12} className="text-indigo-500" />
                        Today
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg ${
                        task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : 
                        task.priority === 'medium' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-200 dark:bg-white/5 text-slate-500'
                      }`}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button className="p-2 text-slate-500 hover:text-visible hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl transition-all">
                    <CalendarIcon size={18} />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredTasks.length === 0 && searchQuery && (
            <div className="text-center py-20 bg-slate-100 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
              <p className="text-slate-500 font-medium">No tasks match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
