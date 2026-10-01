import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Mail, User, Compass, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    loginWithGoogle,
    requestPasswordReset,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);
  const [isForgotView, setIsForgotView] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleAuth = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.warn('Google auth error in modal:', err);
      setError(err.message || 'تعذر تسجيل الدخول بحساب Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isForgotView) {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setError('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }
      if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@stepguide.sa')) {
        setError('يرجى استخدام حساب Gmail للتسجيل.');
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await requestPasswordReset(cleanEmail);
        if (res.status === 'google_account') {
          setError('هذا الحساب مسجل عبر Google. يتم تسجيل الدخول مباشرة بزر Google دون الحاجة لكلمة مرور.');
          return;
        }
        if (res.status === 'not_found') {
          setError(res.message);
          return;
        }
        setForgotPasswordSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء طلب استعادة كلمة المرور');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (authModalMode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
      }

      setIsSubmitting(true);
      try {
        const ok = await login(email, password);
        if (ok) {
          setIsAuthModalOpen(false);
        } else {
          setError('فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const cleanEmail = email.trim().toLowerCase();
      if (!name.trim() || !cleanEmail || !password.trim()) {
        setError('يرجى ملء جميع الحقول');
        return;
      }
      if (!cleanEmail.endsWith('@gmail.com')) {
        setError('يرجى استخدام حساب Gmail للتسجيل.');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمتا المرور غير متطابقتين');
        return;
      }
      if (password.length < 6) {
        setError('يجب أن تكون كلمة المرور 6 خانات على الأقل');
        return;
      }

      setIsSubmitting(true);
      try {
        const ok = await register(name, cleanEmail, password);
        if (ok) {
          setIsAuthModalOpen(false);
        } else {
          setError('تعذر إنشاء الحساب. تحقق من الاتصال.');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#0c1322] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-right transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setIsForgotView(false);
            setForgotPasswordSubmitted(false);
            setError(null);
          }}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-7 pb-4 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/40 dark:to-[#0c1322]">
          <div className="w-12 h-12 rounded-xl bg-blue-950 text-white flex items-center justify-center mb-4 shadow-sm">
            <Compass className="w-6 h-6 text-blue-200" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            مرحبًا بك في مرشدك لاختبار STEP
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {isForgotView
              ? 'أدخل بريدك الإلكتروني لاستلام رابط تعيين كلمة المرور'
              : 'سجّل دخولك وابدأ رحلة الاستعداد لاختبار STEP.'}
          </p>
        </div>

        {/* Forgot Password Confirmation Screen */}
        {forgotPasswordSubmitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">تم إرسال رابط التعيين</h3>
            <p className="text-xs text-slate-500">
              أرسلنا تعليمات استعادة كلمة المرور إلى {email}. تحقق من صندوق الوارد.
            </p>
            <button
              onClick={() => {
                setIsForgotView(false);
                setForgotPasswordSubmitted(false);
                setAuthModalMode('login');
              }}
              className="w-full py-2.5 px-4 bg-blue-950 text-white text-xs font-semibold rounded-xl hover:bg-blue-900 transition-colors cursor-pointer"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : isForgotView ? (
          /* Forgot Password Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full py-2.5 px-3 pl-9 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-left"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-950 text-white text-xs font-semibold rounded-xl hover:bg-blue-900 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>إرسال رابط الاستعادة</span>
            </button>

            <button
              type="button"
              onClick={() => setIsForgotView(false)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              العودة لتسجيل الدخول
            </button>
          </form>
        ) : (
          /* Login / Register Tab Form */
          <div className="p-6">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'login'
                    ? 'bg-white text-blue-950 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  authModalMode === 'register'
                    ? 'bg-white text-blue-950 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                إنشاء حساب طالب
              </button>
            </div>

            {/* Google Sign-in Button */}
            <div className="space-y-3 mb-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting || isGoogleLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>المتابعة باستخدام Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2.5 text-[10px] text-slate-400 font-medium shrink-0">
                  أو بالبريد الإلكتروني
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authModalMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اكتب اسمك الحقيقي الكامل"
                      className="w-full py-2.5 px-3 pl-9 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full py-2.5 px-3 pl-9 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-left"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">كلمة المرور</label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setIsForgotView(true)}
                      className="text-[11px] text-blue-800 hover:underline cursor-pointer"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2.5 px-3 pl-9 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-left"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {authModalMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      dir="ltr"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full py-2.5 px-3 pl-9 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-left"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 bg-blue-950 text-white text-xs font-semibold rounded-xl hover:bg-blue-900 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الاتصال بقاعدة البيانات...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {authModalMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب وحفظ البيانات سحابياً'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
