import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { askGemini } from '../lib/gemini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Core AI. How can I help you optimize your neural workspace today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askGemini(userMessage, "You are a helpful, professional, and refined AI assistant built into NextOS, a minimalist workspace application. Your tone is calm, efficient, and encouraging. Keep responses concise and formatted with clean markdown. You are the 'Core AI' of this system.");
      setMessages(prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't generate a response." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Please ensure your Gemini API key is configured correctly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Neural context cleared. Initiating fresh session." }]);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-8 reveal">
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-visible tracking-tight">Core AI</h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-0.5">Gemini Processing Unit</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 rounded-xl text-slate-500 hover:text-visible hover:bg-slate-200 dark:hover:bg-white/5 transition-all"
        >
          <RotateCcw size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col mac-card border-none shadow-2xl p-0 h-[calc(100vh-250px)]">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
        >
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${
                msg.role === 'assistant' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-200 dark:bg-white/10 text-visible'
              }`}>
                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 text-sm font-bold leading-relaxed shadow-sm ${
                msg.role === 'assistant'
                  ? 'bg-slate-100 dark:bg-white/5 text-visible rounded-tl-none border border-slate-200 dark:border-white/5'
                  : 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-6"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="bg-slate-100 dark:bg-white/5 rounded-[1.5rem] px-6 py-4 rounded-tl-none flex gap-1.5 items-center border border-slate-200 dark:border-white/5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-8 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 backdrop-blur-3xl shrink-0">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject neural directive..."
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 pr-16 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-visible shadow-inner"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-500/30 active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

