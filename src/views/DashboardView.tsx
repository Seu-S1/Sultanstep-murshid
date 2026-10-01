import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  CheckCircle,
  Award,
  Flame,
  Play,
  ArrowLeft,
  Calendar,
  AlertCircle,
  BookOpen,
  User,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Eye,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    setActiveView,
    attempts,
    studyPlan,
    startExam,
    resumeExam,
    mistakes,
    models,
    setIsAuthModalOpen,
    setAuthModalMode,
    theme,
    setTheme,
    toggleTheme,
  } = useApp();

  // If user is not logged in, show unauthenticated state requiring sign in
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-950 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            سجّل دخولك للوصول إلى لوحة التحكم
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            لوحة التحكم مخصصة لحسابك الشخصي. سجّل دخولك لعرض اسمك الحقيقي، ومتابعة إحصائياتك ومحاولاتك المحفوظة سحابياً، وخطة دراستك في اختبار STEP.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover-lift flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </button>
          <button
            onClick={() => {
              setAuthModalMode('register');
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all hover-lift flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب جديد</span>
          </button>
        </div>
      </div>
    );
  }

  // Real authenticated student name from database
  const userName = currentUser.name;

  // Compute metrics from real attempts
  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const inProgressAttempt = attempts.find((a) => a.status === 'in_progress');

  // Total questions solved
  const totalQuestionsSolved = completedAttempts.reduce(
    (sum, a) => sum + (a.correctCount || 0) + (a.incorrectCount || 0),
    0
  );

  // Overall progress percentage based on completed models
  const totalModelsCount = models.length;
  const progressPercent = totalModelsCount > 0
    ? Math.min(100, Math.round((completedAttempts.length / totalModelsCount) * 100))
    : 0;

  // Active mistakes
  const unresolvedMistakes = mistakes.filter((m) => !m.mastered);

  // Today's pending tasks from study plan
  const todayTasks = studyPlan?.tasks.filter((t) => !t.completed).slice(0, 3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              مرحبًا، {userName} 👋
            </h1>
            <p className="text-sm text-blue-200">
              “جاهز تكمل مذاكرتك؟ خطتك اليوم تقربك من درجتك المستهدفة.”
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => startExam('step-51', 'quick')}
              className="py-2.5 px-4 bg-white hover:bg-slate-100 text-blue-950 text-xs font-bold rounded-xl shadow-sm transition-all hover-lift cursor-pointer flex items-center gap-1.5"
            >
              <span>تدريب سريع (15 دقيقة)</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* بيئة المذاكرة وتقليل إجهاد العين (Dark Mode Toggle) */}
      <div className="p-5 sm:p-6 bg-white dark:bg-[#0c1322] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/60">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                بيئة المذاكرة ومظهر المنصة
              </h3>
              <span className="text-[10px] font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md">
                راحة العين
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              بدّل بين الوضع الفاتح والوضع الداكن لتقليل إجهاد العين أثناء جلسات المذاكرة والتدريب الطويلة.
            </p>
          </div>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>الوضع الفاتح</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-blue-950 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4 text-blue-300" />
            <span>الوضع الداكن</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: نسبة التقدم */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">نسبة التقدم</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-950 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums">
            {progressPercent}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-950 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card 2: الأسئلة المحلولة */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">الأسئلة المحلولة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums">
            {totalQuestionsSolved}
          </div>
          <p className="text-[11px] text-slate-400">سؤالاً تم حله وتحليله</p>
        </div>

        {/* Card 3: الاختبارات المكتملة */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">الاختبارات المكتملة</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums">
            {completedAttempts.length}
          </div>
          <p className="text-[11px] text-slate-400">محاولات مسجلة بدرجاتها</p>
        </div>

        {/* Card 4: أيام المذاكرة المتتالية */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">أيام المذاكرة المتتالية</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums">
            {currentUser.studyStreak ?? 0}{' '}
            <span className="text-xs font-normal text-slate-500">أيام</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">سلسلة الالتزام الحالية</p>
        </div>
      </div>

      {/* "أكمل من حيث توقفت" Card */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">أكمل من حيث توقفت</h2>

        {inProgressAttempt ? (
          <div className="p-6 bg-white rounded-2xl border border-blue-200/80 shadow-sm space-y-4 hover:border-blue-400 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    قيد التقدم
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {inProgressAttempt.modelTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  بدأته في {new Date(inProgressAttempt.startedAt).toLocaleDateString('ar-SA')}
                </p>
              </div>

              <button
                onClick={() => resumeExam(inProgressAttempt.id)}
                className="py-2.5 px-5 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover-lift flex items-center gap-2 justify-center cursor-pointer"
              >
                <span>متابعة الاختبار</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  السؤال: <strong className="text-slate-900 tabular-nums">{inProgressAttempt.currentQuestionIndex + 1}</strong> /{' '}
                  <span className="tabular-nums">88</span>
                </span>
                <span className="tabular-nums font-semibold text-blue-900">
                  {Math.round(((inProgressAttempt.currentQuestionIndex + 1) / 88) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-950 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(((inProgressAttempt.currentQuestionIndex + 1) / 88) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Default Recommended Next Activity Card if no active unfinished attempt */
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    النموذج الموصى به
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    STEP 51 — Reading & Grammar
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  أحدث نماذج 2026 مع قطع القراءة المطولة وأسئلة القواعد الشائعة.
                </p>
              </div>

              <button
                onClick={() => startExam('step-51', 'full')}
                className="py-2.5 px-5 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover-lift flex items-center gap-2 justify-center cursor-pointer"
              >
                <span>بدء الاختبار</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>السؤال: <strong className="text-slate-900 tabular-nums">0</strong> / 88</span>
                <span>لم يبدأ بعد</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2" />
            </div>
          </div>
        )}
      </div>

      {/* Two Column Grid: Today's Tasks & Weak Points quick access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Study Tasks */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-950" />
              <h3 className="text-sm font-bold text-slate-900">مهام خطتك لليوم</h3>
            </div>
            <button
              onClick={() => setActiveView('study-plan')}
              className="text-xs text-blue-900 font-semibold hover:underline"
            >
              عرض الجدول الكامل
            </button>
          </div>

          <div className="space-y-2.5">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-900" />
                    <div>
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      <p className="text-[10px] text-slate-500">{task.dayName} · {task.durationHours} ساعة</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveView('study-plan')}
                    className="text-blue-950 font-bold hover:underline"
                  >
                    إنجاز
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">
                لقد أنجزت جميع مهامك المقررة! يمكنك بدء نموذج جديد أو مراجعة الأخطاء.
              </p>
            )}
          </div>
        </div>

        {/* Mistakes Review Callout */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">بنك مراجعة الأخطاء</h3>
            </div>
            <button
              onClick={() => setActiveView('mistakes')}
              className="text-xs text-rose-700 font-semibold hover:underline"
            >
              فتح البنك ({unresolvedMistakes.length})
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-600 leading-relaxed">
              لديك <strong className="text-slate-900 tabular-nums">{unresolvedMistakes.length}</strong> أسئلة
              تحتاج إلى تثبيت القواعد وإعادة المحاولة حتى تتقنها بالكامل.
            </p>

            <button
              onClick={() => startExam('step-51', 'weaknesses')}
              disabled={unresolvedMistakes.length === 0}
              className="w-full mt-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-900 disabled:opacity-50 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>بدء اختبار نقاط الضعف الآن</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
