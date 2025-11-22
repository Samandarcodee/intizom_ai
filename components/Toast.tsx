
import React from 'react';
import { useUIStore } from '../store/uiStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center space-y-2 pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-lg min-w-[300px] max-w-sm animate-slide-up backdrop-blur-md border ${
            toast.type === 'success' 
              ? 'bg-brand-success/10 border-brand-success/30 text-brand-success' 
              : toast.type === 'error'
              ? 'bg-brand-danger/10 border-brand-danger/30 text-brand-danger'
              : 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent'
          }`}
        >
          <div className="mr-3">
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
          </div>
          <p className="flex-1 text-sm font-medium text-white">
            {toast.message}
          </p>
          <button 
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
