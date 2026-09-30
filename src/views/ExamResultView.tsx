import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  RotateCcw,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { SkillType } from '../types';

export const ExamResultView: React.FC = () => {
  const {
    lastCompletedAttempt,
    setActiveView,
    startExam,
    questions,
  } = useApp();

  if (!lastCompletedAttempt) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">لا توجد نتائج اختبار متاحة حالياً</p>
        <button
          onClick={() => setActiveView('exams')}
          className="text-xs text-blue-950 font-bold hover:underline"
        >
          استعراض الاختبارات المحاكية
        </button>
      </div>
    );
  }

  const score = lastCompletedAttempt.scorePercent || 0;
  const correct = lastCompletedAttempt.correctCount || 0;
  const incorrect = lastCompletedAttempt.incorrectCount || 0;
  const unanswered = lastCompletedAttempt.unansweredCount || 0;
  const timeUsedMinutes = Math.max(
    1,
    Math.round(
      (lastCompletedAttempt.totalTimeSeconds - lastCompletedAttempt.timeRemainingSeconds) / 60
    )
  );

  // Skill labels
  const skillLabels: Record<SkillType, string> = {
    reading: 'فهم المقروء (Reading)',
    grammar: 'القواعد والتركيب (Grammar)',
    listening: 'فهم المسموع (Listening)',
    vocabulary: 'المفردات والتحليل (Vocabulary)',
  };

  // Find mistakes in this attempt
  const wrongQuestions = questions.filter(
    (q) =>
      lastCompletedAttempt.userAnswers[q.id] &&
      lastCompletedAttempt.userAnswers[q.id] !== q.correctOption
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-right">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
          انتهى الاختبار 🎉
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          تم تصحيح محاولتك في <strong className="text-slate-900">{lastCompletedAttempt.modelTitle}</strong> بدقة. إليك التقرير الشامل لمستواك:
        </p>
      </div>

      {/* Main Score Visual Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm text-center relative overflow-hidden">
        {/* Big percentage ring */}
        <div className="max-w-xs mx-auto py-2">
          <div className="text-5xl sm:text-6xl font-extrabold text-blue-950 tabular-nums">
            {score}%
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-2">
            {score >= 80
              ? 'مستوى ممتاز ومتقدم جداً 🌟'
              : score >= 65
              ? 'مستوى جيد، بقيت خطوات بسيطة نحو الإتقان 👍'
              : 'بداية جيدة، ركز على مراجعة بنك الأخطاء وتثبيت القواعد 💪'}
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 mt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium block">إجابات صحيحة</span>
            <div className="text-xl font-extrabold text-emerald-700 mt-1 tabular-nums flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{correct}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium block">إجابات خاطئة</span>
            <div className="text-xl font-extrabold text-rose-700 mt-1 tabular-nums flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4" />
              <span>{incorrect}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium block">لم تتم الإجابة</span>
            <div className="text-xl font-extrabold text-slate-600 mt-1 tabular-nums flex items-center justify-center gap-1">
              <HelpCircle className="w-4 h-4" />
              <span>{unanswered}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-xs text-slate-500 font-medium block">الوقت المستخدم</span>
            <div className="text-xl font-extrabold text-blue-950 mt-1 tabular-nums flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timeUsedMinutes} د</span>
            </div>
          </div>
        </div>
      </div>

      {/* "تحليل أدائك" Section (Skill Breakdown) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">تحليل أدائك حسب المهارات</h2>
          <p className="text-xs text-slate-500 mt-1">
            نسبة إتقانك لكل قسم معياري في اختبار STEP لتعرف أين تركز في جدول المذاكرة.
          </p>
        </div>

        <div className="space-y-5">
          {lastCompletedAttempt.skillBreakdown &&
            (Object.keys(lastCompletedAttempt.skillBreakdown) as SkillType[]).map((skill) => {
              const data = lastCompletedAttempt.skillBreakdown![skill];
              if (data.total === 0) return null;

              return (
                <div key={skill} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{skillLabels[skill]}</span>
                    <span className="tabular-nums text-slate-500">
                      <strong className="text-slate-900">{data.correct}</strong> من {data.total} أسئلة{' '}
                      <span className="font-bold text-blue-950 mr-1.5">({data.percent}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        data.percent >= 75
                          ? 'bg-emerald-600'
                          : data.percent >= 50
                          ? 'bg-blue-900'
                          : 'bg-rose-600'
                      }`}
                      style={{ width: `${data.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* "الأسئلة التي أخطأت فيها" Preview */}
      {wrongQuestions.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h2 className="text-lg font-bold text-slate-950">الأسئلة التي أخطأت فيها في هذا الاختبار</h2>
            </div>
            <span className="text-xs font-bold text-rose-700 tabular-nums">
              {wrongQuestions.length} سؤال
            </span>
          </div>

          <p className="text-xs text-slate-500">
            تمت إضافة هذه الأسئلة تلقائيًا إلى "بنك مراجعة الأخطاء" لتتمكن من مراجعة الشرح بالتفصيل وإزالتها عند الإتقان.
          </p>

          <div className="space-y-3">
            {wrongQuestions.slice(0, 3).map((q) => {
              const wrongOpt = lastCompletedAttempt.userAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 text-xs"
                >
                  <p className="font-medium text-slate-900" dir="ltr">
                    {q.questionText}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-600 flex-wrap">
                    <span className="text-rose-700">اختيارك السابق: {wrongOpt}</span>
                    <span className="text-emerald-700 font-bold">الإجابة الصحيحة: {q.correctOption}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <strong className="text-slate-700">الشرح: </strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          onClick={() => setActiveView('mistakes')}
          className="w-full sm:flex-1 py-3.5 px-6 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <AlertCircle className="w-4 h-4" />
          <span>مراجعة الأخطاء في بنك الأسئلة</span>
        </button>

        <button
          onClick={() => startExam(lastCompletedAttempt.modelId, lastCompletedAttempt.examType)}
          className="w-full sm:w-auto py-3.5 px-6 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>إعادة الاختبار</span>
        </button>

        <button
          onClick={() => setActiveView('dashboard')}
          className="w-full sm:w-auto py-3.5 px-6 text-slate-500 hover:text-slate-900 text-xs font-semibold cursor-pointer"
        >
          العودة للوحة الطالب
        </button>
      </div>
    </div>
  );
};
