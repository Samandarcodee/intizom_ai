import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { ArrowRight, Sparkles, User, Target, Globe } from 'lucide-react';
import { translations, Language } from '../utils/translations';

export const Onboarding: React.FC = () => {
  const { completeOnboarding, userProfile, updateProfile } = useUserStore();
  const [step, setStep] = useState(0); // 0 is Language
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');

  // Use selected language for translations in this component
  const t = translations[userProfile.language].onboarding;

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2 && name.trim()) {
      setStep(3);
    } else if (step === 3 && goal.trim()) {
      updateProfile({ name, goal });
      completeOnboarding();
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    updateProfile({ language: lang });
    // Dont auto advance, let them see the UI change
  };

  return (
    <div className="fixed inset-0 z-[100] bg-brand-black flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Background Ambient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-10 left-10 w-64 h-64 bg-brand-accent/20 blur-[100px] rounded-full"></div>
         <div className="absolute bottom-10 right-10 w-64 h-64 bg-brand-purple/20 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {/* Step 0: Language */}
        {step === 0 && (
          <div className="text-center animate-slide-up w-full">
            <div className="w-20 h-20 bg-brand-dark rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-gray shadow-xl">
               <Globe size={40} className="text-brand-accent" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-6">{t.langTitle}</h1>
            
            <div className="space-y-3 w-full">
               <button onClick={() => handleLanguageSelect('uz')} className={`w-full p-4 rounded-xl border text-left flex items-center transition-all ${userProfile.language === 'uz' ? 'bg-brand-accent border-brand-accent text-white' : 'bg-brand-dark border-brand-gray hover:border-brand-gray/80 text-gray-300'}`}>
                 <span className="text-2xl mr-3">🇺🇿</span>
                 <span className="font-bold">O'zbekcha</span>
               </button>
               <button onClick={() => handleLanguageSelect('ru')} className={`w-full p-4 rounded-xl border text-left flex items-center transition-all ${userProfile.language === 'ru' ? 'bg-brand-accent border-brand-accent text-white' : 'bg-brand-dark border-brand-gray hover:border-brand-gray/80 text-gray-300'}`}>
                 <span className="text-2xl mr-3">🇷🇺</span>
                 <span className="font-bold">Русский</span>
               </button>
               <button onClick={() => handleLanguageSelect('en')} className={`w-full p-4 rounded-xl border text-left flex items-center transition-all ${userProfile.language === 'en' ? 'bg-brand-accent border-brand-accent text-white' : 'bg-brand-dark border-brand-gray hover:border-brand-gray/80 text-gray-300'}`}>
                 <span className="text-2xl mr-3">🇺🇸</span>
                 <span className="font-bold">English</span>
               </button>
            </div>
            <button 
              onClick={handleNext}
              className="mt-8 w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95"
            >
              {t.next}
              <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        )}

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center animate-slide-up">
            <div className="w-24 h-24 bg-gradient-to-br from-brand-accent to-brand-purple rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
               <Sparkles size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{t.step1Title}</h1>
            <p className="text-gray-400 leading-relaxed mb-8">
              {t.step1Sub}
            </p>
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg flex items-center justify-center transition-transform active:scale-95 hover:bg-gray-100"
            >
              {t.next}
              <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className="w-full animate-slide-up">
             <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-gray">
               <User size={32} className="text-gray-300" />
             </div>
             <h2 className="text-2xl font-bold text-white text-center mb-6">{t.step2Title}</h2>
             
             <div className="bg-brand-dark p-1 rounded-xl border border-brand-gray focus-within:border-brand-accent transition-colors mb-6">
               <input
                 type="text"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 placeholder={t.step2Placeholder}
                 className="w-full bg-transparent text-white p-4 outline-none text-lg text-center"
                 autoFocus
               />
             </div>

             <button 
              onClick={handleNext}
              disabled={!name.trim()}
              className="w-full py-4 bg-brand-accent text-white font-bold rounded-xl shadow-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {t.next}
              <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
          <div className="w-full animate-slide-up">
             <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-gray">
               <Target size={32} className="text-gray-300" />
             </div>
             <h2 className="text-2xl font-bold text-white text-center mb-6">{t.step3Title}</h2>
             
             <div className="bg-brand-dark p-1 rounded-xl border border-brand-gray focus-within:border-brand-accent transition-colors mb-6">
               <input
                 type="text"
                 value={goal}
                 onChange={(e) => setGoal(e.target.value)}
                 placeholder={t.step3Placeholder}
                 className="w-full bg-transparent text-white p-4 outline-none text-lg text-center"
                 autoFocus
               />
             </div>

             <button 
              onClick={handleNext}
              disabled={!goal.trim()}
              className="w-full py-4 bg-gradient-to-r from-brand-accent to-brand-purple text-white font-bold rounded-xl shadow-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            >
              {t.start}
              <Sparkles size={20} className="ml-2" />
            </button>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex space-x-2 mt-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-brand-accent' : 'w-2 bg-brand-gray'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};