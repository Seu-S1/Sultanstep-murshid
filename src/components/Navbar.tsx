import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveView } from '../types';
import {
  Search,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
  Cloud,
  CloudOff,
  AlertTriangle,
  Clock,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { StepAvatar } from './StepAvatar';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    activeView,
    setActiveView,
    setIsAuthModalOpen,
    setAuthModalMode,
    logout,
    switchRole,
    setIsSearchOpen,
    mistakes,
    syncStatus,
    lastSyncError,
    activeInProgressExamPrompt,
    dismissInProgressPrompt,
    resumeExam,
    deleteMyAccount,
    isDeleteAccountModalOpen,
    setIsDeleteAccountModalOpen,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const navLinks: { id: ActiveView; label: string; badge?: number }[] = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'exams', label: 'الاختبارات' },
    { id: 'models', label: 'النماذج' },
    { id: 'study-plan', label: 'خطة المذاكرة' },
    { id: 'progress', label: 'التقدم' },
    { id: 'mistakes', label: 'بنك الأخطاء', badge: mistakes.filter((m) => !m.mastered).length },
    { id: 'challenge', label: 'التحدي' },
    { id: 'community', label: 'ملتقى STEP' },
  ];

  const handleNavClick = (viewId: ActiveView) => {
    setActiveView(viewId);
    setIsMobileMenuOpen(false);
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteMyAccount();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Zone 1: Wordmark + Official Step Avatar */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2.5 text-right group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 rounded-lg py-1 px-1"
              >
                <StepAvatar className="w-10 h-10" />
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    مرشدك
                  </span>
                  <span className="text-xs font-semibold text-blue-800">
                    لاختبار STEP
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = activeView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-blue-950 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="mr-1.5 inline-flex items-center justify-center text-[10px] font-bold text-blue-950 bg-blue-100 rounded-full w-4 h-4 tabular-nums">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-[-16px] left-0 right-0 h-0.5 bg-blue-950 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Cloud Status + Search button + User Account Actions */}
            <div className="flex items-center gap-2.5">
              {/* Cloud Database Persistence Badge */}
              <div className="hidden sm:flex items-center">
                {syncStatus === 'synced' && (
                  <div
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-medium"
                    title="البيانات محفوظة بشكل دائم في قاعدة البيانات السحابية (Firestore)"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden xl:inline">قاعدة البيانات سحابية متصلة</span>
                  </div>
                )}
                {syncStatus === 'syncing' && (
                  <div
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-full text-[11px] font-medium animate-pulse"
                    title="جاري مزامنة الإجابات والنتائج مع السحابة"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-800" />
                    <span>مزامنة سحابية...</span>
                  </div>
                )}
                {syncStatus === 'offline' && (
                  <div
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-medium"
                    title="الإنترنت غير متصل. سيتم حفظ البيانات في السحابة فور استعادة الاتصال."
                  >
                    <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>غير متصل (مؤقت)</span>
                  </div>
                )}
                {syncStatus === 'error' && (
                  <div
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-[11px] font-medium"
                    title={lastSyncError || 'فشل الحفظ في السحابة'}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>تنبيه: تعذر الحفظ</span>
                  </div>
                )}
              </div>

              {/* Quick Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="البحث"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="بحث سريع (Ctrl + K)"
              >
                <Search className="w-4 h-4" />
              </button>

              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-right cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-950 text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {currentUser.role === 'admin' ? 'مشرف المنصة' : 'طالب STEP'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute left-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-right animate-in fade-in slide-in-from-top-1 duration-150"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-[11px] text-slate-400">حساب الطالب الدائم</p>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                          {currentUser.email}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>البيانات محفوظة سحابياً</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleNavClick('dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-right cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        لوحة الطالب
                      </button>

                      <button
                        onClick={() => {
                          switchRole(currentUser.role === 'admin' ? 'student' : 'admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-right cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-blue-900" />
                        {currentUser.role === 'admin' ? 'التحويل لطالب' : 'لوحة تحكم المشرف'}
                      </button>

                      <div className="border-t border-slate-100 my-1.5" />

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 text-right cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-slate-500" />
                        <span>تسجيل الخروج (يحفظ بياناتك)</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsDeleteAccountModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-right cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        <span>حذف حسابي نهائياً</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-950 hover:bg-blue-900 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    إنشاء حساب
                  </button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                aria-label="القائمة"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  activeView === link.id
                    ? 'bg-blue-50 text-blue-950 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-950 px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
            {currentUser ? (
              <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                <button
                  onClick={() => {
                    handleNavClick('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  لوحة الطالب
                </button>
                <button
                  onClick={() => {
                    switchRole(currentUser.role === 'admin' ? 'student' : 'admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 text-sm text-blue-900 font-medium hover:bg-slate-50 rounded-lg"
                >
                  {currentUser.role === 'admin' ? 'عرض كطالب' : 'لوحة تحكم المشرف'}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 mt-2 flex gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 text-center py-2 text-xs font-semibold text-white bg-blue-950 hover:bg-blue-900 rounded-lg cursor-pointer"
                >
                  إنشاء حساب
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* STICKY PROMPT: IN-PROGRESS EXAM RESUME BANNER */}
      {activeInProgressExamPrompt && activeView !== 'test' && (
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white py-3 px-4 shadow-sm border-b border-blue-800 animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <span className="font-extrabold text-xs sm:text-sm block">لديك اختبار قيد التقدم 📝</span>
                <span className="text-xs text-blue-200">
                  {activeInProgressExamPrompt.modelTitle} — السؤال{' '}
                  <strong className="text-white font-bold tabular-nums">
                    {activeInProgressExamPrompt.currentQuestionIndex + 1}
                  </strong>{' '}
                  من 88
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => resumeExam(activeInProgressExamPrompt.id)}
                className="py-1.5 px-4 bg-white text-blue-950 font-bold rounded-xl text-xs hover:bg-blue-50 transition-colors cursor-pointer shadow-xs"
              >
                [متابعة الاختبار]
              </button>

              <button
                onClick={dismissInProgressPrompt}
                className="p-1.5 text-blue-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFLINE / SYNC ERROR TOAST BANNER */}
      {syncStatus === 'error' && lastSyncError && (
        <div className="bg-rose-50 border-b border-rose-200 py-2.5 px-4 text-xs text-rose-800 text-right">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{lastSyncError}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">حذف حساب الطالب نهائياً</h3>
              <p className="text-xs text-slate-500">
                هل أنت متأكد من رغبتك في حذف حسابك؟
              </p>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl text-xs text-rose-900 space-y-2">
              <p className="font-semibold">سيتم حذف كافة بياناتك بشكل دائم من قاعدة البيانات السحابية:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                <li>سجل جميع الاختبارات والمحاولات السابقة</li>
                <li>درجاتك وإحصائيات تقدمك الأكاديمي</li>
                <li>بنك الأخطاء والأسئلة المحفوظة</li>
                <li>خطط وجداول المذاكرة المخصصة</li>
              </ul>
              <p className="font-bold pt-1 border-t border-rose-200 text-rose-950">
                ⚠️ لا يمكن التراجع عن هذا الإجراء إطلاقاً.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>تأكيد حذف الحساب نهائياً</span>
              </button>

              <button
                onClick={() => setIsDeleteAccountModalOpen(false)}
                disabled={isDeleting}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
