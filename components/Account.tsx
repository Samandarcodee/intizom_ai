
import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useHabitStore } from '../store/habitStore';
import { useUIStore } from '../store/uiStore';
import { 
  Settings, Crown, Shield, ChevronRight, 
  Bell, Globe, Trash2, Edit2, Check, Flame, Calendar, Trophy, User
} from 'lucide-react';
import { translations, Language } from '../utils/translations';

export const Account: React.FC = () => {
  const { userProfile, userStatus, daysUsed, updateProfile, resetData, telegramId } = useUserStore();
  const { habits } = useHabitStore();
  const { addToast } = useUIStore();
  const t = translations[userProfile.language].account;
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);

  // Stats Calculation
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  
  const handleSaveName = () => {
    if (tempName.trim().length === 0) return;
    updateProfile({ name: tempName });
    setIsEditingName(false);
    addToast(t.toastName, 'success');
  };

  const handleReset = () => {
    if (window.confirm(t.confirmReset)) {
      resetData();
    }
  };

  const cycleLanguage = () => {
    const langs: Language[] = ['uz', 'ru', 'en'];
    const currentIndex = langs.indexOf(userProfile.language);
    const nextLang = langs[(currentIndex + 1) % langs.length];
    updateProfile({ language: nextLang });
    addToast(nextLang === 'uz' ? "O'zbek tili tanlandi" : nextLang === 'ru' ? "Выбран русский язык" : "English Selected", 'success');
  };

  // Mock Leaderboard Data
  const leaderboard = [
    { name: 'Jahongir A.', streak: 45, isPremium: true },
    { name: 'Malika S.', streak: 42, isPremium: true },
    { name: userProfile.name, streak: maxStreak, isPremium: userStatus.isPremium, isMe: true },
    { name: 'Timur K.', streak: 30, isPremium: false },
    { name: 'Aziza R.', streak: 28, isPremium: false },
  ].sort((a, b) => b.streak - a.streak); // Sort by streak

  return (
    <div className="pb-24 animate-fade-in px-1">
      {/* Header Profile */}
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className="relative">
           <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl mb-3 border-4 ${
             userStatus.isPremium ? 'bg-gradient-to-br from-yellow-500 to-orange-600 border-yellow-400' : 'bg-gradient-to-br from-brand-accent to-brand-purple border-brand-gray'
           }`}>
             {userProfile.name.charAt(0).toUpperCase()}
           </div>
           {userStatus.isPremium && (
             <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black p-1.5 rounded-full border-2 border-brand-black">
               <Crown size={16} fill="black" />
             </div>
           )}
        </div>

        {isEditingName ? (
          <div className="flex items-center space-x-2 mt-1">
            <input 
              type="text" 
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-brand-dark border border-brand-gray rounded-lg px-3 py-1.5 text-center text-white focus:border-brand-accent outline-none w-40"
              autoFocus
            />
            <button onClick={handleSaveName} className="bg-brand-success p-1.5 rounded-lg text-black">
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2" onClick={() => setIsEditingName(true)}>
            <h1 className="text-2xl font-bold text-white">{userProfile.name}</h1>
            <Edit2 size={16} className="text-gray-500" />
          </div>
        )}
        <p className="text-sm text-brand-success mt-1 font-medium flex items-center justify-center">
          <Crown size={14} className="mr-1 text-yellow-500" />
          {t.premium}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-brand-dark p-4 rounded-xl border border-brand-gray flex flex-col items-center justify-center hover:border-brand-accent/50 transition-colors">
           <div className="bg-blue-500/10 p-2.5 rounded-full mb-2">
             <Calendar size={20} className="text-blue-500" />
           </div>
           <span className="text-2xl font-bold text-white">{daysUsed}</span>
           <span className="text-xs text-gray-500">{t.stats.daily}</span>
        </div>
        <div className="bg-brand-dark p-4 rounded-xl border border-brand-gray flex flex-col items-center justify-center hover:border-brand-accent/50 transition-colors">
           <div className="bg-orange-500/10 p-2.5 rounded-full mb-2">
             <Flame size={20} className="text-orange-500 fill-orange-500" />
           </div>
           <span className="text-2xl font-bold text-white">{maxStreak}</span>
           <span className="text-xs text-gray-500">{t.stats.streak}</span>
        </div>
        <div className="bg-brand-dark p-4 rounded-xl border border-brand-gray flex flex-col items-center justify-center hover:border-brand-accent/50 transition-colors">
           <div className="bg-green-500/10 p-2.5 rounded-full mb-2">
             <Check size={20} className="text-green-500" />
           </div>
           <span className="text-2xl font-bold text-white">{habits.length}</span>
           <span className="text-xs text-gray-500">{t.stats.habits}</span>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-brand-dark border border-brand-gray rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-md font-bold text-white flex items-center">
             <Trophy size={18} className="text-yellow-500 mr-2" />
             {t.leaderboard}
           </h3>
           <span className="text-[10px] text-gray-400">{t.leaderboardSub}</span>
        </div>
        <div className="space-y-3">
           {leaderboard.map((user, idx) => (
             <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${user.isMe ? 'bg-brand-accent/20 border border-brand-accent/30' : 'bg-brand-black/30 border border-brand-gray/30'}`}>
                <div className="flex items-center space-x-3">
                   <span className={`font-bold w-5 text-center ${idx < 3 ? 'text-yellow-500' : 'text-gray-500'}`}>#{idx + 1}</span>
                   <div className="relative">
                      <div className="w-8 h-8 bg-brand-gray rounded-full flex items-center justify-center">
                         <User size={16} className="text-gray-400" />
                      </div>
                      {user.isPremium && (
                        <div className="absolute -top-1 -right-1">
                          <Crown size={10} className="text-yellow-500 fill-yellow-500" />
                        </div>
                      )}
                   </div>
                   <div>
                      <p className={`text-sm font-bold ${user.isMe ? 'text-brand-accent' : 'text-white'}`}>
                        {user.name} {user.isMe && <span className="text-[10px] bg-brand-accent text-white px-1.5 rounded ml-1">{t.you}</span>}
                      </p>
                   </div>
                </div>
                <div className="flex items-center space-x-1">
                   <Flame size={14} className="text-brand-warning fill-brand-warning" />
                   <span className="text-sm font-bold text-white">{user.streak}</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Settings Menu */}
      <div className="bg-brand-dark border border-brand-gray rounded-xl overflow-hidden mb-6">
          <button className="w-full p-4 flex items-center justify-between border-b border-brand-gray hover:bg-brand-gray/30 transition-colors group">
            <div className="flex items-center space-x-3">
              <div className="bg-brand-gray/50 p-2 rounded-lg group-hover:bg-brand-accent/20 group-hover:text-brand-accent transition-colors">
                 <Bell size={18} />
              </div>
              <span className="text-sm font-medium">{t.settings.notifications}</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${userProfile.notificationsEnabled ? 'bg-brand-success' : 'bg-gray-600'}`}>
               <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${userProfile.notificationsEnabled ? 'left-6' : 'left-1'}`}></div>
            </div>
          </button>

          <button 
            onClick={cycleLanguage}
            className="w-full p-4 flex items-center justify-between border-b border-brand-gray hover:bg-brand-gray/30 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-brand-gray/50 p-2 rounded-lg group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-colors">
                <Globe size={18} />
              </div>
              <span className="text-sm font-medium">{t.settings.language}</span>
            </div>
            <span className="text-xs text-gray-400 flex items-center uppercase">
               {userProfile.language} <ChevronRight size={16} className="ml-1" />
            </span>
          </button>

          <button className="w-full p-4 flex items-center justify-between hover:bg-brand-gray/30 transition-colors group">
            <div className="flex items-center space-x-3">
               <div className="bg-brand-gray/50 p-2 rounded-lg group-hover:bg-green-500/20 group-hover:text-green-500 transition-colors">
                 <Shield size={18} />
               </div>
              <span className="text-sm font-medium">{t.settings.privacy}</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
      </div>

      {/* Premium features available for everyone */}

      {/* Danger Zone */}
      <button 
        onClick={handleReset}
        className="w-full py-3 flex items-center justify-center space-x-2 text-red-500/70 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-wider"
      >
        <Trash2 size={14} />
        <span>{t.delete}</span>
      </button>
      
      <div className="text-center mt-6 mb-4">
         <p className="text-[10px] text-gray-600">
           AI-INTIZOM v1.6.0
           {telegramId && <span className="block text-[9px] opacity-50">ID: {telegramId}</span>}
         </p>
      </div>
    </div>
  );
};
