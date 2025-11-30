import React from 'react';
import { AppTab } from '../types';
import { LayoutDashboard, Calendar, MessageSquare, CheckSquare, User, ShieldCheck } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { translations } from '../utils/translations';
import { getTelegramUser } from '../utils/telegram';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { userProfile } = useUserStore();
  const t = translations[userProfile.language].nav;
  
  // Admin check
  const tgUser = getTelegramUser();
  const isAdmin = String(tgUser?.id) === '5928372261';

  const navItems = [
    { id: AppTab.DASHBOARD, label: t.dashboard, icon: <LayoutDashboard size={20} /> },
    { id: AppTab.HABITS, label: t.habits, icon: <CheckSquare size={20} /> },
    { id: AppTab.PLAN, label: t.plan, icon: <Calendar size={20} /> },
    { id: AppTab.COACH, label: t.coach, icon: <MessageSquare size={20} /> },
    { id: AppTab.ACCOUNT, label: t.account, icon: <User size={20} /> },
  ];

  if (isAdmin) {
    navItems.push({ id: AppTab.ADMIN, label: 'Admin', icon: <ShieldCheck size={20} /> });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-brand-gray pb-safe pt-2 px-2 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-14">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 relative ${
              activeTab === item.id ? 'text-brand-accent' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {activeTab === item.id && (
               <span className="absolute -top-2 w-8 h-1 bg-brand-accent rounded-b-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            )}
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};