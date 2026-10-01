import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, BookOpen, HelpCircle, ArrowLeft } from 'lucide-react';
import { Question } from '../types';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, models, questions, startExam, setActiveView } = useApp();
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return { models: [], questions: [] };
    const q = query.toLowerCase().trim();

    const matchedModels = models.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.number.toString().includes(q)
    );

    const matchedQuestions = questions.filter(
      (qu) =>
        qu.questionText.toLowerCase().includes(q) ||
        qu.explanation.toLowerCase().includes(q) ||
        qu.skill.toLowerCase().includes(q) ||
        qu.options.some((o) => o.text.toLowerCase().includes(q))
    );

    return {
      models: matchedModels.slice(0, 4),
      questions: matchedQuestions.slice(0, 6),
    };
  }, [query, models, questions]);

  if (!isSearchOpen) return null;

  const handleSelectModel = (modelId: string) => {
    setIsSearchOpen(false);
    startExam(modelId, 'full');
  };

  const handleSelectQuestion = (q: Question) => {
    setIsSearchOpen(false);
    startExam(q.modelId, 'quick');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0c1322] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن نموذج، سؤال، قاعدة نحوية، أو مفردة..."
            className="w-full text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              مسح
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">عمليات بحث شائعة في STEP:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['STEP 51', 'Mixed Conditionals', 'Solar Energy', 'Inversion', 'المفردات الأكاديمية'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="text-xs py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : searchResults.models.length === 0 && searchResults.questions.length === 0 ? (
            <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-xs">
              لم نعثر على نتائج مطابقة لـ "{query}". جرّب كتابة كلمة مفتاحية أخرى.
            </div>
          ) : (
            <>
              {searchResults.models.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">نماذج STEP</h4>
                  <div className="space-y-1.5">
                    {searchResults.models.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectModel(m.id)}
                        className="w-full text-right p-3 rounded-xl hover:bg-blue-50/70 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                            {m.number}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-950 dark:group-hover:text-blue-300">
                              {m.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                              {m.description}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-blue-800 dark:text-blue-400 font-medium flex items-center gap-1">
                          بدء النموذج <ArrowLeft className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.questions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">الأسئلة والقواعد</h4>
                  <div className="space-y-1.5">
                    {searchResults.questions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleSelectQuestion(q)}
                        className="w-full text-right p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/40 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                            {q.skill.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {q.modelId.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2" dir="ltr">
                          {q.questionText}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          الشرح: {q.explanation}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Footer hint */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>يمكنك التصفح بالأسهم والضغط على Enter</span>
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setActiveView('models');
            }}
            className="text-blue-900 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            عرض مكتبة جميع النماذج
          </button>
        </div>
      </div>
    </div>
  );
};
