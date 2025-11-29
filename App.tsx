
import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Coach } from './components/Coach';
import { Planner } from './components/Planner';
import { PremiumModal } from './components/PremiumModal';
import { Account } from './components/Account';
import { Habits } from './components/Habits';
import { Toast } from './components/Toast';
import { Onboarding } from './components/Onboarding';
import { FocusTimer } from './components/FocusTimer';
import { useUserStore } from './store/userStore';
import { useHabitStore } from './store/habitStore';
import { initTelegramWebApp } from './utils/telegram';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  
  const { checkTrial, userProfile, initFromTelegram } = useUserStore();
  const { checkDailyReset } = useHabitStore();

  // Init Telegram WebApp and User Logic
  useEffect(() => {
    // Initialize Telegram WebApp if available
    initTelegramWebApp();
    
    // Initialize user data from Telegram
    initFromTelegram();
    
    // Check trial and daily reset
    checkTrial();
    checkDailyReset();
  }, []);

  return (
    <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-brand-accent selection:text-white overflow-hidden">
      
      {!userProfile.onboardingCompleted && <Onboarding />}
      
      <Toast />
      <PremiumModal />
      <FocusTimer />

      <main className="p-4 h-full overflow-y-auto">
        {activeTab === AppTab.DASHBOARD && (
          <Dashboard />
        )}
        
        {activeTab === AppTab.HABITS && (
          <Habits />
        )}

        {activeTab === AppTab.PLAN && (
          <Planner />
        )}

        {activeTab === AppTab.COACH && (
          <Coach />
        )}

        {activeTab === AppTab.ACCOUNT && (
          <Account />
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
