import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  Plus,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  X,
  Check,
  Award,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCheck,
} from 'lucide-react';
import { StudyTask, SkillType, ReadyStudyPlan } from '../types';

export const StudyPlanView: React.FC = () => {
  const {
    currentUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    studyPlan,
    toggleTask,
    createStudyPlan,
    addTask,
    updateTask,
    deleteTask,
    readyPlans,
    adoptReadyPlan,
    models,
  } = useApp();

  // Wizard modal state for personal generated plan
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [targetDate, setTargetDate] = useState('2026-10-25');
  const [durationDays, setDurationDays] = useState(14);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [selectedRestDays, setSelectedRestDays] = useState<string[]>(['الجمعة']);
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [targetModelId, setTargetModelId] = useState('step-51');

  // Task edit / add modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDay, setTaskDay] = useState('الأحد');
  const [taskDuration, setTaskDuration] = useState(2);
  const [taskCategory, setTaskCategory] = useState<StudyTask['category']>('grammar');

  // Preview ready plan modal
  const [previewPlan, setPreviewPlan] = useState<ReadyStudyPlan | null>(null);
  const [adoptedPlanSuccess, setAdoptedPlanSuccess] = useState<string | null>(null);

  // Compute plan progress
  const tasks = studyPlan?.tasks || [];
  const completedTasks = tasks.filter((t) => t.completed);
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const daysArabic = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const toggleRestDay = (day: string) => {
    if (selectedRestDays.includes(day)) {
      setSelectedRestDays(selectedRestDays.filter((d) => d !== day));
    } else {
      setSelectedRestDays([...selectedRestDays, day]);
    }
  };

  const handleGeneratePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    createStudyPlan({
      targetDate,
      durationDays,
      hoursPerDay,
      restDays: selectedRestDays,
      currentLevel,
    });
    setIsWizardOpen(false);
  };

  const handleOpenAddTask = () => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDay('الأحد');
    setTaskDuration(2);
    setTaskCategory('grammar');
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: StudyTask) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDay(task.dayName);
    setTaskDuration(task.durationHours);
    setTaskCategory(task.category);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: taskTitle,
        dayName: taskDay,
        durationHours: taskDuration,
        category: taskCategory,
      });
    } else {
      addTask({
        title: taskTitle,
        dayName: taskDay,
        durationHours: taskDuration,
        category: taskCategory,
      });
    }
    setIsTaskModalOpen(false);
  };

  const handleAdoptPlan = (plan: ReadyStudyPlan) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    adoptReadyPlan(plan.id);
    setPreviewPlan(null);
    setAdoptedPlanSuccess(`تم بنجاح اعتماد وتفعيل "${plan.title}" كخطتك الدراسية الحالية!`);
    setTimeout(() => setAdoptedPlanSuccess(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            خطط وجداول مذاكرة STEP
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            اختر من بين الجداول الجاهزة المعتمدة من الإدارة أو أنشئ خطة مخصصة وفق موعد اختبارك وساعاتك المتاحة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddTask}
            className="py-2.5 px-3.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              } else {
                setIsWizardOpen(true);
              }
            }}
            className="py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>إنشاء خطة مخصصة</span>
          </button>
        </div>
      </div>

      {/* Unauthenticated notice */}
      {!currentUser && (
        <div className="p-5 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
          <div>
            <p className="text-xs font-bold text-blue-950">سجّل دخولك لحفظ وتفعيل خطتك ومتابعة إنجازك سحابياً</p>
            <p className="text-[11px] text-blue-800 mt-0.5">
              يمكنك استعراض الجداول المعتمدة أدناه. عند اعتماد خطة أو إنشاء جدول مخصص، سيتم ربطه بحسابك المسجل في قاعدة البيانات.
            </p>
          </div>
          <button
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            تسجيل الدخول
          </button>
        </div>
      )}

      {/* Success banner when adopting a plan */}
      {adoptedPlanSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{adoptedPlanSuccess}</span>
        </div>
      )}

      {/* SECTION 1: READY-MADE STUDY PLANS FROM ADMIN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-900" />
              <span>الجداول الجاهزة المعتمدة من المشرفين</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              خطط مدروسة ومجربة لنماذج STEP، يمكنك اعتمادها فوراً لتبدأ مذاكرتك دون تأخير.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {readyPlans.map((plan) => {
            const isCurrentlyActive = studyPlan?.title === plan.title;

            return (
              <div
                key={plan.id}
                className={`p-6 bg-white rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  isCurrentlyActive
                    ? 'border-blue-900 shadow-md ring-2 ring-blue-900/10'
                    : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {plan.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">
                      {plan.durationDays} يوم
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-950 mb-1">{plan.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>معدل يومي: <strong className="text-slate-900">{plan.dailyHours} ساعات</strong></span>
                    <span>المهام: <strong className="text-slate-900">{plan.tasks.length} مهمة</strong></span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setPreviewPlan(plan)}
                    className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
                  >
                    معاينة المهام
                  </button>

                  <button
                    onClick={() => handleAdoptPlan(plan)}
                    disabled={isCurrentlyActive}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isCurrentlyActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                        : 'bg-blue-950 hover:bg-blue-900 text-white shadow-xs'
                    }`}
                  >
                    {isCurrentlyActive ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>خطتك الحالية</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>اعتماد هذه الخطة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ACTIVE STUDENT STUDY PLAN */}
      {studyPlan ? (
        <>
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  الخطة النشطة
                </span>
                <h2 className="text-xl font-bold text-slate-950">{studyPlan.title}</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                <span>موعد الاختبار: <strong className="text-slate-800">{studyPlan.targetDate}</strong></span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span>المعدل اليومي: <strong className="text-slate-800 tabular-nums">{studyPlan.dailyHours} ساعات</strong></span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span>المستوى: <strong className="text-slate-800">{studyPlan.currentLevel === 'beginner' ? 'مبتدئ' : studyPlan.currentLevel === 'intermediate' ? 'متوسط' : 'متقدم'}</strong></span>
              </div>
            </div>

            {/* Overall Completion Metric */}
            <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">المهام المنجزة</span>
                <span className="text-lg font-bold text-blue-950 tabular-nums">
                  {completedTasks.length} / {tasks.length}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-sm tabular-nums shadow-xs">
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>نسبة إنجاز خطتك الحالية</span>
              <span className="font-bold text-blue-950 tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-950 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

      {/* Tasks Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">جدول المهام والدروس اليومية</h3>

        {tasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            لا توجد مهام حالياً. اختر من "الجداول الجاهزة" أعلاه أو اضغط على "إنشاء خطة مخصصة".
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  task.completed
                    ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-900 shadow-xs'
                }`}
              >
                {/* Checkbox & Details */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'border-slate-300 hover:border-blue-950 bg-white'
                    }`}
                    title={task.completed ? 'إلغاء الإكمال' : 'تحديد كمكتمل'}
                  >
                    {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          task.category === 'rest'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-blue-50 text-blue-950'
                        }`}
                      >
                        {task.dayName}
                      </span>
                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>

                    {task.notes && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{task.notes}</p>
                    )}
                  </div>
                </div>

                {/* Duration & Edit/Delete Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 text-xs text-slate-500 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{task.durationHours} س</span>
                  </div>

                  <button
                    onClick={() => handleOpenEditTask(task)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="تعديل المهمة"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="حذف المهمة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      ) : (
        <div className="p-8 sm:p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">لم تقم بتفعيل خطة دراسية بعد</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            اختر أحد الجداول الجاهزة المعتمدة أعلاه أو اضغط على «إنشاء خطة مخصصة» لتبدأ مسيرتك المنظمة للاستعداد لاختبار STEP.
          </p>
        </div>
      )}

      {/* MODAL: PREVIEW READY PLAN TASKS */}
      {previewPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5 text-right max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-950">{previewPlan.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  المدة: {previewPlan.durationDays} يوم · المعدل: {previewPlan.dailyHours} ساعات يومياً
                </p>
              </div>

              <button
                onClick={() => setPreviewPlan(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {previewPlan.tasks.map((task, idx) => (
                <div
                  key={task.id || idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-950 bg-blue-100/70 px-2 py-0.5 rounded">
                      {task.dayName}
                    </span>
                    <span className="font-medium text-slate-800">{task.title}</span>
                  </div>
                  <span className="text-slate-500 tabular-nums">{task.durationHours} س</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleAdoptPlan(previewPlan)}
                className="flex-1 py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                اعتماد هذه الخطة الآن
              </button>
              <button
                onClick={() => setPreviewPlan(null)}
                className="py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Generator Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-6 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">إنشاء خطة مذاكرة STEP مخصصة</h3>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              {/* Target Exam Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  موعد الاختبار المستهدف:
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 outline-none"
                  required
                />
              </div>

              {/* Ready Durations */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  المدة المتاحة للاستعداد:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[
                    { days: 7, label: '7 أيام' },
                    { days: 10, label: '10 أيام' },
                    { days: 14, label: 'أسبوعان' },
                    { days: 21, label: '3 أسابيع' },
                    { days: 30, label: 'شهر' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.days}
                      onClick={() => setDurationDays(opt.days)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        durationDays === opt.days
                          ? 'bg-blue-950 text-white border-blue-950 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours per day */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>ساعات المذاكرة يوميًا:</span>
                  <span className="text-blue-950 font-bold tabular-nums">{hoursPerDay} ساعة</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full accent-blue-950"
                />
              </div>

              {/* Target Model Focus */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  النموذج الأولي للتركيز:
                </label>
                <select
                  value={targetModelId}
                  onChange={(e) => setTargetModelId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rest Days */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  أيام الراحة والاسترجاع:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {daysArabic.map((day) => {
                    const isSelected = selectedRestDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleRestDay(day)}
                        className={`py-1.5 px-3 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  المستوى الحالي التقريبي:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'beginner' as const, label: 'مبتدئ (تأسيس)' },
                    { id: 'intermediate' as const, label: 'متوسط (تجميعات)' },
                    { id: 'advanced' as const, label: 'متقدم (محاكاة)' },
                  ].map((lvl) => (
                    <button
                      type="button"
                      key={lvl.id}
                      onClick={() => setCurrentLevel(lvl.id)}
                      className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        currentLevel === lvl.id
                          ? 'border-blue-950 bg-blue-50 text-blue-950 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  توليد الجدول تلقائيًا
                </button>
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Add / Edit Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingTaskId ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  عنوان المهمة:
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="مثال: Reading: حل قطعتين علميتين"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اليوم:</label>
                <select
                  value={taskDay}
                  onChange={(e) => setTaskDay(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                >
                  {daysArabic.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">المدة بالساعات:</label>
                <input
                  type="number"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-950 text-white rounded-xl text-xs font-bold hover:bg-blue-900 cursor-pointer"
                >
                  حفظ المهمة
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
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
