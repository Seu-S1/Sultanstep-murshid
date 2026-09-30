import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  CheckCircle,
  Filter,
  Check,
  Search,
  BookOpen,
  Sparkles,
  Trash2,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { SkillType } from '../types';

export const MistakesReviewView: React.FC = () => {
  const {
    currentUser,
    mistakes,
    removeMistake,
    questions,
    models,
    startExam,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useApp();

  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // If user is not logged in, show unauthenticated state requiring sign in
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto shadow-xs border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            سجّل دخولك للوصول إلى بنك الأخطاء
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            بنك الأخطاء يحفظ تلقائياً أي سؤال تجيب عليه بشكل غير صحيح أثناء التدريب، لتتمكن من مراجعته والتدرب عليه لاحقاً.
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

  // Hydrate mistake items with question details
  const enrichedMistakes = useMemo(() => {
    return mistakes.map((m) => {
      const q = questions.find((item) => item.id === m.questionId);
      return {
        ...m,
        question: q,
      };
    });
  }, [mistakes, questions]);

  // Filter mistakes
  const filteredMistakes = useMemo(() => {
    return enrichedMistakes.filter((item) => {
      if (!item.question) return false;

      if (selectedModel !== 'all' && item.modelId !== selectedModel) return false;
      if (selectedSkill !== 'all' && item.question.skill !== selectedSkill) return false;

      if (searchQuery.trim()) {
        const qText = item.question.questionText.toLowerCase();
        const expText = item.question.explanation.toLowerCase();
        const term = searchQuery.toLowerCase().trim();
        if (!qText.includes(term) && !expText.includes(term)) return false;
      }

      return true;
    });
  }, [enrichedMistakes, selectedModel, selectedSkill, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3">
            <span>بنك مراجعة الأخطاء</span>
            {mistakes.length > 0 && (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 tabular-nums">
                {mistakes.length} سؤال
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            مستودع الأسئلة التي تعثرت فيها. راجع القاعدة النحوية والشرح، وأزل السؤال فور إتقانه.
          </p>
        </div>

        {mistakes.length > 0 && (
          <button
            onClick={() => startExam('step-51', 'weaknesses')}
            className="py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 justify-center cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>تدريب علاجي على هذه الأخطاء</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نص السؤال أو الشرح..."
            className="w-full py-2 px-3 pl-8 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        {/* Filter by Model */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 shrink-0">النموذج:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 outline-none w-full md:w-44"
          >
            <option value="all">جميع النماذج</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Skill */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 shrink-0">المهارة:</span>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 outline-none w-full md:w-44"
          >
            <option value="all">جميع المهارات</option>
            <option value="grammar">القواعد (Grammar)</option>
            <option value="reading">فهم المقروء (Reading)</option>
            <option value="vocabulary">المفردات (Vocabulary)</option>
            <option value="listening">فهم المسموع (Listening)</option>
          </select>
        </div>

        {/* Reset filters if applied */}
        {(selectedModel !== 'all' || selectedSkill !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedModel('all');
              setSelectedSkill('all');
              setSearchQuery('');
            }}
            className="text-xs text-blue-950 font-semibold hover:underline"
          >
            إعادة الضبط
          </button>
        )}
      </div>

      {/* List of Mistake Cards */}
      {filteredMistakes.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">بنك الأخطاء خالٍ تماماً!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {mistakes.length === 0
              ? 'رائع! لا توجد أي أخطاء مسجلة، استمر في حل النماذج المحاكية لاختبار نفسك.'
              : 'لا توجد أخطاء تطابق الفلتر المحدد حالياً.'}
          </p>
          <button
            onClick={() => startExam('step-51', 'full')}
            className="mt-3 py-2 px-4 bg-blue-950 text-white text-xs font-bold rounded-xl hover:bg-blue-900 cursor-pointer"
          >
            بدء نموذج محاكي
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((item) => {
            const q = item.question!;
            return (
              <div
                key={item.id}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all space-y-4 text-right"
              >
                {/* Card Top Metadata without pills */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-950">{item.modelTitle}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700 uppercase">{q.skill}</span>
                    <span aria-hidden="true">·</span>
                    <span>أضيف في: {item.dateAdded}</span>
                  </div>

                  {/* Remove Button (أتقنت السؤال) */}
                  <button
                    onClick={() => removeMistake(item.id)}
                    className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="إزالة هذا السؤال من بنك الأخطاء"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>أتقنت السؤال (إزالة من الأخطاء)</span>
                  </button>
                </div>

                {/* If reading passage exists */}
                {q.passage && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 font-sans leading-relaxed" dir="ltr">
                    <span className="font-bold text-slate-900 block mb-1">Passage Excerpt:</span>
                    {q.passage.slice(0, 240)}...
                  </div>
                )}

                {/* Question Text */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-950 leading-relaxed" dir="ltr">
                    {q.questionText}
                  </h3>
                </div>

                {/* Options Grid with user selection vs correct answer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt) => {
                    const isUserWrong = item.userWrongOption === opt.id;
                    const isCorrect = q.correctOption === opt.id;

                    let optionClass = 'border-slate-200 bg-white text-slate-700';
                    if (isCorrect) {
                      optionClass = 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-bold';
                    } else if (isUserWrong) {
                      optionClass = 'border-rose-300 bg-rose-50/70 text-rose-950';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optionClass}`}
                      >
                        <div className="flex items-center gap-2" dir="ltr">
                          <span className="font-bold">{opt.id}.</span>
                          <span>{opt.text}</span>
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded shadow-xs">
                            الإجابة الصحيحة ✓
                          </span>
                        )}
                        {isUserWrong && (
                          <span className="text-[10px] font-bold text-rose-800 bg-white px-2 py-0.5 rounded shadow-xs">
                            اختيارك السابق ✗
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-950 leading-relaxed">
                  <strong className="font-bold block mb-1 text-blue-900">
                    💡 الشرح والتوضيح الأكاديمي:
                  </strong>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
