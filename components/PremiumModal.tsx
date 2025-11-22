import React from 'react';
import { useUserStore } from '../store/userStore';
import { Star, CheckCircle, Zap } from 'lucide-react';
import { translations } from '../utils/translations';

export const PremiumModal: React.FC = () => {
  const { showPaywall, userStatus, daysUsed, upgradeToPremium, userProfile, closePaywall } = useUserStore();
  const t = translations[userProfile.language].premium;
  
  const isExpired = !userStatus.isPremium && daysUsed > 7;

  if (!showPaywall) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-brand-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-brand-dark border border-brand-warning/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-brand-warning/10">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-warning/20 blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <Star size={32} className="text-white fill-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isExpired ? t.expiredTitle : t.title}
          </h2>
          <p className="text-gray-300 text-sm">
            {isExpired ? t.expiredDesc : t.desc}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {t.features.map((feature, idx) => (
             <div key={idx} className="flex items-center p-3 bg-brand-black/50 rounded-xl border border-brand-gray/50">
               <CheckCircle size={20} className="text-brand-success mr-3 flex-shrink-0" />
               <span className="text-sm text-gray-200">{feature}</span>
             </div>
          ))}
        </div>

        <button
          onClick={upgradeToPremium}
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center transition-all transform active:scale-95"
        >
          <Zap size={20} className="mr-2 fill-white" />
          {isExpired ? t.restore : t.button}
        </button>

        <p className="text-center text-[10px] text-gray-500 mt-4">
          {t.cancel}
        </p>
        
        {!isExpired && (
           <button onClick={closePaywall} className="w-full mt-2 text-gray-600 text-xs hover:text-gray-400">
             Close
           </button>
        )}
      </div>
    </div>
  );
};