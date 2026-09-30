import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveView } from '../types';
import { BookOpen, ArrowUp } from 'lucide-react';
import { StepAvatar } from './StepAvatar';

export const Footer: React.FC = () => {
  const { setActiveView, currentAttempt } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    scrollToTop();
  };

  const isTakingExam = !!currentAttempt;

  return (
    <footer
      role="contentinfo"
      aria-label="تذييل الموقع"
      className={`relative z-10 w-full mt-auto bg-[#071328] text-slate-300 border-t border-blue-900/50 transition-colors ${
        isTakingExam ? 'pb-10 pt-8' : 'pb-24 lg:pb-10 pt-10 lg:pt-12'
      }`}
    >
      {/* Subtle background ambient glow */}
      <div
        className="absolute top-0 right-1/4 w-96 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-96 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main Footer Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-slate-800/80 items-start">
          {/* Main Brand Column: مرشدك لاختبار STEP */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <StepAvatar className="w-12 h-12 shadow-lg ring-1 ring-blue-500/40" />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  مرشدك لاختبار STEP
                </span>
                <span className="text-xs font-semibold text-blue-300">
                  المنصة التعليمية للتدريب والمحاكاة
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 max-w-2xl">
              منصة تعليمية متكاملة للتدريب على نماذج وتجميعات اختبار STEP، وتوفير محاكاة حقيقية مع جدول دراسي وبنك مراجعة الأخطاء لتطوير المستوى وتحقيق الدرجة المستهدفة.
            </p>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-5 lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>روابط سريعة</span>
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              <li>
                <button
                  onClick={() => handleNavClick('home')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300 py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  الرئيسية
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('exams')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300 py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  الاختبارات
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('models')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300 py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  النماذج
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('study-plan')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300 py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  خطة المذاكرة
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('mistakes')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300 py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  بنك الأخطاء
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('community')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300 py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  ملتقى STEP
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-footer Bar with Exact Name and Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-right">
            <span className="font-bold text-white text-sm">
              مرشدك لاختبار STEP
            </span>
            <span className="hidden sm:inline text-slate-600" aria-hidden="true">
              •
            </span>
            <span className="text-slate-300 font-medium">
              © 2026 SultanPMAU. جميع الحقوق محفوظة.
            </span>
          </div>

          <button
            onClick={scrollToTop}
            title="العودة لأعلى الصفحة"
            aria-label="العودة لأعلى الصفحة"
            className="p-2 rounded-lg bg-slate-900 hover:bg-blue-900 text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
