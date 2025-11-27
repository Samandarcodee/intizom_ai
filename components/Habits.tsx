
import React, { useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import { useUserStore } from '../store/userStore';
import { useUIStore } from '../store/uiStore';
import { Plus, Trash2, Edit2, Check, X, Flame, Calendar, Share2, Target, Palette, Smile, Ban, ShieldCheck } from 'lucide-react';
import { translations } from '../utils/translations';

const EMOJIS = ['🏃', '💧', '📚', '🧘', '💪', '🧠', '💰', '🥦', '🚭', '😴'];
const COLORS = [
  { id: 'blue', bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500' },
  { id: 'green', bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-500' },
  { id: 'orange', bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500' },
  { id: 'purple', bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500' },
  { id: 'red', bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-500' },
];

export const Habits: React.FC = () => {
  const { habits, toggleHabit, addHabit, updateHabit, deleteHabit } = useHabitStore();
  const { userProfile } = useUserStore();
  const { addToast } = useUIStore();
  const t = translations[userProfile.language].habits;

  // Add Habit State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState(EMOJIS[0]);
  const [newColor, setNewColor] = useState('blue');
  const [targetValue, setTargetValue] = useState<string>('');
  const [unit, setUnit] = useState('');
  const [habitType, setHabitType] = useState<'positive' | 'negative'>('positive');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    const target = (habitType === 'positive' && targetValue) ? parseInt(targetValue) : undefined;
    addHabit(newName, newIcon, newColor, target, unit, habitType);
    
    // Reset
    setNewName('');
    setTargetValue('');
    setUnit('');
    setHabitType('positive');
    setIsAdding(false);
    addToast(t.toastAdded, 'success');
  };

  const handleToggle = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    toggleHabit(id);

    // Haptic Feedback
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const startEdit = (habit: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const saveEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (editingId && editName.trim()) {
      updateHabit(editingId, editName);
      setEditingId(null);
      addToast(t.toastUpdated, 'success');
    }
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t.confirmDelete)) {
      deleteHabit(id);
      addToast(t.toastDeleted, 'info');
    }
  };
  
  const handleShare = (habit: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = t.shareMsg.replace('%d', habit.streak.toString()).replace('%s', habit.name);
    
    if (navigator.share) {
      navigator.share({
        title: 'AI-INTIZOM Challenge',
        text: msg,
        url: window.location.href 
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(msg);
      addToast('Link copied!', 'success');
    }
  };

  const getColorClass = (colorName?: string) => {
    return COLORS.find(c => c.id === colorName) || COLORS[0];
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6 pl-1">
        <div>
           <h2 className="text-xl font-bold text-white">{t.title}</h2>
           <p className="text-xs text-gray-400">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-brand-accent hover:bg-blue-600 text-white p-2 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Add Habit Modal Overlay */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-brand-dark border border-brand-gray w-full max-w-sm rounded-2xl p-5 space-y-5 animate-slide-up shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-white">{t.add}</h3>
                 <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
              </div>
              
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-brand-black p-1 rounded-xl">
                 <button 
                   onClick={() => { setHabitType('positive'); setNewColor('blue'); }}
                   className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${habitType === 'positive' ? 'bg-brand-dark text-white shadow-sm' : 'text-gray-500'}`}
                 >
                   <Check size={14} className="mr-1" /> {t.typePositive}
                 </button>
                 <button 
                   onClick={() => { setHabitType('negative'); setNewColor('red'); }}
                   className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${habitType === 'negative' ? 'bg-brand-dark text-red-500 shadow-sm' : 'text-gray-500'}`}
                 >
                   <Ban size={14} className="mr-1" /> {t.typeNegative}
                 </button>
              </div>
              <p className="text-[10px] text-gray-500 text-center">
                {habitType === 'positive' ? t.typePositiveDesc : t.typeNegativeDesc}
              </p>

              <div className="space-y-4">
                 {/* Name */}
                 <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">{t.nameLabel}</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full bg-brand-black border border-brand-gray rounded-xl p-3 text-white text-sm focus:border-brand-accent outline-none"
                      autoFocus
                    />
                 </div>
                 
                 {/* Numeric Target (Only for Positive) */}
                 {habitType === 'positive' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">{t.targetLabel}</label>
                        <input
                          type="number"
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          placeholder="0"
                          className="w-full bg-brand-black border border-brand-gray rounded-xl p-3 text-white text-sm focus:border-brand-accent outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">{t.unitLabel}</label>
                        <input
                          type="text"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder={t.unitPlaceholder}
                          className="w-full bg-brand-black border border-brand-gray rounded-xl p-3 text-white text-sm focus:border-brand-accent outline-none"
                        />
                    </div>
                  </div>
                 )}

                 {/* Icons */}
                 <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 flex items-center"><Smile size={12} className="mr-1"/> {t.iconLabel}</label>
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                       {EMOJIS.map(emoji => (
                         <button 
                           key={emoji} 
                           onClick={() => setNewIcon(emoji)}
                           className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xl transition-all ${newIcon === emoji ? 'bg-brand-gray border-2 border-brand-accent' : 'bg-brand-black border border-brand-gray'}`}
                         >
                           {emoji}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Colors */}
                 <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold mb-2 flex items-center"><Palette size={12} className="mr-1"/> {t.colorLabel}</label>
                    <div className="flex space-x-3">
                       {COLORS.map(c => (
                         <button 
                           key={c.id} 
                           onClick={() => setNewColor(c.id)}
                           className={`w-8 h-8 rounded-full transition-all ${c.bg} ${newColor === c.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                         ></button>
                       ))}
                    </div>
                 </div>

                 <button 
                   onClick={handleAdd}
                   className="w-full py-3 bg-brand-accent text-white font-bold rounded-xl mt-4"
                 >
                   {t.add}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-4">
        {habits.length === 0 && (
          <div className="text-center py-12 opacity-50">
            <Calendar size={48} className="mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 text-sm">{t.empty}</p>
            <button onClick={() => setIsAdding(true)} className="text-brand-accent text-sm mt-2 underline">
              {t.addFirst}
            </button>
          </div>
        )}

        {habits.map((habit) => {
          const colorTheme = getColorClass(habit.color);
          const isNumeric = habit.targetValue && habit.targetValue > 0 && habit.type !== 'negative';
          const progressPercent = isNumeric ? Math.min(100, ((habit.currentValue || 0) / (habit.targetValue || 1)) * 100) : (habit.completedToday ? 100 : 0);

          return (
            <div key={habit.id} className={`bg-brand-dark border ${habit.completedToday ? colorTheme.border : 'border-brand-gray'} rounded-xl p-4 shadow-sm relative overflow-hidden group transition-all duration-300`}>
              
              {/* Progress Background Bar (For Numeric) */}
              {isNumeric && (
                <div 
                  className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${colorTheme.bg}`} 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              )}

              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-2 relative z-10">
                  <div className="flex items-center mb-1">
                     <span className="text-2xl mr-3">{habit.icon || '📌'}</span>
                     <div className="flex-1">
                        {editingId === habit.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                             <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                className="w-full bg-brand-black border border-brand-gray rounded px-2 py-1 text-sm text-white outline-none focus:border-brand-accent"
                                autoFocus
                             />
                             <button onClick={saveEdit} className="bg-brand-success/20 text-brand-success p-1 rounded"><Check size={16}/></button>
                             <button onClick={cancelEdit} className="bg-gray-700 text-gray-300 p-1 rounded"><X size={16}/></button>
                          </div>
                        ) : (
                          <div>
                             <h3 className={`font-bold text-lg leading-tight flex items-center group/title ${habit.completedToday ? 'text-white' : 'text-gray-200'}`}>
                               {habit.name}
                               {habit.type === 'negative' && (
                                 <span className="ml-2 text-[9px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Anti</span>
                               )}
                               <div className="flex opacity-0 group-hover/title:opacity-100 transition-opacity ml-2 space-x-1">
                                   <button onClick={(e) => startEdit(habit, e)} className="p-1 text-gray-500 hover:text-white rounded"><Edit2 size={12} /></button>
                                   <button onClick={(e) => handleShare(habit, e)} className="p-1 text-gray-500 hover:text-white rounded"><Share2 size={12} /></button>
                               </div>
                             </h3>
                             {isNumeric && (
                               <p className="text-xs text-gray-400 font-medium mt-0.5">
                                 {habit.currentValue} / {habit.targetValue} {habit.unit}
                               </p>
                             )}
                          </div>
                        )}
                     </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-400 mt-2 ml-1">
                    <span className={`flex items-center font-medium ${colorTheme.text}`}>
                      <Flame size={14} className={`mr-1 fill-current`} /> 
                      {habit.streak} {t.streak}
                    </span>
                  </div>
                </div>

                {/* Interaction Button */}
                <button
                  onClick={() => handleToggle(habit.id)}
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-lg border ${
                    habit.completedToday
                      ? `${colorTheme.bg} border-transparent text-white`
                      : 'bg-brand-black border-brand-gray hover:border-gray-500 text-gray-500'
                  }`}
                >
                  {habit.completedToday ? (
                     habit.type === 'negative' ? <ShieldCheck size={28} strokeWidth={2.5}/> : <Check size={28} strokeWidth={3} />
                  ) : isNumeric ? (
                     <span className="text-lg font-bold">+{1}</span>
                  ) : (
                     <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                  )}
                </button>
              </div>

              {/* Weekly Dots */}
              <div className="mt-3 pt-3 border-t border-brand-gray/30 flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t.last7days}</span>
                <div className="flex space-x-1.5">
                  {[...habit.history].reverse().map((done, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2 h-2 rounded-full transition-all ${
                        done ? colorTheme.bg : 'bg-brand-black border border-gray-700'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {!editingId && (
                <button 
                  onClick={(e) => handleDelete(habit.id, e)}
                  className="absolute top-2 right-2 p-2 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
