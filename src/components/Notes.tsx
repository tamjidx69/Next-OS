import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, FileText, Trash2, Calendar, MoreHorizontal, Edit3 } from 'lucide-react';
import { Note } from '../types';
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

export default function Notes() {
  const { user } = useFirebase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noteData: Note[] = [];
      snapshot.forEach((doc) => {
        noteData.push({ id: doc.id, ...doc.data() } as Note);
      });
      setNotes(noteData);
      if (noteData.length > 0 && !selectedNoteId) {
        setSelectedNoteId(noteData[0].id);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });

    return () => unsubscribe();
  }, [user]);

  const addNote = async () => {
    if (!user) return;
    const newNote = {
      userId: user.uid,
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    try {
      const docRef = await addDoc(collection(db, 'notes'), newNote);
      setSelectedNoteId(docRef.id);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'notes');
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      await updateDoc(doc(db, 'notes', id), { ...updates, updatedAt: Date.now() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notes/${id}`);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      if (selectedNoteId === id) {
        setSelectedNoteId(notes.find(n => n.id !== id)?.id || null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notes/${id}`);
    }
  };

  const activeNote = notes.find(n => n.id === selectedNoteId);
  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex mac-card border-none bg-transparent shadow-none overflow-hidden reveal">
      {/* Scrollable Sidebar List */}
      <div className="w-80 border-r border-white/5 flex flex-col shrink-0 glass shadow-2xl relative z-20">
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-visible tracking-tighter">Notes</h1>
            <button 
              onClick={addNote}
              className="p-2 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30 active:scale-95"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-200 dark:bg-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 text-visible border border-transparent focus:bg-slate-100 dark:focus:bg-white/10 transition-all shadow-inner"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-10 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note, idx) => (
              <motion.button
                key={note.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full text-left p-5 rounded-[2rem] transition-all relative group overflow-hidden ${
                  selectedNoteId === note.id 
                    ? 'bg-indigo-600 shadow-2xl shadow-indigo-500/30 scale-[1.02]' 
                    : 'hover:bg-indigo-50 dark:hover:bg-white/5 hover:scale-[1.01]'
                }`}
              >
                <div className="relative z-10">
                  <h3 className={`font-black text-sm truncate mb-1.5 ${
                    selectedNoteId === note.id ? 'text-white' : 'text-visible'
                  }`}>
                    {note.title || 'Draft Concept'}
                  </h3>
                  <p className={`text-xs truncate mb-3 font-bold ${
                    selectedNoteId === note.id ? 'text-indigo-100/80' : 'text-slate-500'
                  }`}>
                    {note.content || 'Start defining your vision...'}
                  </p>
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                    selectedNoteId === note.id ? 'text-indigo-200' : 'text-slate-600'
                  }`}>
                    <Calendar size={10} strokeWidth={3} />
                    {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                {selectedNoteId === note.id && (
                  <motion.div 
                    layoutId="active-note-bg"
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 pointer-events-none"
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Editor Surface */}
      <div className="flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {activeNote ? (
            <motion.div 
              key={activeNote.id}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col h-full bg-white/0 backdrop-blur-3xl"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <div className="flex-1 max-w-3xl">
                  <input 
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    placeholder="Core Concept"
                    className="bg-transparent text-5xl font-black text-visible outline-none w-full placeholder:text-slate-400 dark:placeholder:text-white/10 tracking-tighter"
                  />
                  <div className="flex items-center gap-6 mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <span className="flex items-center gap-2">
                      <Edit3 size={12} className="text-indigo-500" />
                      Updated {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-3 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all mac-card shadow-none border-transparent bg-transparent">
                    <MoreHorizontal size={24} />
                  </button>
                  <button 
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-3 rounded-2xl text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto h-full">
                  <textarea 
                    value={activeNote.content}
                    onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                    placeholder="Unfold your strategy..."
                    className="w-full h-full bg-transparent text-slate-700 dark:text-slate-300 outline-none resize-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-white/5 text-2xl font-bold selection:bg-indigo-500/20"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border border-slate-200 dark:border-white/5">
                  <FileText size={48} className="text-slate-400 dark:text-white/20" />
                </div>
                <div className="space-y-2">
                  <p className="font-black tracking-tighter text-3xl text-visible">Your Workspace Awaits</p>
                  <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Select a concept to begin</p>
                </div>
                <button 
                  onClick={addNote}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30 active:scale-95"
                >
                  Create New Concept
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
