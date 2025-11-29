
import React from 'react';
import { useHabitStore } from '../store/habitStore';
import { useUserStore } from '../store/userStore';
import { useUIStore } from '../store/uiStore';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Flame, Crown, Clock, Zap, Star, Check, Trash2, Timer } from 'lucide-react';
import { translations } from '../utils/translations';

export const Dashboard: React.FC = () => {
  const { habits, todayTasks, toggleTask, toggleHabit, deleteTask } = useHabitStore();
  const { daysUsed, userStatus, userProfile } = useUserStore();
  const { addToast, setFocusModeOpen } = useUIStore();
  const t = translations[userProfile.language].dashboard;
  const th = translations[userProfile.language].habits;

  const completedHabits = habits.filter(h => h.completedToday).length;
  const habitPercentage = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;
  const daysLeft = 7 - daysUsed;

  const handleTaskToggle = (id: string) => {
    toggleTask(id);
  };

  const handleDeleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t.confirmDeleteTask)) {
      deleteTask(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end mt-2">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">{t.welcome}</p>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center">
            {userProfile.name}
            {userStatus.isPremium && <Crown size={20} className="ml-2 text-yellow-500 fill-yellow-500 animate-pulse-slow" />}
          </h1>
        </div>
        <div className="flex items-center space-x-1 bg-brand-dark px-3 py-1.5 rounded-full border border-brand-gray shadow-sm">
          <Flame size={16} className="text-brand-warning fill-brand-warning" />
          <span className="text-sm font-bold text-white">{daysUsed} {t.days}</span>
        </div>
      </div>

      {/* Trial Banner */}
      {!userStatus.isPremium && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl border border-brand-gray flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-500/10 blur-2xl rounded-full -mr-8 -mt-8 group-hover:bg-yellow-500/20 transition-all"></div>
          <div className="flex items-center space-x-3 relative z-10">
            <div className="bg-brand-warning/10 p-2 rounded-full">
              <Clock size={20} className="text-brand-warning" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t.trial}</p>
              <p className="text-sm font-bold text-white">{daysLeft > 0 ? `${daysLeft} ${t.daysLeft}` : t.expired}</p>
            </div>
          </div>
          <button className="text-xs bg-brand-warning hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            {t.getPremium}
          </button>
        </div>
      )}

      {/* Progress Card & Focus Button */}
      <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 bg-brand-dark p-5 rounded-2xl border border-brand-gray flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white">{t.dailyDiscipline}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.consistency}</p>
              <div className="mt-4 flex items-center space-x-2 text-brand-accent bg-brand-accent/10 w-fit px-2 py-1 rounded-lg">
                <Zap size={14} className="fill-brand-accent" />
                <span className="text-xs font-bold">{habitPercentage}% {t.completed}</span>
              </div>
            </div>
            <div className="w-16 h-16 relative z-10 drop-shadow-lg">
              <CircularProgressbar
                value={habitPercentage}
                text={`${habitPercentage}%`}
                styles={buildStyles({
                  textSize: '24px',
                  pathColor: '#3b82f6',
                  textColor: '#fff',
                  trailColor: '#2a2a2a',
                  pathTransitionDuration: 1,
                })}
              />
            </div>
          </div>

          <button 
            onClick={() => setFocusModeOpen(true)}
            className="col-span-1 bg-gradient-to-br from-brand-dark to-brand-black border border-brand-gray rounded-2xl flex flex-col items-center justify-center p-2 hover:border-brand-accent transition-all group active:scale-95"
          >
             <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-brand-accent/20 transition-colors">
                <Timer size={20} className="text-brand-accent" />
             </div>
             <span className="text-xs font-bold text-white text-center leading-tight">{t.startFocus}</span>
          </button>
      </div>

      {/* Today's Tasks */}
      <div>
        <h2 className="text-lg font-bold mb-3 pl-1 flex items-center justify-between">
          <span className="flex items-center">
            {t.todaysPlan}
            {todayTasks.length > 0 && <span className="ml-2 text-xs font-bold text-brand-black bg-white px-2 py-0.5 rounded-full">{todayTasks.filter(t => t.completed).length}/{todayTasks.length}</span>}
          </span>
        </h2>
        <div className="space-y-3">
          {todayTasks.length === 0 ? (
            <div className="text-center p-8 bg-brand-dark rounded-2xl border border-brand-gray border-dashed flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-brand-gray/30 rounded-full flex items-center justify-center mb-3">
                 <Clock size={24} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm font-medium">{t.noPlan}</p>
              <p className="text-gray-600 text-xs mt-1">{t.createPlan}</p>
            </div>
          ) : (
            todayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskToggle(task.id)}
                className={`p-4 rounded-xl border transition-all duration-300 flex items-center cursor-pointer group relative overflow-hidden ${
                  task.completed
                    ? 'bg-brand-black border-brand-gray opacity-60'
                    : 'bg-brand-dark border-brand-gray hover:border-brand-accent hover:shadow-md'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded mr-4 flex items-center justify-center border transition-all duration-300 ${
                    task.completed ? 'bg-brand-accent border-brand-accent scale-110' : 'border-gray-500 group-hover:border-brand-accent'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1">
                   <span className={`text-sm font-medium transition-all ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.title}
                  </span>
                </div>
                
                {task.completed && (
                  <button 
                    onClick={(e) => handleDeleteTask(e, task.id)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Habits */}
      <div>
        <h2 className="text-lg font-bold mb-3 pl-1">{t.habitsTracking}</h2>
        <div className="grid grid-cols-2 gap-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden group active:scale-95 ${
                habit.completedToday
                  ? 'bg-gradient-to-br from-brand-success/20 to-brand-dark border-brand-success/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-brand-dark border-brand-gray hover:border-brand-gray/80'
              }`}
            >
               {habit.completedToday && (
                 <div className="absolute top-0 right-0 p-1.5">
                    <Star size={12} className="text-brand-success fill-brand-success animate-pulse-slow" />
                 </div>
               )}
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-bold truncate pr-4 transition-colors ${habit.completedToday ? 'text-white' : 'text-gray-300'}`}>{habit.name}</span>
                {habit.completedToday && <div className="w-2 h-2 rounded-full bg-brand-success shrink-0 mt-1.5 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>}
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <span className="mr-1">{t.streak}:</span> 
                <span className={`font-bold ${habit.streak > 2 ? 'text-brand-warning' : 'text-white'}`}>{habit.streak}</span>
                {habit.streak > 0 && <Flame size={10} className="ml-1 text-brand-warning fill-brand-warning" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
