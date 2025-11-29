
import React, { useState } from 'react';
import { generateDisciplinePlan } from '../services/geminiService';
import { useHabitStore } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';
import { Target, Loader2, ArrowRight, PlusCircle, Check, RotateCcw, Zap, Sunrise, Terminal, Dumbbell, ChevronDown, ChevronUp, Edit2, Clock, Gauge } from 'lucide-react';
import { translations } from '../utils/translations';

export const Planner: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());
  
  // Settings
  const [duration, setDuration] = useState<number>(7);
  const [intensity, setIntensity] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Accordion State
  const [expandedDay, setExpandedDay] = useState<number>(1);

  // Edit State
  const [editingTask, setEditingTask] = useState<{dayIndex: number, taskIndex: number} | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  
  const { dailyPlan, setPlan, addTask, updatePlanTask } = useHabitStore();
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
      const result = await generateDisciplinePlan(targetGoal, userProfile.language, duration, intensity);
      setPlan(result);
      setExpandedDay(1); // Reset accordion to first day
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

  const startEditTask = (dayIndex: number, taskIndex: number, text: string) => {
    setEditingTask({ dayIndex, taskIndex });
    setEditTaskText(text);
  };

  const saveEditTask = () => {
    if (editingTask && editTaskText.trim()) {
      updatePlanTask(editingTask.dayIndex, editingTask.taskIndex, editTaskText);
      setEditingTask(null);
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? 0 : day);
  };

  const challenges = [
    { id: 'detox', icon: <Zap size={20} className="text-yellow-500" />, title: t.challenges.detox, desc: t.challenges.detoxDesc, query: "Dopamine Detox" },
    { id: 'club', icon: <Sunrise size={20} className="text-orange-500" />, title: t.challenges.club, desc: t.challenges.clubDesc, query: "5 AM Club Routine" },
    { id: 'coding', icon: <Terminal size={20} className="text-green-500" />, title: t.challenges.coding, desc: t.challenges.codingDesc, query: "Learn Coding Basics" },
    { id: 'fit', icon: <Dumbbell size={20} className="text-blue-500" />, title: t.challenges.fit, desc: t.challenges.fitDesc, query: "Fitness Challenge Beginner" },
  ];

  if (dailyPlan.length > 0) {
    return (
      <div className="pb-24 animate-fade-in">
         <div className="flex justify-between items-center mb-6 pl-1">
            <div>
              <h2 className="text-xl font-bold text-white">{t.protocol}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] bg-brand-gray px-1.5 py-0.5 rounded text-gray-300">{duration} {t.day}</span>
                <span className="text-[10px] bg-brand-gray px-1.5 py-0.5 rounded text-gray-300 capitalize">{intensity}</span>
              </div>
            </div>
            <button 
              onClick={handleReset} 
              className="p-2 bg-brand-dark border border-brand-gray rounded-lg hover:bg-brand-gray text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw size={18} />
            </button>
         </div>
         
         <div className="space-y-3">
            {dailyPlan.map((day, dIdx) => {
              const isExpanded = expandedDay === day.day;
              return (
                <div key={day.day} className={`bg-brand-dark border transition-all duration-300 rounded-xl overflow-hidden ${isExpanded ? 'border-brand-accent/50 shadow-lg' : 'border-brand-gray'}`}>
                    {/* Accordion Header */}
                    <button 
                      onClick={() => toggleDay(day.day)}
                      className="w-full p-4 flex items-center justify-between"
                    >
                       <div className="flex items-center">
                          <span className={`text-xs font-bold tracking-widest uppercase px-2 py-1 rounded mr-3 ${
                            day.day === 1 ? 'bg-brand-accent/20 text-brand-accent' : 'bg-brand-black text-gray-400'
                          }`}>
                            {t.day} {day.day}
                          </span>
                          <span className={`font-semibold text-sm ${isExpanded ? 'text-white' : 'text-gray-400'}`}>{day.focus}</span>
                       </div>
                       {isExpanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                    </button>
                    
                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 animate-fade-in">
                          <ul className="space-y-3 pt-2 border-t border-brand-gray/30">
                              {day.tasks.map((t_task, idx) => {
                                  const uniqueKey = `d${day.day}-t${idx}`;
                                  const isAdded = addedTasks.has(uniqueKey);
                                  const isEditing = editingTask?.dayIndex === dIdx && editingTask?.taskIndex === idx;
                                  
                                  return (
                                    <li key={idx} className="flex items-start justify-between text-sm text-gray-300 group bg-brand-black/30 p-2.5 rounded-lg border border-transparent hover:border-brand-gray/50 transition-colors">
                                        <div className="flex-1 pr-2">
                                          {isEditing ? (
                                            <div className="flex items-center space-x-2">
                                              <input 
                                                type="text" 
                                                value={editTaskText}
                                                onChange={(e) => setEditTaskText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEditTask()}
                                                className="w-full bg-brand-black border border-brand-gray rounded px-2 py-1 text-sm outline-none focus:border-brand-accent"
                                                autoFocus
                                              />
                                              <button onClick={saveEditTask} className="text-brand-success p-1"><Check size={14}/></button>
                                            </div>
                                          ) : (
                                            <div className="flex items-start">
                                               <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-brand-warning rounded-full flex-shrink-0"></span>
                                               <span className="leading-relaxed cursor-pointer" onClick={() => startEditTask(dIdx, idx, t_task)}>
                                                 {t_task}
                                               </span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {!isEditing && (
                                          <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                             <button onClick={() => startEditTask(dIdx, idx, t_task)} className="p-1.5 text-gray-500 hover:text-white rounded">
                                               <Edit2 size={14} />
                                             </button>
                                             <button 
                                                onClick={() => !isAdded && handleAddToToday(t_task, uniqueKey)}
                                                disabled={isAdded}
                                                className={`p-1.5 rounded transition-all shrink-0 ${
                                                  isAdded 
                                                    ? 'text-brand-success bg-brand-success/10' 
                                                    : 'text-brand-accent hover:bg-brand-accent/10'
                                                }`}
                                              >
                                                {isAdded ? <Check size={16} /> : <PlusCircle size={16} />}
                                              </button>
                                          </div>
                                        )}
                                    </li>
                                  );
                              })}
                          </ul>
                      </div>
                    )}
                </div>
              );
            })}
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      <div className="flex flex-col items-center justify-center text-center mb-6 mt-2">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-dark to-brand-black rounded-full flex items-center justify-center mb-3 border border-brand-gray shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <Target size={28} className="text-brand-accent" />
        </div>
        
        <h1 className="text-xl font-bold text-white mb-1">{t.title}</h1>
        <p className="text-gray-400 text-[10px] max-w-xs leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="w-full space-y-4 relative z-10 px-1">
        {/* Settings Panel */}
        <div className="grid grid-cols-2 gap-3 mb-2">
           <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center"><Clock size={10} className="mr-1"/>{t.settings.duration}</label>
              <select 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-brand-dark border border-brand-gray rounded-lg p-2 text-xs text-white outline-none focus:border-brand-accent appearance-none"
              >
                <option value={3}>{t.settings.days3}</option>
                <option value={7}>{t.settings.days7}</option>
                <option value={21}>{t.settings.days21}</option>
              </select>
           </div>
           <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center"><Gauge size={10} className="mr-1"/>{t.settings.intensity}</label>
              <select 
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as any)}
                className="w-full bg-brand-dark border border-brand-gray rounded-lg p-2 text-xs text-white outline-none focus:border-brand-accent appearance-none"
              >
                <option value="easy">{t.settings.easy}</option>
                <option value="medium">{t.settings.medium}</option>
                <option value="hard">{t.settings.hard}</option>
              </select>
           </div>
        </div>

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
            className="w-full bg-brand-accent hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-accent/20 transform active:scale-[0.98]"
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
      <div className="mt-6">
        <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">{t.challenges.title}</h3>
        <div className="grid grid-cols-2 gap-3">
           {challenges.map((c) => (
             <button
               key={c.id}
               onClick={() => handleGenerate(c.query)}
               className="bg-brand-dark border border-brand-gray hover:border-brand-accent/50 p-3 rounded-xl text-left transition-all hover:bg-brand-gray/30 active:scale-95 group"
             >
               <div className="mb-2 p-1.5 bg-brand-black rounded-lg w-fit group-hover:scale-110 transition-transform">
                 {c.icon}
               </div>
               <h4 className="font-bold text-xs text-white">{c.title}</h4>
               <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{c.desc}</p>
             </button>
           ))}
        </div>
      </div>
      
      {error && <p className="text-red-400 text-xs mt-4 bg-red-500/10 py-2 px-3 rounded text-center">{error}</p>}
    </div>
  );
};
