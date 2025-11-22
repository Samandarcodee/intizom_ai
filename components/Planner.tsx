
import React, { useState } from 'react';
import { generateDisciplinePlan } from '../services/geminiService';
import { useHabitStore } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';
import { Target, Loader2, ArrowRight, PlusCircle, Check, RotateCcw, Zap, Sunrise, Terminal, Dumbbell } from 'lucide-react';
import { translations } from '../utils/translations';

export const Planner: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());
  
  const { dailyPlan, setPlan, addTask } = useHabitStore();
  const { addToast } = useUIStore();
  const { userProfile } = useUserStore();
  const t = translations[userProfile.language].plan;

  const handleGenerate = async (customGoal?: string) => {
    const targetGoal = customGoal || goal;
    if (!targetGoal.trim()) return;
    
    if (customGoal) setGoal(customGoal);
    
    setLoading(true);
    setError('');
    try {
      const result = await generateDisciplinePlan(targetGoal, userProfile.language, 7);
      setPlan(result);
      addToast(t.toastSuccess, 'success');

    } catch (err) {
      console.error(err);
      setError(t.toastError);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToToday = (taskName: string, uniqueKey: string) => {
     addTask(taskName);
     setAddedTasks(prev => new Set(prev).add(uniqueKey));
     addToast(t.toastAddedToToday, 'success');
  };

  const handleReset = () => {
    if(window.confirm(t.reset)) {
      setPlan([]);
      setGoal('');
      setAddedTasks(new Set());
    }
  };

  const challenges = [
    { id: 'detox', icon: <Zap size={20} className="text-yellow-500" />, title: t.challenges.detox, desc: t.challenges.detoxDesc, query: "Dopamine Detox 7 Days" },
    { id: 'club', icon: <Sunrise size={20} className="text-orange-500" />, title: t.challenges.club, desc: t.challenges.clubDesc, query: "5 AM Club Routine" },
    { id: 'coding', icon: <Terminal size={20} className="text-green-500" />, title: t.challenges.coding, desc: t.challenges.codingDesc, query: "Learn Coding Basics in 7 Days" },
    { id: 'fit', icon: <Dumbbell size={20} className="text-blue-500" />, title: t.challenges.fit, desc: t.challenges.fitDesc, query: "7 Day Fitness Challenge Beginner" },
  ];

  if (dailyPlan.length > 0) {
    return (
      <div className="pb-24 animate-fade-in">
         <div className="flex justify-between items-center mb-6 pl-1">
            <div>
              <h2 className="text-xl font-bold text-white">{t.protocol}</h2>
              <p className="text-xs text-gray-400">{goal}</p>
            </div>
            <button 
              onClick={handleReset} 
              className="p-2 bg-brand-dark border border-brand-gray rounded-lg hover:bg-brand-gray text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw size={18} />
            </button>
         </div>
         
         <div className="space-y-4">
            {dailyPlan.map((day) => (
                <div key={day.day} className="bg-brand-dark border border-brand-gray p-4 rounded-xl animate-slide-up" style={{ animationDelay: `${day.day * 100}ms` }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold tracking-widest uppercase px-2 py-1 rounded ${
                          day.day === 1 ? 'bg-brand-accent/20 text-brand-accent' : 'bg-brand-gray text-gray-400'
                        }`}>
                          {day.day}-{t.day}
                        </span>
                    </div>
                    <h3 className="text-white font-semibold mb-3 leading-tight">{day.focus}</h3>
                    <ul className="space-y-3">
                        {day.tasks.map((t_task, idx) => {
                            const uniqueKey = `d${day.day}-t${idx}`;
                            const isAdded = addedTasks.has(uniqueKey);
                            
                            return (
                              <li key={idx} className="flex items-start justify-between text-sm text-gray-300 group bg-brand-black/30 p-2 rounded-lg border border-transparent hover:border-brand-gray/50 transition-colors">
                                  <div className="flex items-start pr-2">
                                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-brand-warning rounded-full flex-shrink-0"></span>
                                    <span className="leading-relaxed">{t_task}</span>
                                  </div>
                                  <button 
                                    onClick={() => !isAdded && handleAddToToday(t_task, uniqueKey)}
                                    disabled={isAdded}
                                    className={`p-1.5 rounded transition-all shrink-0 ${
                                      isAdded 
                                        ? 'text-brand-success bg-brand-success/10' 
                                        : 'text-brand-accent hover:bg-brand-accent/10 opacity-60 group-hover:opacity-100'
                                    }`}
                                    title={isAdded ? t.added : t.addToToday}
                                  >
                                    {isAdded ? <Check size={18} /> : <PlusCircle size={18} />}
                                  </button>
                              </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
         </div>
         
         <div className="mt-8 p-4 bg-brand-accent/10 border border-brand-accent/30 rounded-xl text-center">
            <p className="text-sm text-brand-accent font-medium">
              {t.quote}
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      <div className="flex flex-col items-center justify-center text-center mb-8 mt-4">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-dark to-brand-black rounded-full flex items-center justify-center mb-4 border border-brand-gray shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <Target size={32} className="text-brand-accent" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">{t.title}</h1>
        <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="w-full space-y-4 relative z-10 px-1">
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-accent to-brand-purple rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder={t.placeholder}
                className="relative w-full bg-brand-dark border border-brand-gray rounded-xl p-4 pl-5 text-white placeholder-gray-600 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all outline-none"
            />
        </div>

        <button
            onClick={() => handleGenerate()}
            disabled={loading || !goal}
            className="w-full bg-brand-accent hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-accent/20 transform active:scale-[0.98]"
        >
            {loading ? (
                <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    {t.loading}
                </>
            ) : (
                <>
                    {t.button}
                    <ArrowRight size={20} className="ml-2" />
                </>
            )}
        </button>
      </div>
      
      {/* Challenge Templates */}
      <div className="mt-8">
        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider pl-1">{t.challenges.title}</h3>
        <div className="grid grid-cols-2 gap-3">
           {challenges.map((c) => (
             <button
               key={c.id}
               onClick={() => handleGenerate(c.query)}
               className="bg-brand-dark border border-brand-gray hover:border-brand-accent/50 p-3 rounded-xl text-left transition-all hover:bg-brand-gray/30 active:scale-95 group"
             >
               <div className="mb-2 p-2 bg-brand-black rounded-lg w-fit group-hover:scale-110 transition-transform">
                 {c.icon}
               </div>
               <h4 className="font-bold text-sm text-white">{c.title}</h4>
               <p className="text-[10px] text-gray-500 mt-1 leading-tight">{c.desc}</p>
             </button>
           ))}
        </div>
      </div>
      
      {error && <p className="text-red-400 text-xs mt-4 bg-red-500/10 py-2 px-3 rounded text-center">{error}</p>}
    </div>
  );
};
