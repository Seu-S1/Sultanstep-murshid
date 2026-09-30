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
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);
  const [isForgotView, setIsForgotView] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isForgotView) {
      if (!email.trim() || !email.includes('@')) {
        setError('يرجى إدخال بريد إلكتروني صحيح');
        return;
      }
      setForgotPasswordSubmitted(true);
      return;
    }

    if (authModalMode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
      }

      setIsSubmitting(true);
      try {
        const ok = await login(email);
        if (!ok) {
          setError('فشل تسجيل الدخول. يرجى التحقق من الاتصال بالإنترنت.');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('يرجى ملء جميع الحقول');
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
        const ok = await register(name, email);
        if (!ok) {
          setError('تعذر إنشاء الحساب في قاعدة البيانات. تحقق من الاتصال.');
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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-right"
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
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-7 pb-4 bg-gradient-to-b from-blue-50/50 to-white">
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
                    placeholder="name@domain.com"
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
