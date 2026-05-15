import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Star, Shield, Cpu, Users, BarChart3, Globe, Rocket, HelpCircle } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';

interface PackageProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  onSelect: () => void;
  isLoading?: boolean;
}

function PricingCard({ name, price, description, features, isPopular, buttonText, onSelect, isLoading }: PackageProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`relative p-8 rounded-[2.5rem] transition-all duration-500 border-2 ${
        isPopular 
          ? 'bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.4)] text-white' 
          : 'bg-white dark:bg-[#0F0F10] border-slate-200 dark:border-white/5 text-slate-900 dark:text-white hover:shadow-2xl'
      }`}
    >
      {isPopular && (
        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ring-1 ring-white/30">
          Most Popular
        </div>
      )}

      <div className="space-y-2 mb-8">
        <h3 className="text-2xl font-black tracking-tight">{name}</h3>
        <p className={`${isPopular ? 'text-indigo-100' : 'text-slate-500'} text-xs font-bold uppercase tracking-wider`}>
          {description}
        </p>
      </div>

      <div className="mb-10">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black tracking-tighter">{price}</span>
          {price !== 'Free' && <span className="text-sm font-bold opacity-60">/ lifetime</span>}
        </div>
      </div>

      <div className="space-y-4 mb-10 min-h-[300px]">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <div className={`p-1 rounded-full mt-1 ${isPopular ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-500/10'}`}>
              <Check size={14} className={isPopular ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'} />
            </div>
            <span className={`text-sm font-medium leading-relaxed ${isPopular ? 'text-indigo-50' : 'text-slate-600 dark:text-slate-400'}`}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onSelect}
        disabled={isLoading || price === 'Current'}
        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${
          isPopular
            ? 'bg-white text-indigo-700 hover:bg-slate-100 shadow-xl'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
        } disabled:opacity-50`}
      >
        {isLoading ? 'Processing...' : buttonText}
      </button>
    </motion.div>
  );
}

export default function Pricing() {
  const { user, isPro } = useFirebase();
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleUpgrade = async (plan: 'pro' | 'elite') => {
    setLoadingPlan(plan);
    try {
      const response = await fetch('/api/payment/stripe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          userEmail: user?.email,
          plan: plan,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment Error:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-24 px-6 relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-[120px] pointer-events-none" />
      
      <div className="text-center space-y-6 mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ring-1 ring-indigo-500/20"
        >
          <Zap size={14} fill="currentColor" />
          Neural Upgrade available
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-7xl font-black text-visible tracking-tighter"
        >
          Elevate your productivity.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed"
        >
          Choose the architecture that fits your workflow. From individual focus to enterprise-grade neural coordination.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <PricingCard
          name="Starter"
          price="Free"
          description="Baseline Architecture"
          buttonText="Current Plan"
          onSelect={() => {}}
          features={[
            "Basic to-do list system",
            "Limited daily task creation (10/day)",
            "Simple calendar view",
            "Minimal productivity dashboard",
            "Basic cloud sync (7-day history)",
            "Standard interface (Ad-supported)",
            "Single workspace identity"
          ]}
        />

        <PricingCard
          name="Pro"
          price="$49"
          description="Advanced Neural Engine"
          isPopular={true}
          buttonText={isPro ? "Active Account" : "Upgrade to Pro"}
          isLoading={loadingPlan === 'pro'}
          onSelect={() => handleUpgrade('pro')}
          features={[
            "Unlimited tasks and mission projects",
            "Advanced analytics & focus insights",
            "Immersive Pomodoro Focus Engine",
            "Neural Notes with file attachments",
            "Multi-workspace architecture",
            "Full cloud sync history",
            "Custom tags and deep categorization",
            "Priority neural support channel",
            "100% Ad-free experience"
          ]}
        />

        <PricingCard
          name="Elite"
          price="$99"
          description="Quantum Coordination"
          buttonText="Unlock Elite"
          isLoading={loadingPlan === 'elite'}
          onSelect={() => handleUpgrade('elite')}
          features={[
            "AI Productivity Assistant (Gemini-Elite)",
            "Real-time team collaboration cells",
            "Shared mission boards & live updates",
            "Automated recurring workflows",
            "Smart Neural Scheduling",
            "External Integration (Notion, Slack, G-Cal)",
            "Beta feature early access",
            "System API & Developer Access",
            "24/7 Concierge Priority Support"
          ]}
        />
      </div>

      <div className="mt-24 text-center">
        <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Logos or trust indicators could go here */}
           <div className="flex items-center gap-2 text-visible font-black">
             <Shield size={20} />
             <span className="text-xs uppercase tracking-widest">Secured by Stripe</span>
           </div>
           <div className="flex items-center gap-2 text-visible font-black">
             <Globe size={20} />
             <span className="text-xs uppercase tracking-widest">Global Neural Sync</span>
           </div>
           <div className="flex items-center gap-2 text-visible font-black">
             <Cpu size={20} />
             <span className="text-xs uppercase tracking-widest">Gemini Optimized</span>
           </div>
        </div>
      </div>
    </div>
  );
}
