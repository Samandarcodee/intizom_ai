import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithCoach } from '../services/geminiService';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { useUserStore } from '../store/userStore';
import { Send, Bot, Trash2 } from 'lucide-react';
import { translations } from '../utils/translations';

export const Coach: React.FC = () => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { history, addMessage, clearHistory } = useChatStore();
  const { addToast } = useUIStore();
  const { userProfile } = useUserStore();
  const t = translations[userProfile.language].coach;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const apiHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    try {
      const responseText = await chatWithCoach(apiHistory, userText, userProfile.language);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      addMessage(aiMsg);
    } catch (error) {
      addToast(t.error, 'error');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in">
      <div className="bg-brand-dark p-4 border-b border-brand-gray flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-purple-600 flex items-center justify-center relative">
            <Bot size={20} className="text-white" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-success border-2 border-brand-dark rounded-full"></span>
          </div>
          <div>
            <h2 className="font-bold text-white">{t.title}</h2>
            <p className="text-xs text-gray-400">
              {t.status}
            </p>
          </div>
        </div>
        {history.length > 0 && (
           <button onClick={clearHistory} className="p-2 text-gray-500 hover:text-red-500 transition-colors" title={t.clear}>
             <Trash2 size={18} />
           </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && (
          <div className="text-center text-gray-500 mt-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-gray/30 rounded-full flex items-center justify-center mb-4">
               <Bot size={32} className="text-brand-accent opacity-80" />
            </div>
            <p className="font-medium text-white">{t.welcome}</p>
            <p className="text-xs mt-2 max-w-xs">{t.welcomeSub}</p>
          </div>
        )}
        {history.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                msg.role === 'user'
                  ? 'bg-brand-accent text-white rounded-br-none'
                  : 'bg-brand-gray text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-brand-gray p-4 rounded-2xl rounded-bl-none flex space-x-1.5 items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-brand-black border-t border-brand-gray">
        <div className="flex items-center bg-brand-dark rounded-full border border-brand-gray px-2 py-1 focus-within:border-brand-accent transition-colors shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent border-none text-white text-sm p-3 pl-4 focus:ring-0 focus:outline-none placeholder-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="p-2.5 bg-brand-accent rounded-full text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 m-1"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};