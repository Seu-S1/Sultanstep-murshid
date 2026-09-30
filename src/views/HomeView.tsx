import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  Clock,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    currentUser,
    setActiveView,
    setIsAuthModalOpen,
    startExam,
    models,
    mistakes,
    attempts,
  } = useApp();

  const handleStartJourney = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setActiveView('dashboard');
    }
  };

  const activeMistakesCount = mistakes.filter((m) => !m.mastered).length;
  const recentModel = models[0] || { id: 'step-51', title: 'نموذج STEP 51' };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white pt-12 pb-16 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Right text column (in RTL, this appears on right) */}
            <div className="lg:col-span-7 space-y-6 text-right">
              {/* Unboxed editorial kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 tracking-wide">
                <span>المنصة الأكاديمية المتخصصة في كفايات STEP</span>
                <span aria-hidden="true">·</span>
                <span>تحديث 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                مرشدك
                <span className="block text-blue-950 mt-1">لاختبار STEP</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                طريقك للاستعداد لاختبار STEP، من أول تدريب إلى يوم الاختبار. تدرب على النماذج
                الحقيقية، قيّم نقاط ضعفك، ونظم خطتك بكفاءة عالية.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleStartJourney}
                  className="px-6 py-3.5 bg-blue-950 hover:bg-blue-900 text-white text-sm font-semibold rounded-xl shadow-md transition-all hover-lift flex items-center gap-2 cursor-pointer"
                >
                  <span>ابدأ رحلتك</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveView('exams')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200/90 transition-all hover-lift cursor-pointer"
                >
                  استكشف الاختبارات
                </button>
              </div>

              {/* Trust Indicators / Quick Metrics without pills */}
              <div className="pt-6 border-t border-slate-200/70 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tabular-nums">47+</span>
                  <span>نموذج STEP معتمد</span>
                </div>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 tabular-nums">3,500+</span>
                  <span>سؤال مع الشرح</span>
                </div>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700">دقة 100%</span>
                  <span>محاكاة لنظام قياس</span>
                </div>
              </div>
            </div>

            {/* Left Interactive Simulation Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-xl p-6 transition-all hover:shadow-2xl">
                {/* Header of preview card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-950 flex items-center justify-center font-bold text-xs">
                      51
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">نموذج STEP 51 — محاكي</h2>
                      <p className="text-[11px] text-slate-500">Reading Comprehension</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-blue-900" />
                    <span>01:42:15</span>
                  </div>
                </div>

                {/* Simulated Question */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>السؤال 14 من 88</span>
                    <span className="text-blue-950 font-medium">مهارة القراءة</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100" dir="ltr">
                    "By utilizing high-efficiency photovoltaic bifacial panels, the facility achieved a historically low cost of energy..."
                  </p>

                  <p className="text-xs font-semibold text-slate-900 pt-1" dir="ltr">
                    What primary advantage did the bifacial panels provide?
                  </p>

                  {/* Simulated Options */}
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 rounded-xl border border-emerald-500 bg-emerald-50/50 flex items-center justify-between text-xs transition-all">
                      <span className="text-slate-800 font-medium" dir="ltr">B. Exceptionally reduced cost of energy</span>
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">✓</span>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600 opacity-70" dir="ltr">
                      A. Doubled cooling requirements
                    </div>
                  </div>
                </div>

                {/* Explanation snippet */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-950">
                  <span className="font-bold">شرح القاعدة: </span>
                  نصت الفقرة على أن الألواح ساهمت في تحقيق تكلفة طاقة منخفضة غير مسبوقة.
                </div>

                {/* Quick button */}
                <button
                  onClick={() => startExam(recentModel.id, 'full')}
                  className="w-full mt-4 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>جرب حل النموذج الآن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "ماذا تريد أن تفعل اليوم؟" Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-right mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
            ماذا تريد أن تفعل اليوم؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            اختر مسارك اليومي للوصول للدرجة المطلوبة في اختبار كفايات اللغة الإنجليزية
          </p>
        </div>

        {/* 4 Core Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: اختبار محاكي */}
          <div
            onClick={() => setActiveView('exams')}
            className="group p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all hover-lift cursor-pointer text-right flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-950 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 text-blue-200" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                اختبار محاكي
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                اختبر نفسك في تجربة قريبة من الاختبار الحقيقي بمؤقت رسمي وتوزيع قياسي للأسئلة.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-semibold text-blue-950">
              <span>بدء اختبار</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: تدريب */}
          <div
            onClick={() => setActiveView('models')}
            className="group p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all hover-lift cursor-pointer text-right flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6 text-slate-200" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                تدريب النماذج
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                تدرب على الأسئلة والمهارات التي تحتاج إلى تطويرها وتصفح النماذج من 05 إلى 51.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-semibold text-blue-950">
              <span>استعراض النماذج</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: خطة مذاكرة */}
          <div
            onClick={() => setActiveView('study-plan')}
            className="group p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all hover-lift cursor-pointer text-right flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6 text-blue-200" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                خطة مذاكرة
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                أنشئ خطة مذاكرة تناسب وقتك وموعد اختبارك مع مهام يومية ومتابعة دقيقة للإنجاز.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-semibold text-blue-950">
              <span>تخطيط الجدول</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: مراجعة الأخطاء */}
          <div
            onClick={() => setActiveView('mistakes')}
            className="group p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all hover-lift cursor-pointer text-right flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-900 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <AlertCircle className="w-6 h-6 text-rose-200" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-900 transition-colors">
                  مراجعة الأخطاء
                </h3>
                {activeMistakesCount > 0 && (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full tabular-nums">
                    {activeMistakesCount} خطأ
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                راجع الأسئلة التي أخطأت فيها وحسّن مستواك مع شروحات القواعد وإزالة الخطأ عند الإتقان.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-xs font-semibold text-rose-900">
              <span>فتح بنك الأخطاء</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Academic Features Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5 text-blue-200" />
              </div>
              <h3 className="text-lg font-bold">تغطية شاملة لأسئلة اختبار STEP</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                توزيع الأسئلة بدقة عبر المهارات الأساسية: فهم المقروء، القواعد النحوية، فهم المسموع، والمفردات والتحليل.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-blue-200" />
              </div>
              <h3 className="text-lg font-bold">تحليل نقاط الضعف اللغوية</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                يقوم النظام برصد كل إجابة خاطئة تلقائياً وتصنيفها حسب القاعدة (مثل Mixed Conditionals أو Inversion) لإنشاء اختبارات تقوية موجهة.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-blue-200" />
              </div>
              <h3 className="text-lg font-bold">تحديث مستمر للتجميعات الحديثة</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                إضافة نماذج 2026 أولاً بأول، مع استيراد ملفات وتجميعات الطلاب وتنقيح الأسئلة للتأكد من خلوها من الأخطاء.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
