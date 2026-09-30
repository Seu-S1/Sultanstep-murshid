import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  X,
  Volume2,
  FileText,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Check,
} from 'lucide-react';
import { Question } from '../types';

export const ActiveExamView: React.FC = () => {
  const {
    currentAttempt,
    activeQuestions,
    submitAnswer,
    toggleFlagQuestion,
    setCurrentQuestionIndex,
    updateCurrentAttemptTime,
    finishExam,
    exitExamEarly,
  } = useApp();

  // Local state
  const [secondsLeft, setSecondsLeft] = useState<number>(
    currentAttempt?.timeRemainingSeconds || 6600
  );
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [passageFontSize, setPassageFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  if (!currentAttempt || activeQuestions.length === 0) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">لا يوجد اختبار نشط حالياً</p>
        <button
          onClick={() => exitExamEarly()}
          className="text-xs text-blue-900 font-bold hover:underline"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const currentIndex = currentAttempt.currentQuestionIndex;
  const currentQuestion: Question | undefined = activeQuestions[currentIndex];
  const totalCount = activeQuestions.length;

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Sync remaining seconds to database every 10 seconds and on tab leave
  useEffect(() => {
    const syncInterval = setInterval(() => {
      updateCurrentAttemptTime(secondsLeft);
    }, 10000);

    const handleBeforeUnload = () => {
      updateCurrentAttemptTime(secondsLeft);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [secondsLeft, updateCurrentAttemptTime]);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const isLowTime = secondsLeft < 300; // less than 5 minutes

  // Compute answers summary
  const answeredQuestionIds = Object.keys(currentAttempt.userAnswers);
  const answeredCount = answeredQuestionIds.length;
  const unansweredCount = totalCount - answeredCount;
  const flaggedCount = currentAttempt.flaggedQuestions.length;

  const isCurrentFlagged = currentQuestion
    ? currentAttempt.flaggedQuestions.includes(currentQuestion.id)
    : false;

  const currentSelectedOption = currentQuestion
    ? currentAttempt.userAnswers[currentQuestion.id]
    : undefined;

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentQuestionIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentQuestionIndex(currentIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleNext();
      if (e.key === 'ArrowRight') handlePrev();
      if (['1', 'a', 'A'].includes(e.key) && currentQuestion) submitAnswer(currentQuestion.id, 'A');
      if (['2', 'b', 'B'].includes(e.key) && currentQuestion) submitAnswer(currentQuestion.id, 'B');
      if (['3', 'c', 'C'].includes(e.key) && currentQuestion) submitAnswer(currentQuestion.id, 'C');
      if (['4', 'd', 'D'].includes(e.key) && currentQuestion) submitAnswer(currentQuestion.id, 'D');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQuestion]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-right">
      {/* Top Test Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Right: Model Name & Question Progress */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => exitExamEarly(secondsLeft)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="خروج وحفظ المحاولة ومتابعتها لاحقاً"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {currentAttempt.modelTitle}
                </span>
                <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                  {currentQuestion?.skill || 'General'}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                السؤال <strong className="text-slate-900 tabular-nums">{currentIndex + 1}</strong> من{' '}
                <span className="tabular-nums">{totalCount}</span>
              </div>
            </div>
          </div>

          {/* Center: Live Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold tabular-nums transition-colors ${
              isLowTime
                ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-900" />
            <span>المؤقت: {formatTime(secondsLeft)}</span>
          </div>

          {/* Left: Question Drawer Toggle & Finish Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGridOpen(!isGridOpen)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">أرقام الأسئلة</span>
              <span className="tabular-nums font-bold text-blue-950">
                ({answeredCount}/{totalCount})
              </span>
            </button>

            <button
              onClick={() => setIsFinishConfirmOpen(true)}
              className="py-1.5 px-3.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              إنهاء الاختبار
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question / Passage Split Layout */}
          <div className={`${currentQuestion?.passage ? 'lg:col-span-12 xl:grid xl:grid-cols-12 xl:gap-6' : 'lg:col-span-8 lg:col-start-3'} w-full`}>
            
            {/* If there is a reading passage, show it in a dedicated column */}
            {currentQuestion?.passage && (
              <div className="xl:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 mb-6 xl:mb-0 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                    <FileText className="w-4 h-4 text-blue-900" />
                    <span>{currentQuestion.passageTitle || 'Reading Comprehension Passage'}</span>
                  </div>

                  {/* Font size control */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setPassageFontSize('sm')}
                      className={`px-2 py-0.5 rounded font-bold ${
                        passageFontSize === 'sm' ? 'bg-white shadow-xs' : 'text-slate-600'
                      }`}
                      title="خط أصغر"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setPassageFontSize('base')}
                      className={`px-2 py-0.5 rounded font-bold ${
                        passageFontSize === 'base' ? 'bg-white shadow-xs' : 'text-slate-600'
                      }`}
                      title="خط قياسي"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setPassageFontSize('lg')}
                      className={`px-2 py-0.5 rounded font-bold ${
                        passageFontSize === 'lg' ? 'bg-white shadow-xs' : 'text-slate-600'
                      }`}
                      title="خط أكبر"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div
                  className={`text-slate-800 leading-relaxed space-y-3 font-sans ${
                    passageFontSize === 'sm'
                      ? 'text-xs leading-5'
                      : passageFontSize === 'lg'
                      ? 'text-base leading-7'
                      : 'text-sm leading-6'
                  }`}
                  dir="ltr"
                >
                  {currentQuestion.passage.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Question & Options Column */}
            <div className={`${currentQuestion?.passage ? 'xl:col-span-6' : ''} space-y-6`}>
              {/* Question Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
                {/* Listening Audio Script Alert if Listening skill */}
                {currentQuestion?.skill === 'listening' && (
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                      <Volume2 className="w-4 h-4 text-blue-900" />
                      <span>المقطع الصوتي (استمع للسياق أو اقرأ النص):</span>
                    </div>
                    {currentQuestion.audioScript && (
                      <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-blue-100 font-mono leading-relaxed" dir="ltr">
                        {currentQuestion.audioScript}
                      </p>
                    )}
                  </div>
                )}

                {/* Question Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>اختر الإجابة الصحيحة:</span>
                    <span className="text-[11px]">مفتاح الاختصار: A / B / C / D</span>
                  </div>
                  <h2
                    className="text-base sm:text-lg font-semibold text-slate-950 leading-relaxed"
                    dir="ltr"
                  >
                    {currentQuestion?.questionText}
                  </h2>
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQuestion?.options.map((opt) => {
                    const isSelected = currentSelectedOption === opt.id;
                    const isAnswerGiven = !!currentSelectedOption;
                    const isSelectedCorrect = currentSelectedOption === currentQuestion.correctOption;
                    const isThisTheCorrectAnswer = opt.id === currentQuestion.correctOption;

                    let btnStyles = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white text-slate-800';
                    let badgeNumberStyles = 'bg-slate-100 text-slate-700 group-hover:bg-slate-200';

                    if (isSelected) {
                      if (isSelectedCorrect) {
                        btnStyles = 'border-emerald-600 bg-emerald-50/90 shadow-xs text-emerald-950';
                        badgeNumberStyles = 'bg-emerald-600 text-white';
                      } else {
                        btnStyles = 'border-rose-600 bg-rose-50/90 shadow-xs text-rose-950';
                        badgeNumberStyles = 'bg-rose-600 text-white';
                      }
                    } else if (isAnswerGiven && isThisTheCorrectAnswer && !isSelectedCorrect) {
                      btnStyles = 'border-emerald-400/90 bg-emerald-50/40 text-emerald-950';
                      badgeNumberStyles = 'bg-emerald-600 text-white';
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => submitAnswer(currentQuestion.id, opt.id)}
                        className={`w-full p-4 rounded-xl border text-right transition-all flex items-center justify-between group cursor-pointer ${btnStyles}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${badgeNumberStyles}`}
                          >
                            {opt.id}
                          </span>
                          <span
                            className={`text-sm ${
                              isSelected ? 'font-bold' : ''
                            }`}
                            dir="ltr"
                          >
                            {opt.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected && isSelectedCorrect && (
                            <span className="px-2.5 py-1 bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>@إجابة صحيحة</span>
                            </span>
                          )}

                          {isSelected && !isSelectedCorrect && (
                            <span className="px-2.5 py-1 bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1">
                              <X className="w-3.5 h-3.5" />
                              <span>❌ إجابة خاطئة</span>
                            </span>
                          )}

                          {!isSelected && isAnswerGiven && isThisTheCorrectAnswer && !isSelectedCorrect && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded border border-emerald-200">
                              الإجابة المعتمدة ({opt.id})
                            </span>
                          )}

                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? isSelectedCorrect
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-rose-600 bg-rose-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Instant Feedback Notice directly tied to DB correctOption */}
                {currentSelectedOption && currentQuestion && (
                  <div className="pt-2">
                    {currentSelectedOption === currentQuestion.correctOption ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-950">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="block text-sm font-extrabold text-emerald-950">@إجابة صحيحة 🎉</strong>
                          <span className="text-emerald-800 font-medium">
                            أحسنت! اختيارك متطابق تماماً مع مفتاح الإجابة المعتمد ({currentQuestion.correctOption}) المحفوظ في قاعدة البيانات.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-950">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <XCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <strong className="block text-sm font-extrabold text-rose-950">❌ إجابة خاطئة</strong>
                            <span className="text-rose-800 font-medium">
                              الإجابة الصحيحة المعتمدة في قاعدة البيانات هي: الخيار (
                              <strong className="font-mono text-emerald-700">{currentQuestion.correctOption}</strong>).
                            </span>
                          </div>
                        </div>
                        {currentQuestion.explanation && (
                          <div className="p-3 bg-white/90 rounded-xl border border-rose-100 text-[11px] text-slate-700 space-y-1">
                            <span className="font-bold text-slate-900 block">الشرح الأكاديمي المعتمد:</span>
                            <p className="leading-relaxed">{currentQuestion.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Action Controls */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>

                {/* Flag for review button */}
                <button
                  onClick={() => currentQuestion && toggleFlagQuestion(currentQuestion.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isCurrentFlagged
                      ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      isCurrentFlagged ? 'fill-amber-500 text-amber-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{isCurrentFlagged ? 'تم تمييزه للمراجعة' : 'مراجعة السؤال لاحقاً'}</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === totalCount - 1}
                  className="py-2.5 px-5 rounded-xl bg-blue-950 hover:bg-blue-900 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Question Navigator Drawer / Modal */}
      {isGridOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">جدول أرقام الأسئلة</h3>
              <button
                onClick={() => setIsGridOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600" />
                <span>تم الحل ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-500" />
                <span>للمراجعة ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-200" />
                <span>لم يتم الحل ({unansweredCount})</span>
              </div>
            </div>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-1">
              {activeQuestions.map((q, idx) => {
                const isAnswered = !!currentAttempt.userAnswers[q.id];
                const isFlagged = currentAttempt.flaggedQuestions.includes(q.id);
                const isCurrent = idx === currentIndex;

                let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isFlagged) {
                  bgClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setIsGridOpen(false);
                    }}
                    className={`h-9 rounded-lg border text-xs font-semibold tabular-nums transition-all flex items-center justify-center cursor-pointer ${bgClass} ${
                      isCurrent ? 'ring-2 ring-blue-950 scale-105 shadow-sm' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setIsGridOpen(false)}
                className="py-2 px-5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Confirmation Modal */}
      {isFinishConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-950">هل تريد إنهاء الاختبار الآن؟</h3>
              <p className="text-xs text-slate-500 mt-1">
                سيتم حفظ إجاباتك وعرض تقرير النتيجة التفصيلي مع تصحيح الأخطاء.
              </p>
            </div>

            {/* Answers breakdown notice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span>الأسئلة المجاب عنها:</span>
                <strong className="text-emerald-700 tabular-nums">{answeredCount} سؤال</strong>
              </div>
              <div className="flex justify-between">
                <span>الأسئلة غير المحلولة:</span>
                <strong className="text-rose-700 tabular-nums">{unansweredCount} سؤال</strong>
              </div>
              <div className="flex justify-between">
                <span>الأسئلة المميزة للمراجعة:</span>
                <strong className="text-amber-700 tabular-nums">{flaggedCount} سؤال</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsFinishConfirmOpen(false);
                  finishExam();
                }}
                className="flex-1 py-3 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                نعم، إنهاء وعرض النتيجة
              </button>
              <button
                onClick={() => setIsFinishConfirmOpen(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                العودة للاختبار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
