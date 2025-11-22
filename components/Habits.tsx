
import React, { useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import { useUserStore } from '../store/userStore';
import { useUIStore } from '../store/uiStore';
import { Plus, Trash2, Edit2, Check, X, Flame, Calendar } from 'lucide-react';
import { translations } from '../utils/translations';

export const Habits: React.FC = () => {
  const { habits, toggleHabit, addHabit, updateHabit, deleteHabit } = useHabitStore();
  const { userProfile } = useUserStore();
  const { addToast } = useUIStore();
  const t = translations[userProfile.language].habits;

  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newHabitName.trim()) return;
    addHabit(newHabitName);
    setNewHabitName('');
    setIsAdding(false);
    addToast(t.toastAdded, 'success');
  };

  const handleToggle = (id: string) => {
    const habit = habits.find(h => h.id === id);
    toggleHabit(id);

    if (habit && !habit.completedToday) {
      if (navigator.vibrate) navigator.vibrate(50);

      const completedCount = habits.filter(h => h.completedToday).length;
      if (completedCount + 1 === habits.length) {
         addToast(t.toastDone, 'success');
      }
    }
  };

  const startEdit = (habit: any, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling habit when clicking edit
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
    e.stopPropagation(); // Prevent toggling
    if (window.confirm(t.confirmDelete)) {
      deleteHabit(id);
      addToast(t.toastDeleted, 'info');
    }
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

      {/* Add Habit Form */}
      {isAdding && (
        <div className="mb-6 bg-brand-dark border border-brand-gray p-4 rounded-xl animate-slide-up">
          <label className="text-xs text-gray-400 block mb-2">{t.add}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={t.placeholder}
              className="flex-1 bg-brand-black border border-brand-gray rounded-lg px-3 py-2 text-white text-sm focus:border-brand-accent outline-none"
              autoFocus
            />
            <button onClick={handleAdd} className="bg-brand-success text-black p-2 rounded-lg">
              <Check size={20} />
            </button>
            <button onClick={() => setIsAdding(false)} className="bg-brand-gray text-white p-2 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {habits.length === 0 && !isAdding ? (
          <div className="text-center py-12 opacity-50">
            <Calendar size={48} className="mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 text-sm">{t.empty}</p>
            <button onClick={() => setIsAdding(true)} className="text-brand-accent text-sm mt-2 underline">
              {t.addFirst}
            </button>
          </div>
        ) : (
          habits.map((habit) => (
            <div key={habit.id} className="bg-brand-dark border border-brand-gray rounded-xl p-4 shadow-sm relative overflow-hidden group">
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-2">
                  {editingId === habit.id ? (
                    <div className="flex items-center gap-2 mb-1" onClick={(e) => e.stopPropagation()}>
                       <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full bg-brand-black border border-brand-gray rounded px-2 py-1 text-sm text-white outline-none focus:border-brand-accent"
                          autoFocus
                       />
                       <button onClick={saveEdit} className="bg-brand-success/20 text-brand-success p-1 rounded hover:bg-brand-success/30 transition-colors"><Check size={18}/></button>
                       <button onClick={cancelEdit} className="bg-gray-700 text-gray-300 p-1 rounded hover:bg-gray-600 transition-colors"><X size={18}/></button>
                    </div>
                  ) : (
                    <h3 className="font-bold text-white text-lg leading-tight flex items-center group/title">
                      {habit.name}
                      <button 
                        onClick={(e) => startEdit(habit, e)}
                        className="ml-2 p-1 text-gray-500 hover:text-brand-accent hover:bg-brand-gray/50 rounded transition-all opacity-60 group-hover/title:opacity-100"
                        title="Edit name"
                      >
                        <Edit2 size={14} />
                      </button>
                    </h3>
                  )}
                  <div className="flex items-center text-xs text-gray-400 mt-1 space-x-3">
                    <span className="flex items-center text-brand-warning font-medium">
                      <Flame size={14} className="mr-1 fill-brand-warning" /> 
                      {habit.streak} {t.streak}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                   <button
                    onClick={() => handleToggle(habit.id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all transform active:scale-90 ${
                      habit.completedToday
                        ? 'bg-brand-success text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-brand-gray/50 text-gray-400 hover:bg-brand-gray'
                    }`}
                  >
                    <Check size={24} className={habit.completedToday ? 'stroke-[3px]' : ''} />
                  </button>
                </div>
              </div>

              {/* Weekly History Visualization */}
              <div className="mt-4 pt-3 border-t border-brand-gray/30 flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t.last7days}</span>
                <div className="flex space-x-1.5">
                  {[...habit.history].reverse().map((done, idx) => (
                    <div 
                      key={idx} 
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        done ? 'bg-brand-accent shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'bg-gray-700'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              
              {!editingId && (
                <button 
                  onClick={(e) => handleDelete(habit.id, e)}
                  className="absolute top-2 right-2 p-2 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
