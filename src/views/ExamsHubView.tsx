import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  HelpCircle,
  BarChart2,
  Sparkles,
  Zap,
  Target,
  Sliders,
  ArrowLeft,
  X,
  Check,
} from 'lucide-react';
import { SkillType } from '../types';

export const ExamsHubView: React.FC = () => {
  const { startExam, mistakes, models } = useApp();

  // Custom Test Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customModelId, setCustomModelId] = useState(models[0]?.id || 'step-51');
  const [customCount, setCustomCount] = useState(25);
  const [customTime, setCustomTime] = useState(30);
  const [customSkills, setCustomSkills] = useState<SkillType[]>([
    'grammar',
    'reading',
    'vocabulary',
  ]);

  const unresolvedMistakesCount = mistakes.filter((m) => !m.mastered).length;

  const toggleSkill = (skill: SkillType) => {
    if (customSkills.includes(skill)) {
      if (customSkills.length > 1) {
        setCustomSkills(customSkills.filter((s) => s !== skill));
      }
    } else {
      setCustomSkills([...customSkills, skill]);
    }
  };

  const handleStartCustomExam = () => {
    setIsCustomModalOpen(false);
    startExam(customModelId, 'custom', {
      questionCount: customCount,
      skills: customSkills,
      timeMinutes: customTime,
    });
  };

  const examTypes = [
    {
      id: 'full',
      name: 'المحاكي الكامل',
      description: 'اختبار شامل يحاكي تجربة STEP الفعلية بكافة أقسامه وتوقيته القياسي.',
      questionsCount: '88 سؤالاً',
      time: '110 دقيقة',
      level: 'شامل قياسي',
      levelBadgeClass: 'bg-blue-50 text-blue-900 border-blue-200',
      icon: <Target className="w-6 h-6 text-blue-950" />,
      action: () => startExam('step-51', 'full'),
      recommended: true,
    },
    {
      id: 'quick',
      name: 'اختبار سريع',
      description: 'اختبار قصير للمراجعة اليومية السريعة وتنشيط المهارات وتثبيت القواعد.',
      questionsCount: '15 سؤالاً',
      time: '15 دقيقة',
      level: 'متوسط',
      levelBadgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <Zap className="w-6 h-6 text-emerald-700" />,
      action: () => startExam('step-51', 'quick'),
    },
    {
      id: 'weaknesses',
      name: 'اختبار نقاط الضعف',
      description: 'ينشئ اختبارًا مخصصاً وموجهاً بناءً على الأسئلة التي أخطأت فيها سابقاً لتجاوز الصعوبات.',
      questionsCount: `${Math.max(unresolvedMistakesCount, 5)} أسئلة`,
      time: '20 دقيقة',
      level: 'مكثف علاجي',
      levelBadgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <BarChart2 className="w-6 h-6 text-rose-700" />,
      action: () => startExam('step-51', 'weaknesses'),
      disabled: unresolvedMistakesCount === 0,
      disabledNotice: 'لا توجد أخطاء مسجلة حالياً',
    },
    {
      id: 'custom',
      name: 'اختبار مخصص',
      description: 'يمنحك كامل الحرية لاختيار عدد الأسئلة، المهارات المستهدفة، والنموذج والوقت المحدد.',
      questionsCount: 'حسب اختيارك',
      time: 'مرن',
      level: 'مخصص',
      levelBadgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: <Sliders className="w-6 h-6 text-slate-700" />,
      action: () => setIsCustomModalOpen(true),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-right">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
          اختبارات STEP المحاكية
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          “اختبر مستواك في تجربة تحاكي اختبار STEP وراجع أداءك بعد كل محاولة.”
        </p>
      </div>

      {/* 4 Large Modern Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examTypes.map((exam) => (
          <div
            key={exam.id}
            className={`p-7 bg-white rounded-2xl border transition-all hover-lift flex flex-col justify-between ${
              exam.recommended
                ? 'border-blue-300 shadow-md ring-1 ring-blue-100'
                : 'border-slate-200/80 shadow-xs hover:border-slate-300'
            }`}
          >
            <div>
              {/* Header row inside card */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {exam.icon}
                </div>
                <div className="flex items-center gap-2">
                  {exam.recommended && (
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      موصى به لليوم
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${exam.levelBadgeClass}`}
                  >
                    {exam.level}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{exam.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                {exam.description}
              </p>

              {/* Exam specs info with typographic separators */}
              <div className="flex items-center gap-3 text-xs text-slate-500 py-4 my-2 border-y border-slate-100">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <HelpCircle className="w-4 h-4 text-blue-900" />
                  <span className="tabular-nums">{exam.questionsCount}</span>
                </div>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Clock className="w-4 h-4 text-blue-900" />
                  <span className="tabular-nums">{exam.time}</span>
                </div>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span>تغذية راجعة فورية</span>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                onClick={exam.action}
                disabled={exam.disabled}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  exam.disabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : exam.recommended
                    ? 'bg-blue-950 hover:bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>ابدأ الاختبار</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              {exam.disabled && (
                <p className="text-[11px] text-slate-400 text-center mt-1.5">
                  {exam.disabledNotice}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Test Configuration Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-6 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">تخصيص الاختبار المحاكي</h3>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select Model */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                النموذج المستهدف:
              </label>
              <select
                value={customModelId}
                onChange={(e) => setCustomModelId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 outline-none"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} — {m.description.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Select Skills */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                المهارات اللغوية المشمولة:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'grammar' as SkillType, label: 'القواعد (Grammar)' },
                  { id: 'reading' as SkillType, label: 'فهم المقروء (Reading)' },
                  { id: 'vocabulary' as SkillType, label: 'المفردات (Vocabulary)' },
                  { id: 'listening' as SkillType, label: 'فهم المسموع (Listening)' },
                ].map((s) => {
                  const isChecked = customSkills.includes(s.id);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleSkill(s.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        isChecked
                          ? 'border-blue-900 bg-blue-50 text-blue-950 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{s.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-blue-900" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions count slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>عدد الأسئلة:</span>
                <span className="text-blue-950 tabular-nums">{customCount} سؤال</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={customCount}
                onChange={(e) => setCustomCount(Number(e.target.value))}
                className="w-full accent-blue-950"
              />
            </div>

            {/* Duration slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>الوقت المحدد:</span>
                <span className="text-blue-950 tabular-nums">{customTime} دقيقة</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={customTime}
                onChange={(e) => setCustomTime(Number(e.target.value))}
                className="w-full accent-blue-950"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={handleStartCustomExam}
                className="flex-1 py-3 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                بدء الاختبار المخصص الآن
              </button>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
