import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  BookOpen,
  Shield,
  Clock,
  Target,
  GraduationCap,
  Layers,
  HelpCircle,
  KeyRound,
  Copy,
  Check,
  Send,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';

export const AuthPageView: React.FC = () => {
  const {
    login,
    register,
    loginWithGoogle,
    requestPasswordReset,
    resetUserPassword,
    theme,
    toggleTheme,
  } = useApp();

  const [mode, setMode] = useState<
    'login' | 'register' | 'forgot' | 'reset-sent' | 'set-new-password'
  >('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Password Reset Details
  const [resetSentData, setResetSentData] = useState<{
    email: string;
    token: string;
    userName?: string;
    resetLink?: string;
  } | null>(null);
  const [isGoogleAccountNotice, setIsGoogleAccountNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // State
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google Fallback Modal (for restricted iframe environments)
  const [isGoogleFallbackOpen, setIsGoogleFallbackOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  // Check URL parameters for direct reset password links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const token = params.get('token');
      const emailParam = params.get('email');
      if (action === 'reset-password' && token && emailParam) {
        setEmail(emailParam);
        setResetSentData({
          email: emailParam,
          token: token,
        });
        setMode('set-new-password');
      }
    }
  }, []);

  // Fast shortcut fill
  const handleQuickFill = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
  };

  // Google Sign-In Handler
  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      // On success, loginWithGoogle sets currentUser, saves session, and redirects to 'home' or 'admin'
    } catch (err: any) {
      console.warn('Google Auth popup encountered:', err);
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/unauthorized-domain' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.message?.includes('popup') ||
        err?.message?.includes('cross-origin')
      ) {
        // Open friendly direct Google authentication dialog
        setIsGoogleFallbackOpen(true);
      } else {
        setError(err.message || 'تعذر استكمال المصادقة عبر Google. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Google Direct Fallback submit
  const handleGoogleFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صالح لحساب Google.');
      return;
    }
    if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@googlemail.com') && !cleanEmail.endsWith('@stepguide.sa')) {
      setError('يرجى استخدام حساب Gmail للتسجيل.');
      return;
    }
    setIsGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        name: googleNameInput.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
      });
      setIsGoogleFallbackOpen(false);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء المصادقة بحساب Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Copy reset link to clipboard
  const handleCopyLink = () => {
    if (resetSentData?.resetLink) {
      navigator.clipboard.writeText(resetSentData.resetLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Forgot password request
    if (mode === 'forgot') {
      if (!cleanEmail) {
        setError('يرجى إدخال بريدك الإلكتروني لاستعادة كلمة المرور.');
        return;
      }
      if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@stepguide.sa')) {
        setError('يرجى استخدام حساب Gmail للتسجيل.');
        return;
      }

      setIsSubmitting(true);
      setIsGoogleAccountNotice(false);

      try {
        const res = await requestPasswordReset(cleanEmail);

        if (res.status === 'google_account') {
          // As required: Do NOT show password reset for Google accounts, explain authentication is via Google
          setIsGoogleAccountNotice(true);
          return;
        }

        if (res.status === 'not_found') {
          setError(res.message);
          return;
        }

        if (res.status === 'success') {
          setResetSentData({
            email: res.email || cleanEmail,
            token: res.token || '',
            userName: res.userName,
            resetLink: res.resetLink,
          });
          setMode('reset-sent');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء معالجة استعادة كلمة المرور.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Set new password after following the link
    if (mode === 'set-new-password') {
      const resetEmail = resetSentData?.email || cleanEmail;
      const resetToken = resetSentData?.token || '';

      if (!newPassword.trim()) {
        setError('يرجى إدخال كلمة المرور الجديدة.');
        return;
      }
      if (newPassword.length < 6) {
        setError('يجب ألا تقل كلمة المرور الجديدة عن 6 خانات.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('كلمتا المرور غير متطابقتين.');
        return;
      }
      if (!resetToken) {
        setError('رمز استعادة كلمة المرور مفقود أو غير صالح. يرجى طلب رابط جديد.');
        return;
      }

      setIsSubmitting(true);
      try {
        await resetUserPassword(resetEmail, resetToken, newPassword);
        setSuccessMessage('تم تحديث كلمة المرور بنجاح وحفظها بأمان! يمكنك الآن تسجيل الدخول مباشرة.');
        setEmail(resetEmail);
        setPassword(newPassword);
        setNewPassword('');
        setConfirmNewPassword('');
        setMode('login');
      } catch (err: any) {
        setError(err.message || 'تعذر تحديث كلمة المرور. تأكد من صلاحية الرابط.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 3. Login
    if (mode === 'login') {
      if (!cleanEmail || !password.trim()) {
        setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
        return;
      }

      setIsSubmitting(true);
      try {
        const ok = await login(cleanEmail, password);
        if (!ok) {
          setError('تعذر تسجيل الدخول. يرجى التأكد من صحة البريد وحالة الحساب.');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 4. Register
    if (mode === 'register') {
      const cleanName = name.trim();
      if (!cleanName || !cleanEmail || !password.trim()) {
        setError('يرجى ملء جميع الحقول المطلوبة.');
        return;
      }
      if (!cleanEmail.endsWith('@gmail.com')) {
        setError('يرجى استخدام حساب Gmail للتسجيل.');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمتا المرور غير متطابقتين.');
        return;
      }
      if (password.length < 6) {
        setError('يجب ألا تقل كلمة المرور عن 6 خانات.');
        return;
      }

      setIsSubmitting(true);
      try {
        const ok = await register(cleanName, cleanEmail, password);
        if (!ok) {
          setError('تعذر إنشاء الحساب. تحقق من الاتصال بالشبكة أو استخدام بريد مختلف.');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء إنشاء الحساب.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-900 flex flex-col justify-between text-right selection:bg-blue-600 selection:text-white"
      dir="rtl"
    >
      {/* Top Simple Brand Bar */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-white flex items-center justify-center border border-blue-800 shadow-sm">
              <Compass className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block">
                مرشدك لاختبار STEP
              </span>
              <span className="text-[11px] text-blue-300/80">
                المنصة الأكاديمية الشاملة لكفايات اللغة الإنجليزية
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle (Dark / Light Mode) */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
              title={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن (تقليل إجهاد العين أثناء المذاكرة)'}
              className="py-1.5 px-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-medium"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>الوضع الفاتح</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-300" />
                  <span>الوضع الداكن</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>بوابة دخول آمنة ومشفرة</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white dark:bg-[#0c1322] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] transition-colors">
          {/* Left Column (Brand Highlights & Testimonial) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden order-2 lg:order-1">
            {/* Background decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top section */}
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>المنصة الرائدة في المملكة لاختبار STEP</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
                طريقك المنظم للحصول على الدرجة المطلوبة في اختبار كفايات
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                انضم إلى آلاف الطلاب واستعد بأحدث النماذج المعتمدة لاختبار STEP مع شرح وافٍ لكل سؤال وتتبع ذكي لنقاط ضعفك.
              </p>

              {/* Core Features list */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">
                      بنك أسئلة قياس المعتمد
                    </strong>
                    <span className="text-[11px] text-slate-300">
                      أكثر من 3,500 سؤال تغطي القواعد، القراءة، والتحليل.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">
                      محاكاة واقعية لنظام الاختبار
                    </strong>
                    <span className="text-[11px] text-slate-300">
                      مؤقت زمني دقيق وتقسيم قياسي للأقسام والمهارات.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">
                      حفظ دائم وسحابي لتقدمك
                    </strong>
                    <span className="text-[11px] text-slate-300">
                      بنك الأخطاء، سجل المحاولات، وجدولك الدراسي محفوظ بأمان.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Admin Hint / Quick Credentials Helper */}
            <div className="pt-8 border-t border-slate-800/80 mt-6 relative z-10 text-xs text-slate-300 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">
                حسابات تجريبية سريعة:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setIsGoogleAccountNotice(false);
                    handleQuickFill('student@stepguide.sa', '123456');
                  }}
                  className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  طالب تجريبي
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setIsGoogleAccountNotice(false);
                    handleQuickFill('admin@stepguide.sa', 'admin123');
                  }}
                  className="py-1 px-2.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-[11px] font-medium border border-blue-700 transition-colors cursor-pointer"
                >
                  مشرف المنصة (لوحة الإدارة)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Auth Forms) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center order-1 lg:order-2">
            <div className="max-w-md mx-auto w-full space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {mode === 'login'
                    ? 'تسجيل الدخول'
                    : mode === 'register'
                    ? 'إنشاء حساب طالب جديد'
                    : mode === 'forgot'
                    ? 'استعادة كلمة المرور'
                    : mode === 'reset-sent'
                    ? 'رسالة إعادة التعيين الآمنة'
                    : 'تعيين كلمة مرور جديدة'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'login'
                    ? 'أدخل بيانات حسابك للمتابعة إلى المنصة واختباراتك.'
                    : mode === 'register'
                    ? 'سجّل الآن لبدء التدريب على نماذج STEP وحفظ تقدمك سحابياً.'
                    : mode === 'forgot'
                    ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور.'
                    : mode === 'reset-sent'
                    ? 'تم إرسال رابط آمن ومباشر لإعادة تعيين كلمة المرور لحسابك.'
                    : 'ضع كلمة مرور جديدة قوية وآمنة لحسابك المسجل.'}
                </p>
              </div>

              {/* Tab Switcher (Login / Register only) */}
              {(mode === 'login' || mode === 'register') && (
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setIsGoogleAccountNotice(false);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                      setIsGoogleAccountNotice(false);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    إنشاء حساب جديد
                  </button>
                </div>
              )}

              {/* Google Sign-in Option (Only for standard login & register) */}
              {(mode === 'login' || mode === 'register') && (
                <div className="space-y-4 pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isSubmitting || isGoogleLoading}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
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
                    <span>
                      {mode === 'register'
                        ? 'المتابعة السريعة باستخدام Google'
                        : 'المتابعة باستخدام Google'}
                    </span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[11px] text-slate-400 font-medium shrink-0">
                      أو متابعة التسجيل بالبريد
                    </span>
                    <div className="border-t border-slate-200 w-full" />
                  </div>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Success banner */}
              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              )}

              {/* Google Account Special Notice in Forgot View */}
              {isGoogleAccountNotice && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        حسابك مؤمّن ومسجل عبر Google
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        هذا الحساب مرتبط بتسجيل الدخول المباشر بحساب Google. المصادقة تتم بأمان من خلال Google نفسه دون الحاجة لكلمة مرور منفصلة بالمنصة.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>تسجيل الدخول بحساب Google الآن</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Mode: Reset Email Sent (Step 2 & 3 in user request) */}
              {mode === 'reset-sent' && resetSentData && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                        <Send className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-emerald-950">
                          تم إرسال رسالة آمنة لإعادة تعيين كلمة المرور
                        </h3>
                        <p className="text-[11px] text-emerald-800 mt-0.5 font-mono" dir="ltr">
                          {resetSentData.email}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pt-1">
                      مرحباً {resetSentData.userName || 'طالب STEP'}، تم توليد رابط آمن لتعيين كلمة مرور جديدة لحسابك. صلاحية هذا الرابط ساعة واحدة.
                    </p>

                    {/* Step 3: Open link and set new password directly */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setSuccessMessage(null);
                          setMode('set-new-password');
                        }}
                        className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>فتح الرابط ووضع كلمة المرور الجديدة الآن</span>
                      </button>

                      {resetSentData.resetLink && (
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">تم نسخ الرابط للحافظة</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>نسخ رابط إعادة التعيين</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                        setSuccessMessage(null);
                        setIsGoogleAccountNotice(false);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-blue-950 cursor-pointer"
                    >
                      ← العودة لتسجيل الدخول
                    </button>
                  </div>
                </div>
              )}

              {/* Mode: Set New Password (Step 3 & 4) */}
              {mode === 'set-new-password' && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>
                      إعادة تعيين كلمة المرور لحساب:{' '}
                      <strong className="font-mono">{resetSentData?.email || email}</strong>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      كلمة المرور الجديدة *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-left font-mono"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      تأكيد كلمة المرور الجديدة *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-left font-mono"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>حفظ كلمة المرور الجديدة وتحديث الحساب</span>
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError(null);
                        setSuccessMessage(null);
                        setIsGoogleAccountNotice(false);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-blue-950 cursor-pointer"
                    >
                      إلغاء والعودة لتسجيل الدخول
                    </button>
                  </div>
                </form>
              )}

              {/* Standard Form: (Login, Register, Forgot Email Request) */}
              {(mode === 'login' || mode === 'register' || mode === 'forgot') &&
                !isGoogleAccountNotice && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name (Register only) */}
                    {mode === 'register' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          الاسم الكامل *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="مثال: عبدالله محمد الشهري"
                            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-right"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email (All modes) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        البريد الإلكتروني *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@gmail.com"
                          className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-left font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Password (Login & Register) */}
                    {mode !== 'forgot' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 block">
                            كلمة المرور *
                          </label>
                          {mode === 'login' && (
                            <button
                              type="button"
                              onClick={() => {
                                setMode('forgot');
                                setError(null);
                                setSuccessMessage(null);
                                setIsGoogleAccountNotice(false);
                              }}
                              className="text-[11px] font-semibold text-blue-900 hover:text-blue-950 cursor-pointer"
                            >
                              نسيت كلمة المرور؟
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-left font-mono"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Confirm Password (Register only) */}
                    {mode === 'register' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">
                          تأكيد كلمة المرور *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-left font-mono"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>
                            {mode === 'login'
                              ? 'تسجيل الدخول'
                              : mode === 'register'
                              ? 'إنشاء الحساب والبدء الآن'
                              : 'إرسال رابط إعادة التعيين الآمن'}
                          </span>
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Forgot password back link */}
                    {mode === 'forgot' && (
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('login');
                            setError(null);
                            setSuccessMessage(null);
                            setIsGoogleAccountNotice(false);
                          }}
                          className="text-xs font-bold text-slate-600 hover:text-blue-950 cursor-pointer"
                        >
                          ← العودة لتسجيل الدخول
                        </button>
                      </div>
                    )}
                  </form>
                )}

              {/* Terms hint */}
              <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-2">
                بالدخول للمنصة، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الأكاديمية لمنصة مرشدك لاختبار STEP.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950/40">
        <p>© 2026 مرشدك لاختبار STEP — جميع الحقوق محفوظة.</p>
      </footer>

      {/* Google Fallback Modal (Fallback if browser/iframe blocks popup) */}
      {isGoogleFallbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-right space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setIsGoogleFallbackOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  المصادقة باستخدام حساب Google
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
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
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              أدخل بريدك الإلكتروني المرتبط بحساب Google لتسجيل الدخول أو إنشاء حساب الطالب مباشرة وربطه بقاعدة البيانات:
            </p>

            <form onSubmit={handleGoogleFallbackSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  بريد Google الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-left font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  الاسم الظاهر بحسابك (اختياري)
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="اسمك الثلاثي"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-right"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoogleFallbackOpen(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isGoogleLoading}
                  className="py-2 px-5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>المتابعة إلى المنصة</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
