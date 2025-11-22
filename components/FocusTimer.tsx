
import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';
import { X, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { translations } from '../utils/translations';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds

export const FocusTimer: React.FC = () => {
  const { isFocusModeOpen, setFocusModeOpen, addToast } = useUIStore();
  const { userProfile } = useUserStore();
  const t = translations[userProfile.language].focus;

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      addToast(t.sessionComplete, 'success');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, addToast, t.sessionComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(FOCUS_TIME);
    setIsFinished(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isFocusModeOpen) return null;

  const percentage = Math.round(((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100);

  return (
    <div className="fixed inset-0 z-[60] bg-brand-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
      <button 
        onClick={() => setFocusModeOpen(false)}
        className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
      >
        <X size={32} />
      </button>

      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-gray-400">{t.subtitle}</p>
      </div>

      <div className="w-64 h-64 relative mb-12">
        <CircularProgressbar
          value={percentage}
          text={formatTime(timeLeft)}
          styles={buildStyles({
            textSize: '20px',
            pathColor: isFinished ? '#10b981' : '#3b82f6',
            textColor: '#fff',
            trailColor: '#2a2a2a',
            pathTransitionDuration: 0.5,
          })}
        />
        {isFinished && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
             <CheckCircle2 size={64} className="text-brand-success" />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-6">
        {!isFinished ? (
          <>
            <button 
              onClick={toggleTimer}
              className={`p-6 rounded-full shadow-lg transition-all transform active:scale-95 ${
                isActive ? 'bg-brand-gray text-white' : 'bg-brand-accent text-white'
              }`}
            >
              {isActive ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
            </button>
            <button 
              onClick={resetTimer}
              className="p-6 rounded-full bg-brand-dark border border-brand-gray text-gray-400 hover:text-white transition-all"
            >
              <RotateCcw size={32} />
            </button>
          </>
        ) : (
          <button 
            onClick={resetTimer}
            className="px-8 py-4 bg-brand-success text-black font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            {t.stayHard}
          </button>
        )}
      </div>
    </div>
  );
};
