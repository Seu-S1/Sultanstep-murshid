import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Users,
  Clock,
  Sparkles,
  Copy,
  Check,
  Play,
  Share2,
  Award,
  ArrowLeft,
  X,
} from 'lucide-react';

export const ChallengeArenaView: React.FC = () => {
  const { challengeRoom, createChallenge, joinChallenge, startExam } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New challenge form state
  const [challengeTitle, setChallengeTitle] = useState('تحدي النخبة: المفردات والقواعد المتقدمة');
  const [questionCount, setQuestionCount] = useState(15);
  const [timeMins, setTimeMins] = useState(15);

  const handleCopyCode = () => {
    if (!challengeRoom) return;
    navigator.clipboard.writeText(challengeRoom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    createChallenge(challengeTitle, questionCount, timeMins);
    setIsCreating(false);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    joinChallenge(inputCode);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3">
            <span>تحدي STEP</span>
            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              تنافس أكاديمي
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            أنشئ غرفة تحدٍ وشارك الرمز مع زملائك للمنافسة على حل أسئلة STEP في وقت محدد.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 justify-center cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>إنشاء تحدٍ جديد</span>
        </button>
      </div>

      {/* Code Input to Join an Existing Challenge */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">هل لديك كود تحدٍ من زميل؟</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            أدخل Challenge Code المكون من رمز ورقم للانضمام للمنافسة مباشرة
          </p>
        </div>

        <form onSubmit={handleJoin} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            dir="ltr"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="مثال: STEP-5142"
            className="p-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-900 outline-none uppercase w-full md:w-44 text-center"
          />
          <button
            type="submit"
            className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            انضمام للتحدي
          </button>
        </form>
      </div>

      {/* Active Challenge Room Display */}
      {challengeRoom && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                غرفة نشطة
              </span>
              <h2 className="text-xl font-bold text-slate-950 mt-1">{challengeRoom.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>
                    المشاركون: <strong className="text-slate-800 tabular-nums">{challengeRoom.participants.length}</strong>
                  </span>
                </div>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    الوقت: <strong className="text-slate-800 tabular-nums">{challengeRoom.timeLimitMinutes} دقيقة</strong>
                  </span>
                </div>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span>
                  الأسئلة: <strong className="text-slate-800 tabular-nums">{challengeRoom.questionCount} سؤال</strong>
                </span>
              </div>
            </div>

            {/* Challenge Code Copy Box */}
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">كود التحدي (شارك الرمز)</span>
                <span className="text-base font-mono font-bold text-blue-950">{challengeRoom.code}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                title="نسخ الرمز"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action to Start Test */}
          <div className="flex items-center justify-between p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
            <div>
              <p className="text-xs font-bold text-blue-950">هل أنت مستعد لدخول التحدي؟</p>
              <p className="text-[11px] text-blue-800 mt-0.5">
                ستبدأ حل {challengeRoom.questionCount} سؤالاً بنفس التوقيت مع بقية المتنافسين.
              </p>
            </div>
            <button
              onClick={() => startExam('step-51', 'quick')}
              className="py-2.5 px-5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>بدء التحدي الآن</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>لوحة ترتيب المتنافسين (Leaderboard)</span>
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              {challengeRoom.participants.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    p.isCurrentUser ? 'bg-blue-50/50 font-bold' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs text-slate-900 font-semibold">{p.name}</span>
                      <span className="text-[10px] text-slate-400 block tabular-nums">
                        الوقت: {Math.floor(p.timeSpentSeconds / 60)} د {p.timeSpentSeconds % 60} ث
                      </span>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-bold text-blue-950 tabular-nums">
                      {p.score}%
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {p.finished ? 'مكتمل' : 'قيد الحل'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">إنشاء تحدٍ أكاديمي جديد</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم أو عنوان التحدي:
                </label>
                <input
                  type="text"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  عدد الأسئلة:
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  <option value={10}>10 أسئلة (سريع)</option>
                  <option value={15}>15 سؤالاً (متوازن)</option>
                  <option value={25}>25 سؤالاً (مكثف)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الوقت المحدد (بالدقائق):
                </label>
                <select
                  value={timeMins}
                  onChange={(e) => setTimeMins(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  <option value={10}>10 دقائق</option>
                  <option value={15}>15 دقيقة</option>
                  <option value={20}>20 دقيقة</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-950 text-white rounded-xl text-xs font-bold hover:bg-blue-900 cursor-pointer"
                >
                  إنشاء واستخراج الكود
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
