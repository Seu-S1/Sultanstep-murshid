import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  History,
  TrendingUp,
  X,
  Eye,
  Check,
  Award,
} from 'lucide-react';
import { ExamAttempt, ExamModel } from '../types';

export const ModelsLibraryView: React.FC = () => {
  const { models, questions, attempts, startExam, resumeExam, viewAttemptResult, currentUser, setActiveView } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');

  // Selected model for previous attempts modal
  const [selectedModelForAttempts, setSelectedModelForAttempts] = useState<ExamModel | null>(null);

  // Get all attempts for a given model, sorted chronologically ascending
  const getModelAttempts = (modelId: string): ExamAttempt[] => {
    return attempts
      .filter((a) => a.modelId === modelId)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  };

  // Compute status & summary for each model
  const getModelSummary = (modelId: string) => {
    const modelAttempts = getModelAttempts(modelId);
    const inProg = modelAttempts.find((a) => a.status === 'in_progress');
    const completed = modelAttempts.filter((a) => a.status === 'completed');

    if (inProg) {
      return {
        status: 'in_progress' as const,
        attemptId: inProg.id,
        attemptsCount: modelAttempts.length,
        latestScore: completed.length > 0 ? completed[completed.length - 1].scorePercent : undefined,
      };
    }

    if (completed.length > 0) {
      const latest = completed[completed.length - 1];
      const highest = Math.max(...completed.map((a) => a.scorePercent ?? 0));
      return {
        status: 'completed' as const,
        attemptsCount: completed.length,
        latestScore: latest.scorePercent,
        highestScore: highest,
        latestAttempt: latest,
      };
    }

    return {
      status: 'not_started' as const,
      attemptsCount: 0,
    };
  };

  // Filtered models - strictly ordered ascending from 05 to 51
  const filteredModels = useMemo(() => {
    return models
      .filter((model) => {
        const matchesSearch =
          model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.number.toString().includes(searchQuery) ||
          model.description.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        const summary = getModelSummary(model.id);
        if (statusFilter !== 'all' && summary.status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => a.number - b.number);
  }, [models, searchQuery, statusFilter, attempts]);

  // Attempts list for modal
  const activeModalAttempts = useMemo(() => {
    if (!selectedModelForAttempts) return [];
    return getModelAttempts(selectedModelForAttempts.id);
  }, [selectedModelForAttempts, attempts]);

  // Compute evolution / progress delta between first and last attempt
  const evolutionDelta = useMemo(() => {
    const completed = activeModalAttempts.filter((a) => a.status === 'completed');
    if (completed.length < 2) return null;
    const first = completed[0].scorePercent ?? 0;
    const last = completed[completed.length - 1].scorePercent ?? 0;
    return last - first;
  }, [activeModalAttempts]);

  const arabicAttemptOrdinals = ['المحاولة الأولى', 'المحاولة الثانية', 'المحاولة الثالثة', 'المحاولة الرابعة', 'المحاولة الخامسة', 'المحاولة السادسة', 'المحاولة السابعة', 'المحاولة الثامنة', 'المحاولة التاسعة', 'المحاولة العاشرة'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            نماذج STEP التجميعية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مكتبة النماذج التجميعية الشاملة من نموذج 05 إلى نموذج 51 مع دعم إعادة المحاولات غير المحدودة ومقارنة التطور.
          </p>
        </div>

        {/* Total models count */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span>إجمالي النماذج:</span>
          <span className="tabular-nums font-bold text-blue-950 bg-blue-50 px-2.5 py-1 rounded-lg">
            {models.length} نموذج
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم النموذج (مثال: 51 أو 48)..."
            className="w-full py-2.5 px-3 pl-9 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'جميع النماذج' },
            { id: 'not_started', label: 'لم يبدأ' },
            { id: 'in_progress', label: 'قيد التقدم' },
            { id: 'completed', label: 'مكتمل' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-blue-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">لم يتم العثور على نماذج مطابقة</p>
          <p className="text-xs text-slate-400 mt-1">جرّب مسح البحث أو تغيير الفلتر.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((model) => {
            const summary = getModelSummary(model.id);

            return (
              <div
                key={model.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between text-right"
              >
                <div>
                  {/* Top Bar inside Model Card */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-xs tabular-nums shadow-xs">
                        {model.number < 10 ? `0${model.number}` : model.number}
                      </span>
                      {model.isRecent && (
                        <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">
                          إصدار 2026
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    {summary.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>
                          {summary.attemptsCount > 1 ? `${summary.attemptsCount} محاولات (${summary.latestScore}%)` : `مكتمل (${summary.latestScore}%)`}
                        </span>
                      </span>
                    ) : summary.status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>قيد التقدم</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        لم يبدأ
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 mb-1">{model.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                    {model.description}
                  </p>

                  {/* Question count & metadata */}
                  {(() => {
                    const qCount = questions.filter((q) => q.modelId === model.id).length;
                    return (
                      <div className="py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          {qCount > 0 ? (
                            <>
                              <span className="font-bold tabular-nums text-slate-900 dark:text-white">{qCount}</span>
                              <span>سؤالاً مسجلاً</span>
                            </>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                              0 سؤال (فارغ - بانتظار رفع ملف النموذج)
                            </span>
                          )}
                          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                          <span className="tabular-nums">{model.durationMinutes}</span>
                          <span>دقيقة</span>
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                          <span>Reading</span>
                          <span aria-hidden="true">·</span>
                          <span>Listening</span>
                          <span aria-hidden="true">·</span>
                          <span>Grammar</span>
                          <span aria-hidden="true">·</span>
                          <span>Vocabulary</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom Action Area */}
                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {summary.status === 'in_progress' && summary.attemptId ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resumeExam(summary.attemptId!)}
                        className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>متابعة الاختبار</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => startExam(model.id, 'full', undefined, true)}
                        className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="بدء محاولة جديدة"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>محاولة جديدة</span>
                      </button>
                    </div>
                  ) : summary.status === 'completed' ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {/* Start New Attempt */}
                        <button
                          onClick={() => startExam(model.id, 'full', undefined, true)}
                          className="flex-1 py-2.5 px-3 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>ابدأ محاولة جديدة</span>
                        </button>

                        {/* View Previous Attempts */}
                        <button
                          onClick={() => setSelectedModelForAttempts(model)}
                          className="py-2.5 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                          <span>المحاولات السابقة ({summary.attemptsCount})</span>
                        </button>
                      </div>
                    </div>
                  ) : (() => {
                    const qCount = questions.filter((q) => q.modelId === model.id).length;
                    if (qCount === 0) {
                      return currentUser?.role === 'admin' ? (
                        <button
                          onClick={() => setActiveView('admin')}
                          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-dashed border-slate-300 dark:border-slate-700"
                        >
                          <span>رفع ملف هذا النموذج (لوحة المشرف)</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-medium flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200 dark:border-slate-800"
                          title="لم يتم رفع أسئلة هذا النموذج بعد"
                        >
                          <span>النموذج فارغ حالياً (بانتظار المشرف)</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        onClick={() => startExam(model.id, 'full')}
                        className="w-full py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>ابدأ النموذج ({qCount} سؤال)</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: PREVIOUS ATTEMPTS & PROGRESS EVOLUTION */}
      {selectedModelForAttempts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-6 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  محاولات {selectedModelForAttempts.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سجل كامل لكافة المحاولات المستقلة مع تتبع التطور بين كل محاولة وأخرى.
                </p>
              </div>

              <button
                onClick={() => setSelectedModelForAttempts(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Evolution summary banner */}
            {evolutionDelta !== null && (
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                  evolutionDelta >= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>
                    {evolutionDelta > 0
                      ? `تطور ملحوظ! تحسن مستواك بمقدار +${evolutionDelta}% بين المحاولة الأولى والأخيرة.`
                      : evolutionDelta === 0
                      ? 'مستواك ثابت بين المحاولات. ركز على معالجة بنك الأخطاء.'
                      : `فارق الدرجة: ${evolutionDelta}%.`}
                  </span>
                </div>
                <span className="font-bold tabular-nums">
                  {evolutionDelta > 0 ? `+${evolutionDelta}%` : `${evolutionDelta}%`}
                </span>
              </div>
            )}

            {/* Attempts list */}
            <div className="space-y-3">
              {activeModalAttempts.map((att, idx) => {
                const label = arabicAttemptOrdinals[idx] || `المحاولة رقم ${idx + 1}`;
                const timeSpentMinutes = Math.max(
                  1,
                  Math.round((att.totalTimeSeconds - att.timeRemainingSeconds) / 60)
                );

                return (
                  <div
                    key={att.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{label}</span>
                        <span className="text-[11px] font-bold text-blue-950 bg-blue-100/70 px-2 py-0.5 rounded-md tabular-nums">
                          {att.scorePercent}%
                        </span>
                        <span className="text-xs text-slate-400">
                          — {att.completedAt ? new Date(att.completedAt).toLocaleDateString('ar-SA') : 'اليوم'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 flex-wrap">
                        <span className="text-emerald-700 font-semibold">{att.correctCount} صحيح</span>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span className="text-rose-700 font-semibold">{att.incorrectCount} خطأ</span>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span>الوقت المستغرق: <strong className="text-slate-700">{timeSpentMinutes} دقيقة</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setSelectedModelForAttempts(null);
                          viewAttemptResult(att);
                        }}
                        className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>عرض التقرير والأخطاء</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={() => {
                  const mId = selectedModelForAttempts.id;
                  setSelectedModelForAttempts(null);
                  startExam(mId, 'full', undefined, true);
                }}
                className="flex-1 py-3 px-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ابدأ محاولة جديدة الآن</span>
              </button>

              <button
                onClick={() => setSelectedModelForAttempts(null)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
