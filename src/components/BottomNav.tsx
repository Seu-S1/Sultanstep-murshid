import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveView } from '../types';
import {
  Home,
  BookOpen,
  Calendar,
  AlertCircle,
  Trophy,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView, currentAttempt, mistakes } = useApp();

  // If in the middle of taking a test, hide bottom nav to avoid accidental taps
  if (currentAttempt) return null;

  const items: { id: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
    { id: 'exams', label: 'المحاكي', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'study-plan', label: 'الخطة', icon: <Calendar className="w-5 h-5" /> },
    {
      id: 'mistakes',
      label: 'الأخطاء',
      icon: <AlertCircle className="w-5 h-5" />,
      badge: mistakes.filter((m) => !m.mastered).length,
    },
    { id: 'challenge', label: 'التحدي', icon: <Trophy className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-blue-950 font-bold bg-blue-50/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center tabular-nums">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
