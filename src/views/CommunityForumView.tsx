import React from 'react';
import { Send, ExternalLink, MessageCircle, FileText, Sparkles, ShieldCheck } from 'lucide-react';

export const CommunityForumView: React.FC = () => {
  const telegramResources = [
    {
      id: 'archive',
      title: 'أرشيف ستيب',
      description: 'المكتبة الشاملة لتجميعات اختبار كفايات STEP، ملفات PDF، ونماذج السنوات السابقة المنقحة.',
      link: 'https://t.me/stepseu0',
      badge: 'أرشيف رسمي موثوق',
      membersHint: '+120,000 طالب',
    },
    {
      id: 'group',
      title: 'قروب ستيب',
      description: 'المجتمع الأكبر لطلاب STEP للمناقشات اللغوية، تبادل الأسئلة اليومية وشرح القواعد الصعبة.',
      link: 'https://t.me/Step_S25',
      badge: 'مجتمع تفاعلي 24/7',
      membersHint: '+85,000 عضو',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-right">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3">
          <span>ملتقى STEP</span>
          <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
            روابط Telegram معتمدة
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          قنوات ومجموعات التيليجرام الأكثر نفعاً وموثوقية لطلاب اختبار STEP في المملكة العربية السعودية.
        </p>
      </div>

      {/* Main Telegram Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {telegramResources.map((res) => (
          <div
            key={res.id}
            className="p-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-sky-300 transition-all hover-lift flex flex-col justify-between"
          >
            <div>
              {/* Telegram Icon and Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
                  <Send className="w-6 h-6 -translate-x-0.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-sky-900 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {res.badge}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">{res.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed min-h-[44px]">
                {res.description}
              </p>

              <div className="pt-4 pb-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>تفاعل المجتمع:</span>
                <span className="font-bold text-slate-800 tabular-nums">{res.membersHint}</span>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={res.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>الانتقال إلى {res.title} في Telegram</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Advice and Etiquette Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-7 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>توجيهات مفيدة للمذاكرة التشاركية:</span>
        </div>
        <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>استخدم القروب للسؤال عن الأسئلة الغامضة بعد أن تحاول حلها بنفسك أولاً.</li>
          <li>احرص على تنزيل النماذج الأحدث من أرشيف ستيب لمطابقتها مع تجميعات 2026.</li>
          <li>تجنب حفظ الإجابات مجردة، وركز دائمًا على معرفة القاعدة النحوية أو سبب استبعاد الخيارات الأخرى.</li>
        </ul>
      </div>
    </div>
  );
};
