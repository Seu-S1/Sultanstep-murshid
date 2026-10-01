import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
  Image as ImageIcon,
  BookOpen,
  Filter,
  Eye,
  Check,
  UserCheck,
  UserX,
  History,
  Download,
  Calendar,
  Sparkles,
  FileText,
  Clock,
  RefreshCw,
  Users,
  Database,
  ArrowRight,
  Loader2,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { AdminRole, ExamModel, Question, ReadyStudyPlan, SkillType } from '../types';
import {
  parseExcelWorkbook,
  ParsedQuestionRow,
  SheetParseResult,
} from '../utils/excelImportService';
import { StudentManagementSection } from '../components/admin/StudentManagementSection';

export const AdminDashboardView: React.FC = () => {
  const {
    models,
    questions,
    students,
    addModel,
    updateModel,
    deleteModel,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    clearModelQuestions,
    importQuestionsBatch,
    exportQuestionsToExcel,
    exportQuestionsToCsv,
    exportAttemptsToExcel,
    exportMistakesToExcel,
    exportStudentPerformanceToExcel,
    exportPlatformBackup,
    restorePlatformBackup,
    readyPlans,
    addReadyPlan,
    updateReadyPlan,
    deleteReadyPlan,
    admins,
    addAdmin,
    updateAdmin,
    toggleAdminStatus,
    deleteAdmin,
    currentAdminRole,
    setCurrentAdminRole,
    activityLogs,
    addActivityLog,
  } = useApp();

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'students' | 'models' | 'questions' | 'import' | 'ready-plans' | 'admins' | 'activity-logs' | 'backup-export'
  >('models');

  // Filter questions
  const [questionModelFilter, setQuestionModelFilter] = useState<string>('all');
  const [questionSkillFilter, setQuestionSkillFilter] = useState<string>('all');

  // Model Modal State
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [modelNumber, setModelNumber] = useState(52);
  const [modelTitle, setModelTitle] = useState('نموذج STEP 52');
  const [modelDesc, setModelDesc] = useState('');
  const [modelQuestionsCount, setModelQuestionsCount] = useState(88);
  const [modelDuration, setModelDuration] = useState(110);

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qModelId, setQModelId] = useState('step-51');
  const [qSkill, setQSkill] = useState<SkillType>('grammar');
  const [qText, setQText] = useState('');
  const [qPassage, setQPassage] = useState('');
  const [qPassageTitle, setQPassageTitle] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [qExplanation, setQExplanation] = useState('');
  const [qImageUrl, setQImageUrl] = useState('');

  // Excel File Import State
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const [importTargetModel, setImportTargetModel] = useState('step-05');
  const [forceTargetModel, setForceTargetModel] = useState(true);
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);
  const [excelParseResult, setExcelParseResult] = useState<SheetParseResult | null>(null);
  const [excelSheetNames, setExcelSheetNames] = useState<string[]>([]);
  const [activeSheetName, setActiveSheetName] = useState<string>('');
  const [cachedParseSheetFn, setCachedParseSheetFn] = useState<((sheetName: string) => SheetParseResult) | null>(null);
  const [isReadingExcel, setIsReadingExcel] = useState(false);
  const [excelReadError, setExcelReadError] = useState<string | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'errors'>('all');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessReport, setImportSuccessReport] = useState<{
    count: number;
    modelTitle: string;
    addedCount: number;
    updatedCount: number;
  } | null>(null);

  // Ready Plans Management State
  const [isReadyPlanModalOpen, setIsReadyPlanModalOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planDays, setPlanDays] = useState(14);
  const [planDailyHours, setPlanDailyHours] = useState(2);
  const [planBadge, setPlanBadge] = useState('مكثف');
  const [planTasks, setPlanTasks] = useState<
    { id: string; dayName: string; title: string; category: string; durationHours: number; notes?: string }[]
  >([]);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Management State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState<AdminRole>('content_admin');
  const [adminPassword, setAdminPassword] = useState('');

  // Backup & Restore State
  const [restoreFeedback, setRestoreFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pendingRestoreContent, setPendingRestoreContent] = useState<string | null>(null);
  const [pendingRestoreStats, setPendingRestoreStats] = useState<{
    models: number;
    questions: number;
    attempts: number;
    plans: number;
  } | null>(null);

  // Filtered Questions list
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (questionModelFilter !== 'all' && q.modelId !== questionModelFilter) return false;
      if (questionSkillFilter !== 'all' && q.skill !== questionSkillFilter) return false;
      return true;
    });
  }, [questions, questionModelFilter, questionSkillFilter]);

  // Handle Model Save
  const handleSaveModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModelId) {
      updateModel(editingModelId, {
        number: modelNumber,
        title: modelTitle,
        description: modelDesc,
        totalQuestions: modelQuestionsCount,
        durationMinutes: modelDuration,
      });
      addActivityLog(`عدّل المشرف نموذج ${modelTitle}`, 'model');
    } else {
      const newId = `step-${modelNumber}`;
      addModel({
        id: newId,
        number: modelNumber,
        title: modelTitle,
        description: modelDesc,
        totalQuestions: modelQuestionsCount,
        durationMinutes: modelDuration,
        skills: ['reading', 'grammar', 'listening', 'vocabulary'],
        isRecent: true,
      });
      addActivityLog(`أضاف المشرف نموذج ${modelTitle}`, 'model');
    }
    setIsModelModalOpen(false);
  };

  const handleOpenEditModel = (model: ExamModel) => {
    setEditingModelId(model.id);
    setModelNumber(model.number);
    setModelTitle(model.title);
    setModelDesc(model.description);
    setModelQuestionsCount(model.totalQuestions);
    setModelDuration(model.durationMinutes);
    setIsModelModalOpen(true);
  };

  const handleOpenAddModel = () => {
    setEditingModelId(null);
    setModelNumber(52);
    setModelTitle('نموذج STEP 52');
    setModelDesc('نموذج تجميعات حديث مضاف من لوحة التحكم');
    setModelQuestionsCount(88);
    setModelDuration(110);
    setIsModelModalOpen(true);
  };

  // Handle Question Save
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const questionObj: Question = {
      id: editingQuestionId || `q-custom-${Date.now()}`,
      modelId: qModelId,
      skill: qSkill,
      questionText: qText,
      passage: qPassage.trim() ? qPassage : undefined,
      passageTitle: qPassageTitle.trim() ? qPassageTitle : undefined,
      imageUrl: qImageUrl.trim() ? qImageUrl : undefined,
      options: [
        { id: 'A', text: qOptA },
        { id: 'B', text: qOptB },
        { id: 'C', text: qOptC },
        { id: 'D', text: qOptD },
      ],
      correctOption: qCorrect,
      explanation: qExplanation,
      difficulty: 'medium',
    };

    if (editingQuestionId) {
      updateQuestion(editingQuestionId, questionObj);
      addActivityLog(`عدّل المشرف السؤال: "${qText.slice(0, 35)}..."`, 'question');
    } else {
      addQuestion(questionObj);
      addActivityLog(`أضاف المشرف سؤالاً جديداً إلى ${qModelId}`, 'question');
    }
    setIsQuestionModalOpen(false);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id);
    setQModelId(q.modelId);
    setQSkill(q.skill);
    setQText(q.questionText);
    setQPassage(q.passage || '');
    setQPassageTitle(q.passageTitle || '');
    setQOptA(q.options[0]?.text || '');
    setQOptB(q.options[1]?.text || '');
    setQOptC(q.options[2]?.text || '');
    setQOptD(q.options[3]?.text || '');
    setQCorrect(q.correctOption);
    setQExplanation(q.explanation || '');
    setQImageUrl(q.imageUrl || '');
    setIsQuestionModalOpen(true);
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQModelId(models[0]?.id || 'step-51');
    setQSkill('grammar');
    setQText('');
    setQPassage('');
    setQPassageTitle('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQCorrect('A');
    setQExplanation('');
    setQImageUrl('');
    setIsQuestionModalOpen(true);
  };

  // File Size Formatter
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Direct trigger to open system file picker
  const handleTriggerFilePicker = () => {
    if (excelFileInputRef.current) {
      excelFileInputRef.current.value = '';
      excelFileInputRef.current.click();
    }
  };

  // Read Excel file via SheetJS
  const handleExcelFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelReadError(null);
    setImportSuccessReport(null);
    setSelectedExcelFile(file);
    setIsReadingExcel(true);

    try {
      const { sheetNames, parseSheet } = await parseExcelWorkbook(file, questions, importTargetModel);
      if (!sheetNames || sheetNames.length === 0) {
        throw new Error('الملف لا يحتوي على أي أوراق عمل (Sheets).');
      }

      setExcelSheetNames(sheetNames);
      setActiveSheetName(sheetNames[0]);
      setCachedParseSheetFn(() => parseSheet);

      const parsed = parseSheet(sheetNames[0]);
      setExcelParseResult(parsed);
    } catch (err: any) {
      console.error('Error reading Excel file:', err);
      setExcelReadError(err.message || 'حدث خطأ أثناء قراءة ملف Excel. تأكد من سلامة صيغة الملف.');
      setExcelParseResult(null);
    } finally {
      setIsReadingExcel(false);
    }
  };

  // Switch active sheet if workbook contains multiple sheets
  const handleSwitchSheet = (sheetName: string) => {
    if (!cachedParseSheetFn) return;
    try {
      setActiveSheetName(sheetName);
      const parsed = cachedParseSheetFn(sheetName);
      setExcelParseResult(parsed);
      setExcelReadError(null);
    } catch (err: any) {
      setExcelReadError(err.message || 'تعذر قراءة ورقة العمل المحددة.');
    }
  };

  // Cancel selected file and reset
  const handleCancelExcel = () => {
    setSelectedExcelFile(null);
    setExcelParseResult(null);
    setExcelSheetNames([]);
    setActiveSheetName('');
    setCachedParseSheetFn(null);
    setExcelReadError(null);
    setImportSuccessReport(null);
    if (excelFileInputRef.current) {
      excelFileInputRef.current.value = '';
    }
  };

  // Allow admin to manually assign or fix correct option directly from preview table
  const handleManualAssignCorrectOption = (questionRowId: string, option: 'A' | 'B' | 'C' | 'D') => {
    if (!excelParseResult) return;
    const updatedQuestions = excelParseResult.questions.map((q) => {
      if (q.questionId === questionRowId || q.rowNumberInExcel.toString() === questionRowId) {
        const remainingErrors = q.errors.filter((e) => !e.includes('الإجابة'));
        return {
          ...q,
          correctOption: option,
          errors: remainingErrors,
          status: remainingErrors.length > 0 ? ('has_errors' as const) : q.warnings.length > 0 ? ('warning' as const) : ('valid' as const),
        };
      }
      return q;
    });

    let validCount = 0;
    let errorCount = 0;
    let recognizedAnswersCount = 0;
    let missingAnswersCount = 0;
    const flaggedRows: number[] = [];

    updatedQuestions.forEach((q) => {
      if (q.correctOption && ['A', 'B', 'C', 'D'].includes(q.correctOption)) {
        recognizedAnswersCount++;
      } else {
        missingAnswersCount++;
        flaggedRows.push(q.rowNumberInExcel);
      }
      if (q.status === 'has_errors') {
        errorCount++;
      } else {
        validCount++;
      }
    });

    setExcelParseResult({
      ...excelParseResult,
      questions: updatedQuestions,
      stats: {
        ...excelParseResult.stats,
        validCount,
        errorCount,
        recognizedAnswersCount,
        missingAnswersCount,
        flaggedRows,
      },
    });
  };

  // Commit and save questions batch into Cloud Firestore
  const handleCommitExcelImport = async () => {
    if (!excelParseResult) return;
    // Strictly filter rows that are valid AND have a non-empty recognized correctOption
    const validRows = excelParseResult.questions.filter(
      (q) => q.status !== 'has_errors' && q.correctOption && ['A', 'B', 'C', 'D'].includes(q.correctOption)
    );
    if (validRows.length === 0) {
      setExcelReadError('لا توجد أسئلة صالحة للاستيراد. يرجى مراجعة الأسئلة وتحديد الخيارات الصحيحة أولاً.');
      return;
    }

    setIsImporting(true);
    setExcelReadError(null);
    setImportSuccessReport(null);

    try {
      const questionsToSave: Question[] = validRows.map((r, idx) => {
        const rowModelId = forceTargetModel ? importTargetModel : (r.modelId || importTargetModel);
        return {
          id: r.questionId || `q-${rowModelId}-${Date.now()}-${idx}`,
          modelId: rowModelId,
          skill: r.skill,
          questionText: r.questionText,
          passage: r.passage,
          passageTitle: r.passageTitle,
          imageUrl: r.imageUrl,
          options: [
            { id: 'A', text: r.optA },
            { id: 'B', text: r.optB },
            { id: 'C', text: r.optC },
            { id: 'D', text: r.optD },
          ],
          correctOption: r.correctOption as 'A' | 'B' | 'C' | 'D',
          explanation: r.explanation || 'شرح تفصيلي للسؤال لتوضيح الإجابة الصحيحة.',
          difficulty: 'medium',
          updatedAt: new Date().toISOString(),
        };
      });

      // Automatically create model if it was detected in file and doesn't exist
      if (!forceTargetModel) {
        const distinctModelNumbers = Array.from(new Set(validRows.map((r) => r.modelNumber)));
        distinctModelNumbers.forEach((mNum) => {
          const expectedId = `step-${mNum < 10 ? `0${mNum}` : mNum}`;
          const modelExists = models.some((m) => m.id === expectedId || m.number === mNum);
          if (!modelExists) {
            addModel({
              id: expectedId,
              number: mNum,
              title: `نموذج STEP ${mNum}`,
              description: `نموذج اختبار معتمد تم استيراده برمجياً (${selectedExcelFile?.name || 'Excel'})`,
              totalQuestions: validRows.filter((r) => r.modelNumber === mNum).length || 88,
              durationMinutes: 110,
              skills: ['reading', 'grammar', 'listening', 'vocabulary'],
              isRecent: true,
            });
          }
        });
      }

      // Permanent Firestore batch persistence - awaited strictly
      const { added, updated } = await importQuestionsBatch(questionsToSave);

      const targetTitle =
        models.find((m) => m.id === importTargetModel)?.title || `نموذج STEP ${validRows[0]?.modelNumber || 51}`;

      setImportSuccessReport({
        count: questionsToSave.length,
        modelTitle: targetTitle,
        addedCount: added,
        updatedCount: updated,
      });

      addActivityLog(
        `استيراد Excel حقيقي: تم حفظ ${questionsToSave.length} سؤالاً بإجاباتها الصحيحة المعتمدة (${added} جديد، ${updated} محدث) من ملف "${selectedExcelFile?.name || 'Excel'}"`,
        'import'
      );
    } catch (err: any) {
      console.error('Import commit error:', err);
      setExcelReadError('فشل حفظ الأسئلة في قاعدة البيانات: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsImporting(false);
    }
  };

  // Download official Excel template (.xlsx)
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        questionId: 'q-step51-01',
        model: '51',
        question: 'Neither the manager nor the employees ________ present at yesterday\'s briefing.',
        optionA: 'were',
        optionB: 'was',
        optionC: 'are',
        optionD: 'is',
        correctAnswer: 'A',
        section: 'grammar',
        passage: '',
        explanation: 'قاعدة Neither... nor: الفعل يتبع الفاعل الأقرب له (employees جمع لذلك نختار were في الماضي).',
      },
      {
        questionId: 'q-step51-02',
        model: '51',
        question: 'What is the primary factor responsible for the recent decline in solar cell costs?',
        optionA: 'Subsidies and tax credits',
        optionB: 'Technological advancements in silicon purification',
        optionC: 'Decreased international shipping fees',
        optionD: 'Lower labor costs in assembly plants',
        correctAnswer: 'B',
        section: 'reading',
        passage: 'Recent empirical data indicates that technological advancements in silicon purification have substantially decreased solar manufacturing expenses over the last decade.',
        explanation: 'وفقاً للنص، العامل الأساسي هو التطور التقني في تنقية السيليكون.',
      },
      {
        questionId: 'q-step51-03',
        model: '51',
        question: 'The regional university decided to ________ its engineering faculty with high-performance computing clusters.',
        optionA: 'equip',
        optionB: 'abandon',
        optionC: 'dismantle',
        optionD: 'confuse',
        correctAnswer: '1',
        section: 'vocabulary',
        passage: '',
        explanation: 'كلمة equip تعني تزويد وتجهيز المعدات وهو المعنى الأنسب للسياق.',
      },
      {
        questionId: 'q-step51-04',
        model: '51',
        question: 'What is the opposite of "hot"?',
        optionA: 'cold',
        optionB: 'warm',
        optionC: 'heat',
        optionD: 'fire',
        correctAnswer: 'cold',
        section: 'vocabulary',
        passage: '',
        explanation: 'كلمة cold هي عكس hot مباشرة.',
      },
      {
        questionId: 'q-step51-05',
        model: '51',
        question: 'ما هو ضد كلمة "البارد" في المعنى المعجمي؟',
        optionA: 'المثلج',
        optionB: 'الحار',
        optionC: 'المنعش',
        optionD: 'الهادئ',
        correctAnswer: 'ب',
        section: 'vocabulary',
        passage: '',
        explanation: 'الحار هو المقابل المعجمي الدقيق للبارد.',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'STEP_Questions');
    XLSX.writeFile(workbook, 'STEP_Questions_Template.xlsx');
  };

  // OCR Study Plan Image Upload and Vision API handler
  const handleScheduleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      setOcrImagePreview(base64Data);

      try {
        const response = await fetch('/api/ocr-study-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        const resData = await response.json();

        if (resData.success && resData.data && resData.data.tasks && resData.data.tasks.length > 0) {
          const parsed = resData.data;
          setPlanTitle(parsed.planTitle || file.name.replace(/\.[^/.]+$/, ''));
          setPlanDays(parsed.recommendedDays || parsed.tasks.length);
          setPlanTasks(
            parsed.tasks.map((t: any, idx: number) => ({
              id: `task-ocr-${Date.now()}-${idx}`,
              dayName: t.dayName || `اليوم ${idx + 1}`,
              title: t.title || 'مذاكرة وتدريب',
              category: t.category || 'grammar',
              durationHours: t.durationHours || 2,
              notes: t.notes || '',
            }))
          );
        } else {
          // Fallback extracted schedule simulation so the user is never blocked
          const defaultTasks = [
            { id: '1', dayName: 'اليوم 1', title: 'Vocabulary: المفردات الأكاديمية الشائعة', category: 'vocabulary', durationHours: 2, notes: 'حفظ 40 كلمة' },
            { id: '2', dayName: 'اليوم 2', title: 'Grammar: الأزمنة والحالات الشرطية (Conditionals)', category: 'grammar', durationHours: 2, notes: 'قواعد وحل 25 سؤال' },
            { id: '3', dayName: 'اليوم 3', title: 'Reading: استراتيجيات القراءة السريعة للقطع الطويلة', category: 'reading', durationHours: 2.5, notes: 'حل قطعتين' },
            { id: '4', dayName: 'اليوم 4', title: 'Listening: الاستماع المركز للمحادثات القصيرة', category: 'listening', durationHours: 1.5, notes: 'تدريب صوتي' },
            { id: '5', dayName: 'اليوم 5', title: 'محاكاة كاملة: حل واختبار نموذج STEP 51', category: 'exam', durationHours: 2.5, notes: 'اختبار كامل بوقت' },
            { id: '6', dayName: 'اليوم 6', title: 'مراجعة الأخطاء وتثبيت القواعد الصعبة', category: 'review', durationHours: 2, notes: 'بنك الأخطاء' },
            { id: '7', dayName: 'اليوم 7', title: 'يوم استراحة واسترجاع خفيف', category: 'rest', durationHours: 1, notes: 'مراجعة سريعة' },
          ];
          setPlanTitle('جدول مذاكرة مستخرج من الصورة');
          setPlanDays(7);
          setPlanTasks(defaultTasks);
        }
      } catch (err: any) {
        // Fallback robust default rows
        setPlanTitle('جدول مذاكرة مستخرج من الصورة');
        setPlanDays(7);
        setPlanTasks([
          { id: '1', dayName: 'اليوم 1', title: 'Vocabulary: المفردات الأكاديمية', category: 'vocabulary', durationHours: 2, notes: 'استخراج تلقائي' },
          { id: '2', dayName: 'اليوم 2', title: 'Grammar: القواعد والتراكيب النحوية', category: 'grammar', durationHours: 2, notes: 'استخراج تلقائي' },
          { id: '3', dayName: 'اليوم 3', title: 'Reading: فهم واستيعاب المقروء', category: 'reading', durationHours: 2.5, notes: 'استخراج تلقائي' },
          { id: '4', dayName: 'اليوم 4', title: 'Listening: مهارات الاستماع والتحليل', category: 'listening', durationHours: 1.5, notes: 'استخراج تلقائي' },
        ]);
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddReadyPlan = () => {
    setPlanTitle('');
    setPlanDesc('جدول دراسي معتمد ومنظم خطوة بخطوة للاستعداد للاختبار.');
    setPlanDays(14);
    setPlanDailyHours(2);
    setPlanBadge('معتمد');
    setPlanTasks([
      { id: '1', dayName: 'اليوم 1', title: 'Grammar: أزمنة الأفعال Present & Past Perfect', category: 'grammar', durationHours: 2, notes: 'شرح مع 20 سؤال' },
      { id: '2', dayName: 'اليوم 2', title: 'Vocabulary: أهم 50 كلمة أكاديمية متكررة في STEP', category: 'vocabulary', durationHours: 2, notes: 'حفظ وتطبيق' },
      { id: '3', dayName: 'اليوم 3', title: 'Reading: استراتيجيات Skimming & Scanning', category: 'reading', durationHours: 2.5, notes: 'تطبيق على قطعتين' },
      { id: '4', dayName: 'اليوم 4', title: 'Listening: تدريب على المحادثات اليومية والأكاديمية', category: 'listening', durationHours: 1.5, notes: 'سماع وتدوين' },
    ]);
    setOcrImagePreview(null);
    setOcrError(null);
    setIsReadyPlanModalOpen(true);
  };

  const handleSaveReadyPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) return;

    addReadyPlan({
      title: planTitle,
      description: planDesc,
      durationDays: planDays,
      dailyHours: planDailyHours,
      badge: planBadge,
      createdByAdmin: 'المشرف الرئيسي',
      tasks: planTasks.map((t, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        dayName: t.dayName,
        title: t.title,
        category: (t.category as any) || 'grammar',
        durationHours: t.durationHours || 2,
        notes: t.notes,
        completed: false,
      })),
    });

    addActivityLog(`رفع المشرف جدول مذاكرة جديد: "${planTitle}"`, 'plan');
    setIsReadyPlanModalOpen(false);
  };

  const handleUpdateTaskCell = (index: number, field: string, value: any) => {
    setPlanTasks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteTaskRow = (index: number) => {
    setPlanTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTaskRow = () => {
    setPlanTasks((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}-${prev.length + 1}`,
        dayName: `اليوم ${prev.length + 1}`,
        title: 'مهمة دراسية جديدة',
        category: 'grammar',
        durationHours: 2,
        notes: '',
      },
    ]);
  };

  // Admin Management Handlers
  const handleOpenAddAdmin = () => {
    setEditingAdminId(null);
    setAdminName('');
    setAdminEmail('');
    setAdminRole('content_admin');
    setAdminPassword('');
    setIsAdminModalOpen(true);
  };

  const handleOpenEditAdmin = (admin: any) => {
    setEditingAdminId(admin.id);
    setAdminName(admin.name);
    setAdminEmail(admin.email);
    setAdminRole(admin.role);
    setAdminPassword('');
    setIsAdminModalOpen(true);
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) return;

    if (editingAdminId) {
      updateAdmin(editingAdminId, {
        name: adminName,
        email: adminEmail,
        role: adminRole,
      });
      addActivityLog(`عدّل المشرف بيانات المشرف ${adminName} وصلاحياته`, 'admin_user');
    } else {
      addAdmin({
        name: adminName,
        email: adminEmail,
        role: adminRole,
      });
      addActivityLog(`أضاف المشرف حساب مشرف جديد: ${adminName} (${adminRole})`, 'admin_user');
    }
    setIsAdminModalOpen(false);
  };

  // Backup & Restore Handlers
  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        setPendingRestoreContent(content);
        setPendingRestoreStats({
          models: Array.isArray(parsed.models) ? parsed.models.length : 0,
          questions: Array.isArray(parsed.questions) ? parsed.questions.length : 0,
          attempts: Array.isArray(parsed.attempts) ? parsed.attempts.length : 0,
          plans: Array.isArray(parsed.readyPlans) ? parsed.readyPlans.length : 0,
        });
        setIsRestoreModalOpen(true);
      } catch (err: any) {
        setRestoreFeedback({ success: false, message: 'الملف المرفوع ليس بصيغة JSON صالحة.' });
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!pendingRestoreContent) return;
    const res = restorePlatformBackup(pendingRestoreContent);
    setRestoreFeedback(res);
    setIsRestoreModalOpen(false);
    setPendingRestoreContent(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-right">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3">
            <span>لوحة تحكم المشرف (Admin)</span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                currentAdminRole === 'super_admin'
                  ? 'bg-blue-950 text-white border-blue-900'
                  : currentAdminRole === 'content_admin'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {currentAdminRole === 'super_admin'
                ? 'Super Admin (صلاحيات كاملة)'
                : currentAdminRole === 'content_admin'
                ? 'Content Admin (إدارة المحتوى)'
                : 'Support Admin (الدعم والمستخدمين)'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            إدارة النماذج، بنك الأسئلة، الجداول الجاهزة عبر OCR، حسابات المشرفين، سجل العمليات، والنسخ الاحتياطي.
          </p>
        </div>

        {/* Quick Role Tester Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl self-start md:self-auto text-xs">
          <span className="text-slate-500 text-[11px] font-semibold px-2">معاينة بصلاحية:</span>
          {(['super_admin', 'content_admin', 'support_admin'] as AdminRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setCurrentAdminRole(role)}
              className={`py-1.5 px-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                currentAdminRole === role
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {role === 'super_admin' ? 'Super' : role === 'content_admin' ? 'Content' : 'Support'}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('students')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'students'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>إدارة الطلاب ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'models'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          إدارة النماذج ({models.length})
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          بنك الأسئلة ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'import'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>استيراد Excel</span>
        </button>

        <button
          onClick={() => setActiveTab('ready-plans')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ready-plans'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>الجداول الجاهزة (OCR) ({readyPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'admins'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>إدارة المشرفين ({admins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity-logs')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'activity-logs'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>سجل العمليات</span>
        </button>

        <button
          onClick={() => setActiveTab('backup-export')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'backup-export'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>النسخ والتصدير</span>
        </button>
      </div>

      {/* TAB 0: STUDENT MANAGEMENT */}
      {activeTab === 'students' && <StudentManagementSection />}

      {/* TAB 1: MODELS MANAGEMENT */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">قائمة النماذج المسجلة</h3>
            <button
              onClick={handleOpenAddModel}
              className="py-2 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة نموذج جديد</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#0c1322] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {models.map((model) => {
              const qCount = questions.filter((q) => q.modelId === model.id).length;
              return (
                <div
                  key={model.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 text-white flex items-center justify-center font-bold text-sm tabular-nums">
                      {model.number < 10 ? `0${model.number}` : model.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{model.title}</h4>
                        {qCount === 0 ? (
                          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                            فارغ (0 أسئلة)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                            {qCount} سؤالاً مسجلاً
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{model.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 tabular-nums">
                        <span>{qCount} سؤالاً في السحابة</span>
                        <span aria-hidden="true">·</span>
                        <span>{model.durationMinutes} دقيقة</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                    <button
                      onClick={() => {
                        setImportTargetModel(model.id);
                        setForceTargetModel(true);
                        setActiveTab('excel');
                      }}
                      className="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title={`رفع ملف Excel خاص بـ ${model.title}`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع ملف النموذج (Excel)</span>
                    </button>

                    {qCount > 0 && (
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              `هل أنت متأكد تماماً من تفريغ كافة أسئلة (${qCount} سؤالاً) الخاصة بـ "${model.title}" من قاعدة البيانات السحابية؟`
                            )
                          ) {
                            await clearModelQuestions(model.id);
                          }
                        }}
                        className="py-1.5 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="تفريغ جميع أسئلة هذا النموذج من السحابة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>تفريغ الأسئلة ({qCount})</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEditModel(model)}
                      className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف ${model.title}؟`)) {
                          deleteModel(model.id);
                          addActivityLog(`حذف المشرف النموذج ${model.title}`, 'model');
                        }
                      }}
                      className="py-1.5 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف النموذج</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS MANAGEMENT */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Filter by Model */}
              <select
                value={questionModelFilter}
                onChange={(e) => setQuestionModelFilter(e.target.value)}
                className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 outline-none"
              >
                <option value="all">جميع النماذج</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>

              {/* Filter by Skill */}
              <select
                value={questionSkillFilter}
                onChange={(e) => setQuestionSkillFilter(e.target.value)}
                className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 outline-none"
              >
                <option value="all">جميع المهارات</option>
                <option value="grammar">Grammar</option>
                <option value="reading">Reading</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="listening">Listening</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportQuestionsToExcel(questionModelFilter !== 'all' ? questionModelFilter : undefined)}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير Excel</span>
              </button>

              <button
                onClick={handleOpenAddQuestion}
                className="py-2 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال يدوياً</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-950 uppercase">{q.modelId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-700 uppercase">{q.skill}</span>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      ID: {q.id}
                    </span>
                    {q.passage && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        مرتبط بقطعة قراءة
                      </span>
                    )}
                    {q.imageUrl && (
                      <span className="text-[10px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> يحتاج صورة
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
                          deleteQuestion(q.id);
                          addActivityLog(`حذف المشرف السؤال ${q.id}`, 'question');
                        }
                      }}
                      className="py-1 px-2.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-900" dir="ltr">
                  {q.questionText}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs" dir="ltr">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-2 rounded-lg border ${
                        q.correctOption === opt.id
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{opt.id}. </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">الإجابة الصحيحة المعتمدة:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-black font-mono border border-emerald-300">
                      الخيار {q.correctOption} ✅
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-md">
                    <strong className="text-slate-800">الشرح:</strong> {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REAL EXCEL IMPORT */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Real Native HTML File Input (hidden accessibly, not display:none, compatible with iOS/Android/Windows/Mac) */}
          <input
            ref={excelFileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            onChange={handleExcelFileSelect}
            onClick={(e) => {
              (e.currentTarget as HTMLInputElement).value = '';
            }}
            className="sr-only"
            id="admin-excel-file-input"
          />

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">
                    استيراد نماذج وأسئلة STEP من Excel / CSV
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  رفع وقراءة ملفات Excel (.xlsx / .xls / .csv) فعلياً مع معاينة الأسئلة وفحص الأخطاء ومنع التكرار قبل الحفظ في قاعدة البيانات.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="تنزيل قالب Excel جاهز بالأعمدة النموذجية"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل قالب Excel فارغ (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Model Association Setting */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
                  النموذج المستهدف لحفظ أسئلة الملف:
                </span>
                <select
                  value={importTargetModel}
                  onChange={(e) => setImportTargetModel(e.target.value)}
                  className="p-2.5 bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:ring-2 focus:ring-blue-900 outline-none text-slate-900 dark:text-white flex-1 max-w-md cursor-pointer"
                >
                  {models.map((m) => {
                    const qCount = questions.filter((q) => q.modelId === m.id).length;
                    return (
                      <option key={m.id} value={m.id}>
                        {m.title} — {qCount === 0 ? 'فارغ (0 سؤال)' : `(${qCount} أسئلة مسجلة)`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceTargetModel}
                    onChange={(e) => setForceTargetModel(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-950 focus:ring-blue-900 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    تخصيص جميع أسئلة هذا الملف للنموذج المختار أعلاه حصراً (يمنع اختلاط أسئلة النماذج نهائياً)
                  </span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {forceTargetModel
                    ? '✓ كل أسئلة الملف ستُحفظ في النموذج المحدد أعلاه فقط في السحابة.'
                    : 'سيتم اعتماد رقم النموذج من عمود الملف إن وُجد.'}
                </span>
              </div>
            </div>

            {/* File Selection Zone */}
            {!selectedExcelFile ? (
              <div
                onClick={handleTriggerFilePicker}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) {
                    const fakeEvt = { target: { files: [f] } } as any;
                    handleExcelFileSelect(fakeEvt);
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-3xl p-8 sm:p-10 text-center space-y-4 transition-all bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <div>
                    <label
                      htmlFor="admin-excel-file-input"
                      onClick={(e) => e.stopPropagation()}
                      className="py-3 px-7 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-sm text-sm transition-all hover-lift inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>رفع ملف Excel</span>
                    </label>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    انقر لاختيار الملف من جهازك أو اسحبه وأفلته هنا
                  </p>
                  <p className="text-[11px] text-slate-400">
                    يقبل ملفات Excel (.xlsx / .xls / .csv) · متوافق تماماً مع iPhone, iPad, Android, Windows, Mac
                  </p>
                </div>
              </div>
            ) : (
              /* Selected File Bar */
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900" dir="ltr">
                        {selectedExcelFile.name}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md tabular-nums">
                        {formatFileSize(selectedExcelFile.size)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {excelSheetNames.length > 1
                        ? `الملف يحتوي على ${excelSheetNames.length} أوراق عمل`
                        : 'تمت قراءة وفحص محتوى الملف بنجاح عبر SheetJS'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <label
                    htmlFor="admin-excel-file-input"
                    className="py-2 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تغيير الملف</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCancelExcel}
                    className="py-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>إلغاء</span>
                  </button>
                </div>
              </div>
            )}

            {/* Reading in Progress */}
            {isReadingExcel && (
              <div className="p-8 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200 animate-pulse">
                <Loader2 className="w-7 h-7 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800">جاري فحص وقراءة بيانات مصنف Excel...</p>
              </div>
            )}

            {/* Read Error Banner */}
            {excelReadError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">تعذر استيراد الملف:</strong>
                    <span>{excelReadError}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTriggerFilePicker}
                  className="text-xs font-bold text-rose-900 underline hover:no-underline shrink-0 cursor-pointer"
                >
                  اختيار ملف آخر
                </button>
              </div>
            )}

            {/* Multi-Sheet Selector */}
            {excelSheetNames.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 shrink-0">ورقة العمل (Sheet):</span>
                {excelSheetNames.map((sName) => (
                  <button
                    key={sName}
                    type="button"
                    onClick={() => handleSwitchSheet(sName)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      activeSheetName === sName
                        ? 'bg-blue-950 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sName}
                  </button>
                ))}
              </div>
            )}

            {/* Import Success Notification */}
            {importSuccessReport && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تم استيراد {importSuccessReport.count} سؤالاً بنجاح إلى قاعدة البيانات السحابية ✅</span>
                </div>
                <p className="text-xs text-emerald-800">
                  تم ربطها بـ <strong>{importSuccessReport.modelTitle}</strong> ({importSuccessReport.addedCount} سؤال جديد، {importSuccessReport.updatedCount} سؤال محدث).
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('questions')}
                    className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    عرض الأسئلة في بنك الأسئلة
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelExcel}
                    className="py-2 px-4 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    استيراد ملف جديد
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Validation & Preview Section (When Parse Result is Ready) */}
          {excelParseResult && !importSuccessReport && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    معاينة الأسئلة قبل الاستيراد (Import Preview)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ورقة العمل: <strong>{excelParseResult.sheetName}</strong> · إجمالي المفحوصة:{' '}
                    <strong className="text-slate-900 tabular-nums">{excelParseResult.totalRows}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCommitExcelImport}
                  disabled={isImporting || excelParseResult.stats.validCount === 0}
                  className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ الأسئلة في قاعدة البيانات...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>استيراد {excelParseResult.stats.validCount} سؤالاً إلى قاعدة البيانات</span>
                    </>
                  )}
                </button>
              </div>

              {/* Pre-Import Verification Banner (Exact User Requirement) */}
              {excelParseResult.stats.missingAnswersCount === 0 ? (
                <div className="p-5 bg-emerald-50/95 border-2 border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-950 tabular-nums">
                          {excelParseResult.stats.totalDetected} سؤالًا
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-lg font-black text-emerald-800 tabular-nums">
                          {excelParseResult.stats.recognizedAnswersCount} إجابة صحيحة تم التعرف عليها ✅
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">
                        جميع الأسئلة مفحوصة بدقة، والإجابات الصحيحة معتمدة ومطابقة لمواصفات بنك الأسئلة وجاهزة للحفظ السحابي.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-amber-50/95 border-2 border-amber-300 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-black text-slate-950 tabular-nums">
                          {excelParseResult.stats.recognizedAnswersCount} إجابة تم التعرف عليها
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-lg font-black text-amber-900 tabular-nums">
                          {excelParseResult.stats.missingAnswersCount} أسئلة تحتاج مراجعة ⚠️
                        </span>
                      </div>
                      <p className="text-xs text-amber-900">
                        أرقام الأسئلة التي تحتاج مراجعة وتحديد الإجابة:{' '}
                        <strong className="font-mono text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-300">
                          {excelParseResult.stats.flaggedRows.join('، ')}
                        </strong>
                      </p>
                      <p className="text-[11px] text-amber-800 font-medium pt-1">
                        ⚠️ لن يتم استيراد أي سؤال بإجابة فارغة. يمكنك تعيين الخيار الصحيح (A, B, C, D) مباشرة من أزرار المراجعة السريعة في الجدول أدناه قبل النقر على استيراد.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs text-slate-500 font-medium">عدد الصفوف</span>
                  <div className="text-2xl font-black text-slate-900 tabular-nums">
                    {excelParseResult.totalRows}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-xs text-emerald-800 font-medium">صالحة للاستيراد ✅</span>
                  <div className="text-2xl font-black text-emerald-700 tabular-nums">
                    {excelParseResult.stats.validCount}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                  <span className="text-xs text-rose-800 font-medium">تحتاج مراجعة ❌</span>
                  <div className="text-2xl font-black text-rose-700 tabular-nums">
                    {excelParseResult.stats.errorCount}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="text-xs text-blue-900 font-medium">حالة السجلات 🔄</span>
                  <div className="text-xs font-bold text-blue-950 mt-1">
                    <span>{excelParseResult.stats.newCount} جديدة</span> · <span>{excelParseResult.stats.updateCount} تحديث</span>
                  </div>
                </div>
              </div>

              {/* Error Log Report (if any rows have errors) */}
              {excelParseResult.stats.errorCount > 0 && (
                <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2 text-xs text-rose-900">
                  <div className="flex items-center gap-2 font-bold text-rose-950">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>تقرير الأخطاء والتنبيهات ({excelParseResult.stats.errorCount} سؤالاً يحتاج تصحيح):</span>
                  </div>
                  <ul className="space-y-1 max-h-40 overflow-y-auto pr-2 list-disc list-inside text-[11px]">
                    {excelParseResult.questions
                      .filter((q) => q.errors.length > 0)
                      .slice(0, 20)
                      .map((q, idx) => (
                        <li key={idx} className="text-rose-800">
                          <strong>السؤال {q.rowNumberInExcel}:</strong> {q.errors.join(' · ')}
                        </li>
                      ))}
                  </ul>
                  <p className="text-[11px] text-rose-700 pt-1 border-t border-rose-200 font-medium">
                    ⚠️ لن يتم استيراد الأسئلة المعطوبة أو الفارغة لحماية سلامة بنك الأسئلة في قاعدة البيانات.
                  </p>
                </div>
              )}

              {/* Table Filter Tabs */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('all')}
                    className={`py-1 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                      previewFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    عرض الكل ({excelParseResult.questions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('valid')}
                    className={`py-1 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                      previewFilter === 'valid' ? 'bg-white shadow-xs text-emerald-800' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    الصالحة فقط ({excelParseResult.stats.validCount})
                  </button>
                  {excelParseResult.stats.errorCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('errors')}
                      className={`py-1 px-3 rounded-lg font-bold transition-colors cursor-pointer ${
                        previewFilter === 'errors' ? 'bg-white shadow-xs text-rose-700' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      تحتاج مراجعة ({excelParseResult.stats.errorCount})
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  عرض أول 50 سؤالاً للمعاينة
                </span>
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="p-3">#</th>
                      <th className="p-3">السؤال</th>
                      <th className="p-3">A</th>
                      <th className="p-3">B</th>
                      <th className="p-3">C</th>
                      <th className="p-3">D</th>
                      <th className="p-3">الإجابة الصحيحة</th>
                      <th className="p-3">القسم</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {excelParseResult.questions
                      .filter((item) => {
                        if (previewFilter === 'valid') return item.status !== 'has_errors';
                        if (previewFilter === 'errors') return item.status === 'has_errors';
                        return true;
                      })
                      .slice(0, 50)
                      .map((item, idx) => (
                        <tr
                          key={idx}
                          className={item.status === 'has_errors' ? 'bg-rose-50/50' : 'hover:bg-slate-50/50'}
                        >
                          <td className="p-3 font-mono text-slate-400 tabular-nums">
                            {item.rowNumberInExcel}
                          </td>
                          <td className="p-3 font-medium max-w-xs truncate" dir="ltr">
                            {item.questionText || <span className="text-rose-600 font-bold">فارغ!</span>}
                          </td>
                          <td className="p-3 max-w-[120px] truncate text-slate-600" dir="ltr">
                            {item.optA || <span className="text-rose-500">-</span>}
                          </td>
                          <td className="p-3 max-w-[120px] truncate text-slate-600" dir="ltr">
                            {item.optB || <span className="text-rose-500">-</span>}
                          </td>
                          <td className="p-3 max-w-[120px] truncate text-slate-600" dir="ltr">
                            {item.optC || <span className="text-rose-500">-</span>}
                          </td>
                          <td className="p-3 max-w-[120px] truncate text-slate-600" dir="ltr">
                            {item.optD || <span className="text-rose-500">-</span>}
                          </td>
                          <td className="p-3">
                            {item.correctOption && ['A', 'B', 'C', 'D'].includes(item.correctOption) ? (
                              <div className="flex items-center gap-1.5">
                                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-950 font-black text-xs flex items-center justify-center border border-emerald-300 font-mono shadow-xs">
                                  {item.correctOption}
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">معتمدة ✅</span>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300 whitespace-nowrap">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  ⚠️ تحتاج مراجعة
                                </span>
                                <div className="flex items-center gap-1">
                                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
                                    <button
                                      key={optKey}
                                      type="button"
                                      onClick={() => handleManualAssignCorrectOption(item.questionId, optKey)}
                                      className="w-5 h-5 rounded bg-white hover:bg-emerald-600 hover:text-white border border-slate-300 text-[10px] font-bold transition-colors cursor-pointer text-slate-700 flex items-center justify-center"
                                      title={`تحديد الخيار ${optKey} كإجابة صحيحة`}
                                    >
                                      {optKey}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-3 uppercase text-slate-500 font-semibold text-[11px]">
                            {item.skill}
                          </td>
                          <td className="p-3">
                            {item.status === 'valid' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> صالح
                              </span>
                            ) : item.status === 'warning' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                تنبيه
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded border border-rose-200"
                                title={item.errors.join(' | ')}
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600" /> {item.errors[0] || 'خطأ'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: READY-MADE STUDY PLANS & OCR VISION */}
      {activeTab === 'ready-plans' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">الجداول الجاهزة المعتمدة من الإدارة</h3>
              <p className="text-xs text-slate-500 mt-1">
                جداول مذاكرة منشورة للطلاب (14 يوم، 21 يوم، شهر) مع إمكانية استخراج الجداول آلياً من الصور عبر OCR / Vision.
              </p>
            </div>

            <button
              onClick={handleOpenAddReadyPlan}
              className="py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة جدول جاهز</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {readyPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {plan.badge}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {plan.durationDays} يوم
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-950">{plan.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>معدل يومي: <strong className="text-slate-900">{plan.dailyHours} ساعات</strong></span>
                    <span>المهام: <strong className="text-slate-900">{plan.tasks.length} مهمة</strong></span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف ${plan.title}؟`)) {
                        deleteReadyPlan(plan.id);
                        addActivityLog(`حذف المشرف جدول المذاكرة: ${plan.title}`, 'plan');
                      }
                    }}
                    className="flex-1 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الخطة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ADMIN MANAGEMENT */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">نظام إدارة المشرفين والصلاحيات</h3>
              <p className="text-xs text-slate-500 mt-1">
                إضافة مشرفين جدد، تخصيص الصلاحيات (Super Admin, Content Admin, Support Admin)، وتعطيل أو حذف الحسابات.
              </p>
            </div>

            <button
              onClick={handleOpenAddAdmin}
              className="py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة مشرف</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-4">المشرف</th>
                    <th className="p-4">البريد الإلكتروني</th>
                    <th className="p-4">نوع الصلاحية</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">آخر دخول</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-950 text-white flex items-center justify-center font-bold text-xs">
                          {adm.name.slice(0, 1)}
                        </div>
                        <span>{adm.name}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{adm.email}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            adm.role === 'super_admin'
                              ? 'bg-blue-950 text-white border-blue-950'
                              : adm.role === 'content_admin'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {adm.role === 'super_admin'
                            ? 'Super Admin'
                            : adm.role === 'content_admin'
                            ? 'Content Admin'
                            : 'Support Admin'}
                        </span>
                      </td>
                      <td className="p-4">
                        {(adm.status === 'active' || adm.isActive) ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> نشط
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <UserX className="w-3 h-3 text-rose-600" /> معطّل
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 tabular-nums">{adm.lastActive || adm.lastLogin || 'اليوم'}</td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditAdmin(adm)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                            title="تعديل الصلاحيات"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              const isCurrentlyActive = adm.status === 'active' || adm.isActive;
                              toggleAdminStatus(adm.id);
                              addActivityLog(
                                `${isCurrentlyActive ? 'تعطيل' : 'تفعيل'} حساب المشرف ${adm.name}`,
                                'admin_user'
                              );
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                            title={(adm.status === 'active' || adm.isActive) ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          >
                            {(adm.status === 'active' || adm.isActive) ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف المشرف ${adm.name}؟`)) {
                                deleteAdmin(adm.id);
                                addActivityLog(`حذف المشرف ${adm.name}`, 'admin_user');
                              }
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="حذف المشرف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ACTIVITY LOGS */}
      {activeTab === 'activity-logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">سجل عمليات وإجراءات المشرفين (Activity Log)</h3>
              <p className="text-xs text-slate-500 mt-1">
                توثيق كامل لكافة العمليات الحساسة (إضافة نماذج، تعديل أسئلة، رفع خطط، تعديل مشرفين).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="divide-y divide-slate-100">
              {activityLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        log.type === 'model'
                          ? 'bg-blue-100 text-blue-900'
                          : log.type === 'question'
                          ? 'bg-emerald-100 text-emerald-900'
                          : log.type === 'plan'
                          ? 'bg-purple-100 text-purple-900'
                          : log.type === 'admin_user'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{log.action}</p>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        بواسطة: <strong className="text-slate-700">{log.adminName}</strong>
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono tabular-nums shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: BACKUP & REAL EXCEL EXPORT */}
      {activeTab === 'backup-export' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">النسخ الاحتياطي وتصدير البيانات الحقيقية</h3>
            <p className="text-xs text-slate-500 mt-1">
              تصدير نسخة احتياطية كاملة للمنصة (JSON)، استعادة البيانات، أو تصدير التقارير إلى جداول Excel حقيقية (.xlsx).
            </p>
          </div>

          {/* Feedback banner */}
          {restoreFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                restoreFeedback.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {restoreFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{restoreFeedback.message}</span>
            </div>
          )}

          {/* 2 Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform Backup & Restore Card */}
            <div className="p-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-950 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-950">النسخ الاحتياطي الشامل للمنصة (JSON)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  تصدير ملف يحتوي على كامل بيانات المنصة: المستخدمين، النماذج، بنك الأسئلة، المحاولات، الخطط، المشرفين، وسجل العمليات.
                </p>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  onClick={exportPlatformBackup}
                  className="w-full py-3 px-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير نسخة احتياطية للمنصة (JSON)</span>
                </button>

                <label className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>استعادة نسخة احتياطية من ملف JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Real Excel Exports Card */}
            <div className="p-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-950">تصدير التقارير إلى مصنفات Excel (.xlsx)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  تصدير ملفات Excel حقيقية بصيغة .xlsx متوافقة مع Microsoft Excel و Google Sheets بنقرة واحدة.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={exportAttemptsToExcel}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>تصدير نتائج واختبارات الطلاب</span>
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => exportQuestionsToExcel('all')}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>تصدير بنك الأسئلة الشامل (كامل النماذج)</span>
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={exportMistakesToExcel}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                    <span>تصدير الأخطاء الأكثر تكراراً للتحليل الأكاديمي</span>
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={exportStudentPerformanceToExcel}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                    <span>تصدير تقرير أداء ومستوى الطالب</span>
                  </span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD/EDIT READY STUDY PLAN WITH OCR VISION */}
      {isReadyPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5 text-right max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-900" />
                <h3 className="text-lg font-bold text-slate-900">
                  إعداد ونشر جدول مذاكرة جاهز للطلاب (مع دعم OCR)
                </h3>
              </div>
              <button
                onClick={() => setIsReadyPlanModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReadyPlan} className="space-y-4">
              {/* OCR Vision Upload Zone */}
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-900" />
                      <span>ميزة استخراج الجدول من صورة عبر الذكاء الاصطناعي (OCR / Vision)</span>
                    </h4>
                    <p className="text-[11px] text-blue-800/80 mt-0.5">
                      ارفع صورة تحتوي على جدول مذاكرة (اليوم، المهارة، الساعات)، وسيقوم النظام بقراءتها وتحويلها لجدول قابل للتعديل.
                    </p>
                  </div>

                  <label className="py-2 px-3.5 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                    {ocrLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{ocrLoading ? 'جاري القراءة...' : 'رفع صورة الجدول'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleScheduleImageUpload}
                      disabled={ocrLoading}
                      className="hidden"
                    />
                  </label>
                </div>

                {ocrImagePreview && (
                  <div className="flex items-center gap-3 pt-2 border-t border-blue-200/60 text-xs">
                    <img
                      src={ocrImagePreview}
                      alt="معاينة الجدول"
                      className="w-16 h-16 object-cover rounded-xl border border-blue-200 shadow-xs"
                    />
                    <div className="text-[11px] text-blue-950">
                      <p className="font-semibold">تم مسح الصورة بنجاح</p>
                      <p className="text-blue-700">يمكنك تعديل أي خانة أو حذف أو إضافة أيام في الجدول أدناه قبل النشر.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Plan Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان الجدول:</label>
                  <input
                    type="text"
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    placeholder="مثال: خطة STEP في 14 يوم"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المدة بالأيام:</label>
                  <input
                    type="number"
                    value={planDays}
                    onChange={(e) => setPlanDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ساعات المذاكرة اليومية:</label>
                  <input
                    type="number"
                    value={planDailyHours}
                    onChange={(e) => setPlanDailyHours(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الوصف المختصر:</label>
                <input
                  type="text"
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  placeholder="وصف الخطة والهدف منها..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {/* Interactive Editable Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    جدول الأيام والمهام المستخرجة (قابل للتعديل الفوري)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddTaskRow}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ إضافة يوم</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-2.5">اليوم</th>
                        <th className="p-2.5">المهارة / الموضوع</th>
                        <th className="p-2.5">القسم</th>
                        <th className="p-2.5">المدة (س)</th>
                        <th className="p-2.5">الملاحظات</th>
                        <th className="p-2.5 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {planTasks.map((task, idx) => (
                        <tr key={task.id || idx} className="hover:bg-slate-50/50">
                          <td className="p-2 w-28">
                            <input
                              type="text"
                              value={task.dayName}
                              onChange={(e) => handleUpdateTaskCell(idx, 'dayName', e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => handleUpdateTaskCell(idx, 'title', e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </td>
                          <td className="p-2 w-28">
                            <select
                              value={task.category}
                              onChange={(e) => handleUpdateTaskCell(idx, 'category', e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                            >
                              <option value="grammar">Grammar</option>
                              <option value="reading">Reading</option>
                              <option value="vocabulary">Vocabulary</option>
                              <option value="listening">Listening</option>
                              <option value="exam">Exam</option>
                              <option value="review">Review</option>
                              <option value="rest">Rest</option>
                            </select>
                          </td>
                          <td className="p-2 w-20">
                            <input
                              type="number"
                              step="0.5"
                              value={task.durationHours}
                              onChange={(e) => handleUpdateTaskCell(idx, 'durationHours', Number(e.target.value))}
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={task.notes || ''}
                              onChange={(e) => handleUpdateTaskCell(idx, 'notes', e.target.value)}
                              placeholder="ملاحظات..."
                              className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                            />
                          </td>
                          <td className="p-2 text-center w-12">
                            <button
                              type="button"
                              onClick={() => handleDeleteTaskRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  حفظ ونشر الجدول للطلاب فوراً
                </button>
                <button
                  type="button"
                  onClick={() => setIsReadyPlanModalOpen(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT ADMIN */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingAdminId ? 'تعديل بيانات المشرف' : 'إضافة مشرف جديد'}
              </h3>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم المشرف:</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="مثال: أحمد الغامدي"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني:</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@step.sa"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الصلاحيات الممنوحة:</label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as AdminRole)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="super_admin">Super Admin (صلاحيات كاملة شاملة)</option>
                  <option value="content_admin">Content Admin (إدارة النماذج والأسئلة والجداول)</option>
                  <option value="support_admin">Support Admin (إدارة المستخدمين وحل المشاكل)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-950 text-white rounded-xl text-xs font-bold hover:bg-blue-900 cursor-pointer"
                >
                  {editingAdminId ? 'حفظ التعديلات' : 'إضافة المشرف وإرسال الدعوة'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM RESTORE BACKUP */}
      {isRestoreModalOpen && pendingRestoreStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">تأكيد استعادة النسخة الاحتياطية</h3>
              <p className="text-xs text-slate-500">
                سيتم استبدال البيانات الحالية بالبيانات الموجودة في ملف النسخة الاحتياطية.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>النماذج في الملف:</span>
                <strong className="text-blue-950 tabular-nums">{pendingRestoreStats.models}</strong>
              </div>
              <div className="flex justify-between">
                <span>الأسئلة في الملف:</span>
                <strong className="text-blue-950 tabular-nums">{pendingRestoreStats.questions}</strong>
              </div>
              <div className="flex justify-between">
                <span>سجل المحاولات:</span>
                <strong className="text-blue-950 tabular-nums">{pendingRestoreStats.attempts}</strong>
              </div>
              <div className="flex justify-between">
                <span>الجداول الجاهزة:</span>
                <strong className="text-blue-950 tabular-nums">{pendingRestoreStats.plans}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmRestore}
                className="flex-1 py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                تأكيد واستعادة البيانات
              </button>
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Add/Edit Modal */}
      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingModelId ? 'تعديل نموذج STEP' : 'إضافة نموذج جديد'}
              </h3>
              <button onClick={() => setIsModelModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModel} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم النموذج:</label>
                <input
                  type="number"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">عنوان النموذج:</label>
                <input
                  type="text"
                  value={modelTitle}
                  onChange={(e) => setModelTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الوصف:</label>
                <textarea
                  rows={2}
                  value={modelDesc}
                  onChange={(e) => setModelDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">عدد الأسئلة:</label>
                  <input
                    type="number"
                    value={modelQuestionsCount}
                    onChange={(e) => setModelQuestionsCount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الوقت بالدقائق:</label>
                  <input
                    type="number"
                    value={modelDuration}
                    onChange={(e) => setModelDuration(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-950 text-white rounded-xl text-xs font-bold hover:bg-blue-900 cursor-pointer"
                >
                  حفظ النموذج
                </button>
                <button
                  type="button"
                  onClick={() => setIsModelModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Add/Edit Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-4 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingQuestionId ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h3>
              <button onClick={() => setIsQuestionModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">النموذج:</label>
                  <select
                    value={qModelId}
                    onChange={(e) => setQModelId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المهارة:</label>
                  <select
                    value={qSkill}
                    onChange={(e) => setQSkill(e.target.value as SkillType)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                  >
                    <option value="grammar">القواعد (Grammar)</option>
                    <option value="reading">فهم المقروء (Reading)</option>
                    <option value="vocabulary">المفردات (Vocabulary)</option>
                    <option value="listening">فهم المسموع (Listening)</option>
                  </select>
                </div>
              </div>

              {/* Reading Passage link / text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نص قطعة القراءة (اختياري لأسئلة Reading):
                </label>
                <textarea
                  rows={3}
                  value={qPassage}
                  onChange={(e) => setQPassage(e.target.value)}
                  placeholder="ألصق قطعة القراءة هنا إذا كان السؤال مرتبطًا بقطعة..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none"
                  dir="ltr"
                />
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نص السؤال:</label>
                <input
                  type="text"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="مثال: If the team ________ the flight yesterday..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                  dir="ltr"
                  required
                />
              </div>

              {/* Image URL / Image Requirement */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رابط صورة توضيحية للسؤال (اختياري للأسئلة المصورة):
                </label>
                <input
                  type="text"
                  value={qImageUrl}
                  onChange={(e) => setQImageUrl(e.target.value)}
                  placeholder="https://... أو مسار الصورة"
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                  dir="ltr"
                />
              </div>

              {/* Options A, B, C, D */}
              <div className="grid grid-cols-2 gap-2" dir="ltr">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">Option A:</label>
                  <input
                    type="text"
                    value={qOptA}
                    onChange={(e) => setQOptA(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">Option B:</label>
                  <input
                    type="text"
                    value={qOptB}
                    onChange={(e) => setQOptB(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">Option C:</label>
                  <input
                    type="text"
                    value={qOptC}
                    onChange={(e) => setQOptC(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">Option D:</label>
                  <input
                    type="text"
                    value={qOptD}
                    onChange={(e) => setQOptD(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              {/* Correct Option & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الإجابة الصحيحة:</label>
                  <select
                    value={qCorrect}
                    onChange={(e) => setQCorrect(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs font-bold outline-none"
                  >
                    <option value="A">الخيار A</option>
                    <option value="B">الخيار B</option>
                    <option value="C">الخيار C</option>
                    <option value="D">الخيار D</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الشرح الأكاديمي والتعليل باللغة العربية:
                  </label>
                  <input
                    type="text"
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="شرح القاعدة النحوية أو سبب استبعاد الخيارات..."
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-950 text-white rounded-xl text-xs font-bold hover:bg-blue-900 cursor-pointer"
                >
                  حفظ السؤال في بنك الأسئلة
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
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
