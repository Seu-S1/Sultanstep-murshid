import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  ActiveView,
  ActivityLogItem,
  AdminRole,
  AdminUser,
  ChallengeParticipant,
  ChallengeRoom,
  ExamAttempt,
  ExamModel,
  MistakeItem,
  Question,
  ReadyStudyPlan,
  SkillType,
  StudentUser,
  StudyPlan,
  StudyTask,
} from '../types';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ADMINS,
  INITIAL_MODELS,
  INITIAL_QUESTIONS,
  INITIAL_READY_PLANS,
} from '../data/initialData';
import {
  findUserByEmail,
  createUser,
  updateUser,
  deleteUserAccount,
  loadUserAttempts,
  saveAttempt,
  loadUserMistakes,
  saveMistake,
  deleteMistake,
  loadUserStudyPlan,
  saveUserStudyPlan,
  loadReadyPlans,
  saveReadyPlan,
  deleteReadyPlan as deleteReadyPlanInDb,
  loadModelsFromDb,
  saveModelToDb,
  deleteModelFromDb,
  loadQuestionsFromDb,
  saveQuestionToDb,
  deleteQuestionFromDb,
  saveQuestionsBatch,
  loadAdminsFromDb,
  saveAdminToDb,
  deleteAdminFromDb,
  loadActivityLogsFromDb,
  saveActivityLogToDb,
  loadAllStudentsFromDb,
  batchSaveStudents,
  loadStudentFullStats,
} from '../services/dbService';

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

interface AppContextType {
  currentUser: StudentUser | null;
  models: ExamModel[];
  questions: Question[];
  attempts: ExamAttempt[];
  mistakes: MistakeItem[];
  studyPlan: StudyPlan | null;
  readyPlans: ReadyStudyPlan[];
  admins: AdminUser[];
  activityLogs: ActivityLogItem[];
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Cloud Sync & Status
  syncStatus: SyncStatus;
  lastSyncError: string | null;
  activeInProgressExamPrompt: ExamAttempt | null;
  dismissInProgressPrompt: () => void;
  deleteMyAccount: () => Promise<boolean>;
  isDeleteAccountModalOpen: boolean;
  setIsDeleteAccountModalOpen: (open: boolean) => void;

  // Multiple Attempts API
  currentAttempt: ExamAttempt | null;
  activeQuestions: Question[];
  lastCompletedAttempt: ExamAttempt | null;
  getAttemptsForModel: (modelId: string) => ExamAttempt[];
  startExam: (
    modelId: string,
    type?: ExamAttempt['examType'],
    customConfig?: { questionCount?: number; skills?: SkillType[]; timeMinutes?: number },
    forceNew?: boolean
  ) => void;
  submitAnswer: (questionId: string, option: 'A' | 'B' | 'C' | 'D') => void;
  toggleFlagQuestion: (questionId: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  updateCurrentAttemptTime: (seconds: number) => void;
  finishExam: () => void;
  resumeExam: (attemptId: string) => void;
  exitExamEarly: (secondsLeft?: number) => void;
  viewAttemptResult: (attempt: ExamAttempt) => void;

  // Mistakes
  removeMistake: (mistakeId: string) => void;
  addMistakeManually: (questionId: string, wrongOption: 'A' | 'B' | 'C' | 'D') => void;

  // Personal Study Plan
  toggleTask: (taskId: string) => void;
  createStudyPlan: (config: {
    targetDate: string;
    durationDays: number;
    hoursPerDay: number;
    restDays: string[];
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
  }) => void;
  addTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  updateTask: (taskId: string, updates: Partial<StudyTask>) => void;
  deleteTask: (taskId: string) => void;

  // Ready-made Study Plans (Admin published)
  adoptReadyPlan: (readyPlanId: string) => void;
  addReadyPlan: (plan: Omit<ReadyStudyPlan, 'id' | 'createdAt'>) => void;
  updateReadyPlan: (id: string, updates: Partial<ReadyStudyPlan>) => void;
  deleteReadyPlan: (id: string) => void;

  // Challenge
  challengeRoom: ChallengeRoom | null;
  createChallenge: (title: string, count: number, timeMins: number) => string;
  joinChallenge: (code: string) => boolean;
  submitChallengeScore: (score: number) => void;

  // Auth & Profile
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  login: (email: string) => Promise<boolean>;
  register: (name: string, email: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'student' | 'admin') => void;

  // Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Admin Management & Activity Logs
  currentAdminRole: AdminRole;
  setCurrentAdminRole: (role: AdminRole) => void;
  addAdmin: (admin: { name: string; email: string; role: AdminRole }) => void;
  updateAdmin: (id: string, updates: Partial<AdminUser>) => void;
  toggleAdminStatus: (id: string) => void;
  deleteAdmin: (id: string) => void;
  addActivityLog: (action: string, type: ActivityLogItem['type']) => void;

  // Student Management (Admin Only)
  students: StudentUser[];
  isLoadingStudents: boolean;
  loadStudents: () => Promise<void>;
  addStudent: (data: { name: string; email: string; targetScore?: number; status?: 'active' | 'disabled'; phone?: string }) => Promise<boolean>;
  updateStudent: (userId: string, updates: Partial<StudentUser>) => Promise<boolean>;
  toggleStudentStatus: (userId: string) => Promise<boolean>;
  deleteStudent: (userId: string) => Promise<boolean>;
  batchImportStudents: (
    studentsList: Array<{ name: string; email: string; targetScore?: number; status?: 'active' | 'disabled'; phone?: string }>,
    updateExisting: boolean
  ) => Promise<{ added: number; updated: number; skipped: number }>;
  getStudentDetails: (userId: string) => Promise<{
    student: StudentUser | null;
    attempts: ExamAttempt[];
    mistakes: MistakeItem[];
    studyPlan: StudyPlan | null;
  }>;

  // Content Operations (CRUD on Models & Questions)
  addModel: (model: ExamModel) => void;
  updateModel: (id: string, updates: Partial<ExamModel>) => void;
  deleteModel: (id: string) => void;
  addQuestion: (q: Question) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;

  // Excel / CSV Import & Export with non-duplication
  importQuestionsBatch: (newQuestions: Question[]) => { added: number; updated: number };
  exportQuestionsToExcel: (modelId?: string, range?: { start: number; end: number }) => void;
  exportQuestionsToCsv: (modelId?: string, range?: { start: number; end: number }) => void;
  exportAttemptsToExcel: () => void;
  exportMistakesToExcel: () => void;
  exportStudentPerformanceToExcel: () => void;

  // Backup & Restore
  exportPlatformBackup: () => void;
  restorePlatformBackup: (jsonContent: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SESSION_POINTER_KEY = 'step_active_user_session';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & UI state
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Cloud Sync & In-progress tracking
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [activeInProgressExamPrompt, setActiveInProgressExamPrompt] = useState<ExamAttempt | null>(null);

  // User state (No mock or default user - only real authenticated student from database)
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>('super_admin');

  // Core Data
  const [models, setModels] = useState<ExamModel[]>(INITIAL_MODELS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [readyPlans, setReadyPlans] = useState<ReadyStudyPlan[]>(INITIAL_READY_PLANS);
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Active Exam state
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [lastCompletedAttempt, setLastCompletedAttempt] = useState<ExamAttempt | null>(null);

  // Live challenge room
  const [challengeRoom, setChallengeRoom] = useState<ChallengeRoom | null>(null);

  // Monitor online / offline network status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('synced');
      setLastSyncError(null);
    };
    const handleOffline = () => {
      setSyncStatus('offline');
      setLastSyncError('انقطع الاتصال بالإنترنت. سيتم حفظ البيانات سحابياً فور عودة الاتصال.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) setSyncStatus('offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper to mark sync start
  const reportSyncStart = () => {
    if (navigator.onLine) {
      setSyncStatus('syncing');
      setLastSyncError(null);
    } else {
      setSyncStatus('offline');
    }
  };

  // Helper to mark sync end
  const reportSyncSuccess = () => {
    if (navigator.onLine) {
      setSyncStatus('synced');
      setLastSyncError(null);
    }
  };

  const reportSyncFailure = (err: any) => {
    console.error('Cloud Firestore Sync Error:', err);
    setSyncStatus('error');
    setLastSyncError('فشل حفظ البيانات في قاعدة البيانات السحابية. يرجى التحقق من الاتصال.');
  };

  // On App Boot: Check if a user session is active, load their data fresh from Firestore
  useEffect(() => {
    const bootFromFirestore = async () => {
      // 1. Models & Questions
      try {
        const cloudModels = await loadModelsFromDb();
        if (cloudModels && cloudModels.length > 0) {
          setModels(cloudModels);
        } else {
          for (const m of INITIAL_MODELS) {
            saveModelToDb(m).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Using initial models on boot:', err);
      }

      try {
        const cloudQuestions = await loadQuestionsFromDb();
        if (cloudQuestions && cloudQuestions.length > 0) {
          setQuestions(cloudQuestions);
        } else {
          saveQuestionsBatch(INITIAL_QUESTIONS).catch(() => {});
        }
      } catch (err) {
        console.warn('Using initial questions on boot:', err);
      }

      // 2. Ready plans from Firestore (or fallback to initial)
      try {
        const cloudReadyPlans = await loadReadyPlans();
        if (cloudReadyPlans && cloudReadyPlans.length > 0) {
          setReadyPlans(cloudReadyPlans);
        } else {
          for (const rp of INITIAL_READY_PLANS) {
            saveReadyPlan(rp).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Using default ready plans on boot:', err);
      }

      // 3. Admins from Firestore
      try {
        const cloudAdmins = await loadAdminsFromDb();
        if (cloudAdmins && cloudAdmins.length > 0) {
          setAdmins(cloudAdmins);
        } else {
          for (const adm of INITIAL_ADMINS) {
            saveAdminToDb(adm).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Using default admins on boot:', err);
      }

      // 4. Activity Logs from Firestore
      try {
        const cloudLogs = await loadActivityLogsFromDb();
        if (cloudLogs && cloudLogs.length > 0) {
          setActivityLogs(cloudLogs);
        } else {
          for (const log of INITIAL_ACTIVITY_LOGS) {
            saveActivityLogToDb(log).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Using default logs on boot:', err);
      }

      // 5. Check for active session email (Real authenticated student account from Firestore only)
      const savedEmail = localStorage.getItem(SESSION_POINTER_KEY);

      if (savedEmail && !savedEmail.includes('abdullah.step@example.com')) {
        try {
          reportSyncStart();
          const user = await findUserByEmail(savedEmail);
          if (user) {
            if (user.status === 'disabled') {
              localStorage.removeItem(SESSION_POINTER_KEY);
              setCurrentUser(null);
            } else {
              const isAdmin =
                user.role === 'admin' ||
                savedEmail === 'admin@stepguide.sa' ||
                savedEmail.endsWith('@stepguide.sa');
              const activeUser: StudentUser = {
                ...user,
                role: isAdmin ? 'admin' : 'student',
              };
              setCurrentUser(activeUser);
              if (activeUser.role === 'admin') {
                setCurrentAdminRole('super_admin');
                loadAllStudentsFromDb().then(setStudents).catch(console.error);
              }
              await loadUserDataFromFirestore(user.id);
            }
          } else {
            // Account not found, remove invalid session pointer
            localStorage.removeItem(SESSION_POINTER_KEY);
          }
          reportSyncSuccess();
        } catch (e) {
          console.warn('Could not load session from Firestore on boot:', e);
          reportSyncFailure(e);
        }
      } else if (savedEmail?.includes('abdullah.step@example.com')) {
        localStorage.removeItem(SESSION_POINTER_KEY);
      }
    };

    bootFromFirestore();
  }, []);

  // Load all user data from Firestore given their userId
  const loadUserDataFromFirestore = async (userId: string) => {
    reportSyncStart();
    try {
      // 1. Attempts
      const userAttempts = await loadUserAttempts(userId);
      setAttempts(userAttempts);

      // Check if there is an attempt in_progress
      const activeInProg = userAttempts.find((a) => a.status === 'in_progress');
      if (activeInProg) {
        setActiveInProgressExamPrompt(activeInProg);
      } else {
        setActiveInProgressExamPrompt(null);
      }

      // 2. Mistakes
      const userMistakes = await loadUserMistakes(userId);
      setMistakes(userMistakes);

      // 3. Study Plan
      const userPlan = await loadUserStudyPlan(userId);
      if (userPlan) {
        setStudyPlan(userPlan);
      }

      reportSyncSuccess();
    } catch (err) {
      reportSyncFailure(err);
    }
  };

  // Log in user by email (Fetches real account from Cloud Firestore)
  const login = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return false;

    reportSyncStart();
    try {
      const user = await findUserByEmail(cleanEmail);

      if (!user) {
        throw new Error('لم يتم العثور على حساب مسجل بهذا البريد. يرجى إنشاء حساب جديد أولاً.');
      }

      // Check if account is disabled
      if (user.status === 'disabled') {
        throw new Error('عذراً، هذا الحساب معطل حالياً من قِبل إدارة المنصة. يرجى مراجعة المشرف.');
      }

      // Check if this account is an administrator
      const isAdminAccount =
        user.role === 'admin' ||
        admins.some((a) => a.email.toLowerCase() === cleanEmail) ||
        cleanEmail === 'admin@stepguide.sa' ||
        cleanEmail.endsWith('@stepguide.sa');

      const authenticatedUser: StudentUser = {
        ...user,
        role: isAdminAccount ? 'admin' : 'student',
        lastLogin: new Date().toISOString(),
        lastActiveDate: new Date().toISOString().split('T')[0],
      };

      // Update lastActiveDate and lastLogin in Firestore
      await updateUser(user.id, {
        lastActiveDate: authenticatedUser.lastActiveDate,
        lastLogin: authenticatedUser.lastLogin,
        role: authenticatedUser.role,
      });

      setCurrentUser(authenticatedUser);
      localStorage.setItem(SESSION_POINTER_KEY, authenticatedUser.email);

      if (authenticatedUser.role === 'admin') {
        setCurrentAdminRole('super_admin');
        loadAllStudentsFromDb().then(setStudents).catch(console.error);
      }

      // Load all their real data from Cloud Firestore
      await loadUserDataFromFirestore(user.id);

      setIsAuthModalOpen(false);
      reportSyncSuccess();
      return true;
    } catch (err: any) {
      reportSyncFailure(err);
      throw err;
    }
  };

  // Register real student by name and email into Firestore
  const register = async (name: string, email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (!cleanEmail || !cleanName) return false;

    reportSyncStart();
    try {
      const existing = await findUserByEmail(cleanEmail);
      if (existing) {
        return login(cleanEmail);
      }

      const isAdmin = cleanEmail.includes('admin');
      const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newUser: StudentUser = {
        id: newUserId,
        name: cleanName,
        email: cleanEmail,
        role: isAdmin ? 'admin' : 'student',
        avatar: '🎓',
        joinedDate: new Date().toISOString().split('T')[0],
        targetScore: 85,
        studyStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };

      await createUser(newUser);

      setCurrentUser(newUser);
      localStorage.setItem(SESSION_POINTER_KEY, newUser.email);

      if (newUser.role === 'admin') {
        setCurrentAdminRole('super_admin');
      }

      // Initialize real empty attempts, mistakes and plan for new student
      setAttempts([]);
      setMistakes([]);
      setStudyPlan(null);
      setActiveInProgressExamPrompt(null);

      setIsAuthModalOpen(false);
      reportSyncSuccess();
      return true;
    } catch (err) {
      reportSyncFailure(err);
      throw err;
    }
  };

  // Logout only terminates session. NEVER deletes data from Firestore!
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_POINTER_KEY);
    setCurrentAttempt(null);
    setActiveInProgressExamPrompt(null);
    setAttempts([]);
    setMistakes([]);
    setStudyPlan(null);
    setActiveView('home');
  };

  // Delete account permanently from Firestore (Only upon explicit user confirmation)
  const deleteMyAccount = async (): Promise<boolean> => {
    if (!currentUser) return false;
    reportSyncStart();
    try {
      await deleteUserAccount(currentUser.id);
      localStorage.removeItem(SESSION_POINTER_KEY);
      setCurrentUser(null);
      setCurrentAttempt(null);
      setAttempts([]);
      setMistakes([]);
      setStudyPlan(null);
      setIsDeleteAccountModalOpen(false);
      setActiveView('home');
      reportSyncSuccess();
      return true;
    } catch (err) {
      reportSyncFailure(err);
      return false;
    }
  };

  const dismissInProgressPrompt = () => {
    setActiveInProgressExamPrompt(null);
  };

  const switchRole = (role: 'student' | 'admin') => {
    // Strict role check: only genuine authenticated administrators may switch views
    if (!currentUser || currentUser.role !== 'admin') return;
    if (role === 'admin') setActiveView('admin');
    else setActiveView('dashboard');
  };

  // Activity Log
  const addActivityLog = (action: string, type: ActivityLogItem['type']) => {
    const item: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      adminName: currentUser?.role === 'admin' ? currentUser.name : 'المشرف',
      action,
      type,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) + ' — اليوم',
    };
    setActivityLogs((prev) => [item, ...prev]);
    saveActivityLogToDb(item);
  };

  // Multiple Attempts API
  const getAttemptsForModel = (modelId: string) => {
    return attempts
      .filter((a) => a.modelId === modelId)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  };

  const startExam = (
    modelId: string,
    type: ExamAttempt['examType'] = 'full',
    customConfig?: { questionCount?: number; skills?: SkillType[]; timeMinutes?: number },
    forceNew: boolean = false
  ) => {
    const targetModel = models.find((m) => m.id === modelId) || models[0];

    // If not forcing a new attempt, check if there is an in-progress attempt for this model
    if (!forceNew) {
      const existingInProg = attempts.find((a) => a.modelId === modelId && a.status === 'in_progress');
      if (existingInProg) {
        resumeExam(existingInProg.id);
        return;
      }
    }

    // Filter questions
    let examQs: Question[] = [];
    if (type === 'weaknesses') {
      const wrongIds = new Set(mistakes.filter((m) => !m.mastered).map((m) => m.questionId));
      examQs = questions.filter((q) => wrongIds.has(q.id));
      if (examQs.length < 5) {
        const fillers = questions.filter((q) => !wrongIds.has(q.id)).slice(0, 5 - examQs.length);
        examQs = [...examQs, ...fillers];
      }
    } else if (type === 'quick') {
      examQs = questions.filter((q) => q.modelId === modelId).slice(0, 15);
      if (examQs.length < 15) examQs = questions.slice(0, 15);
    } else if (type === 'custom' && customConfig) {
      const skills = customConfig.skills || ['grammar', 'reading', 'vocabulary'];
      examQs = questions
        .filter((q) => skills.includes(q.skill))
        .slice(0, customConfig.questionCount || 20);
    } else {
      examQs = questions.filter((q) => q.modelId === modelId);
      if (examQs.length === 0) examQs = questions.slice(0, 20);
    }

    const durationMinutes =
      type === 'quick'
        ? 15
        : type === 'weaknesses'
        ? 20
        : customConfig?.timeMinutes
        ? customConfig.timeMinutes
        : targetModel.durationMinutes || 110;

    const previousAttemptsForModel = getAttemptsForModel(modelId);
    const newAttemptNumber = previousAttemptsForModel.length + 1;

    const newAttempt: ExamAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'guest',
      modelId: targetModel.id,
      modelTitle: targetModel.title,
      attemptNumber: newAttemptNumber,
      examType: type,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      timeRemainingSeconds: durationMinutes * 60,
      totalTimeSeconds: durationMinutes * 60,
      userAnswers: {},
      flaggedQuestions: [],
    };

    setActiveQuestions(examQs);
    setCurrentAttempt(newAttempt);
    setActiveInProgressExamPrompt(null);
    setAttempts((prev) => [...prev, newAttempt]);
    setActiveView('test');

    // Save in-progress attempt to Firestore immediately
    if (currentUser) {
      reportSyncStart();
      saveAttempt(currentUser.id, newAttempt)
        .then(() => reportSyncSuccess())
        .catch((err) => reportSyncFailure(err));
    }
  };

  // Submit Answer with persistent Firestore synchronization
  const submitAnswer = (questionId: string, option: 'A' | 'B' | 'C' | 'D') => {
    if (!currentAttempt) return;

    const updatedUserAnswers = {
      ...currentAttempt.userAnswers,
      [questionId]: option,
    };

    const updatedAttempt: ExamAttempt = {
      ...currentAttempt,
      userAnswers: updatedUserAnswers,
    };

    setCurrentAttempt(updatedAttempt);
    setAttempts((prev) => prev.map((a) => (a.id === updatedAttempt.id ? updatedAttempt : a)));

    // Save progress to Cloud Firestore
    if (currentUser) {
      reportSyncStart();
      saveAttempt(currentUser.id, updatedAttempt)
        .then(() => reportSyncSuccess())
        .catch((err) => reportSyncFailure(err));
    }
  };

  const toggleFlagQuestion = (questionId: string) => {
    if (!currentAttempt) return;

    const currentFlags = currentAttempt.flaggedQuestions || [];
    const newFlags = currentFlags.includes(questionId)
      ? currentFlags.filter((id) => id !== questionId)
      : [...currentFlags, questionId];

    const updatedAttempt: ExamAttempt = {
      ...currentAttempt,
      flaggedQuestions: newFlags,
    };

    setCurrentAttempt(updatedAttempt);
    setAttempts((prev) => prev.map((a) => (a.id === updatedAttempt.id ? updatedAttempt : a)));

    if (currentUser) {
      saveAttempt(currentUser.id, updatedAttempt).catch(console.error);
    }
  };

  const setCurrentQuestionIndex = (index: number) => {
    if (!currentAttempt) return;
    const updatedAttempt: ExamAttempt = {
      ...currentAttempt,
      currentQuestionIndex: index,
    };
    setCurrentAttempt(updatedAttempt);
    setAttempts((prev) => prev.map((a) => (a.id === updatedAttempt.id ? updatedAttempt : a)));

    if (currentUser) {
      saveAttempt(currentUser.id, updatedAttempt).catch(console.error);
    }
  };

  // Finish exam and compute score, recording mistakes in Firestore
  const finishExam = () => {
    if (!currentAttempt) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const wrongQuestionIds: string[] = [];

    const skillCounts: Record<SkillType, { correct: number; total: number }> = {
      reading: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      listening: { correct: 0, total: 0 },
      vocabulary: { correct: 0, total: 0 },
    };

    activeQuestions.forEach((q) => {
      const userChoice = currentAttempt.userAnswers[q.id];
      if (skillCounts[q.skill]) {
        skillCounts[q.skill].total++;
      }

      if (!userChoice) {
        unansweredCount++;
      } else if (userChoice === q.correctOption) {
        correctCount++;
        if (skillCounts[q.skill]) {
          skillCounts[q.skill].correct++;
        }
      } else {
        incorrectCount++;
        wrongQuestionIds.push(q.id);

        // Add to mistakes bank in Firestore
        const mistakeObj: MistakeItem = {
          id: `mis-${Date.now()}-${q.id}`,
          userId: currentUser?.id || 'guest',
          questionId: q.id,
          modelId: q.modelId,
          modelTitle: currentAttempt.modelTitle,
          userWrongOption: userChoice,
          dateAdded: new Date().toISOString(),
          mastered: false,
          question: q,
        };

        setMistakes((prev) => {
          if (!prev.some((m) => m.questionId === q.id)) {
            return [mistakeObj, ...prev];
          }
          return prev;
        });

        if (currentUser) {
          saveMistake(currentUser.id, mistakeObj).catch(console.error);
        }
      }
    });

    const totalQuestions = activeQuestions.length || 1;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    const skillBreakdown: Record<SkillType, { correct: number; total: number; percent: number }> = {
      reading: {
        correct: skillCounts.reading.correct,
        total: skillCounts.reading.total,
        percent: skillCounts.reading.total ? Math.round((skillCounts.reading.correct / skillCounts.reading.total) * 100) : 0,
      },
      grammar: {
        correct: skillCounts.grammar.correct,
        total: skillCounts.grammar.total,
        percent: skillCounts.grammar.total ? Math.round((skillCounts.grammar.correct / skillCounts.grammar.total) * 100) : 0,
      },
      listening: {
        correct: skillCounts.listening.correct,
        total: skillCounts.listening.total,
        percent: skillCounts.listening.total ? Math.round((skillCounts.listening.correct / skillCounts.listening.total) * 100) : 0,
      },
      vocabulary: {
        correct: skillCounts.vocabulary.correct,
        total: skillCounts.vocabulary.total,
        percent: skillCounts.vocabulary.total ? Math.round((skillCounts.vocabulary.correct / skillCounts.vocabulary.total) * 100) : 0,
      },
    };

    const completedAttempt: ExamAttempt = {
      ...currentAttempt,
      status: 'completed',
      completedAt: new Date().toISOString(),
      scorePercent,
      correctCount,
      incorrectCount,
      unansweredCount,
      wrongQuestionIds,
      skillBreakdown,
    };

    setAttempts((prev) => prev.map((a) => (a.id === completedAttempt.id ? completedAttempt : a)));
    setLastCompletedAttempt(completedAttempt);
    setCurrentAttempt(null);
    setActiveInProgressExamPrompt(null);
    setActiveView('result');

    // Save completed attempt permanently in Cloud Firestore
    if (currentUser) {
      reportSyncStart();
      saveAttempt(currentUser.id, completedAttempt)
        .then(() => reportSyncSuccess())
        .catch((err) => reportSyncFailure(err));
    }
  };

  const resumeExam = (attemptId: string) => {
    const targetAttempt = attempts.find((a) => a.id === attemptId) || activeInProgressExamPrompt;
    if (!targetAttempt) return;

    let examQs = questions.filter((q) => q.modelId === targetAttempt.modelId);
    if (examQs.length === 0) examQs = questions.slice(0, 20);

    setActiveQuestions(examQs);
    setCurrentAttempt(targetAttempt);
    setActiveInProgressExamPrompt(null);
    setActiveView('test');
  };

  const updateCurrentAttemptTime = (seconds: number) => {
    if (!currentAttempt) return;
    const updated: ExamAttempt = { ...currentAttempt, timeRemainingSeconds: seconds };
    setCurrentAttempt(updated);
    setAttempts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    if (currentUser) {
      saveAttempt(currentUser.id, updated).catch(() => {});
    }
  };

  const exitExamEarly = (secondsLeft?: number) => {
    // Leave test in-progress for resuming later across any device
    if (currentAttempt) {
      const updated: ExamAttempt = {
        ...currentAttempt,
        timeRemainingSeconds: secondsLeft !== undefined ? secondsLeft : currentAttempt.timeRemainingSeconds,
      };
      if (currentUser) {
        saveAttempt(currentUser.id, updated).catch(console.error);
      }
      setAttempts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setActiveInProgressExamPrompt(updated);
    }
    setCurrentAttempt(null);
    setActiveView('dashboard');
  };

  const viewAttemptResult = (attempt: ExamAttempt) => {
    let examQs = questions.filter((q) => q.modelId === attempt.modelId);
    if (examQs.length === 0) examQs = questions.slice(0, 20);

    setActiveQuestions(examQs);
    setLastCompletedAttempt(attempt);
    setActiveView('result');
  };

  // Mistakes Bank Management
  const removeMistake = (mistakeId: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== mistakeId));
    if (currentUser) {
      deleteMistake(currentUser.id, mistakeId).catch(console.error);
    }
  };

  const addMistakeManually = (questionId: string, wrongOption: 'A' | 'B' | 'C' | 'D') => {
    const q = questions.find((item) => item.id === questionId);
    if (!q) return;

    const mistakeObj: MistakeItem = {
      id: `mis-${Date.now()}-${q.id}`,
      userId: currentUser?.id || 'guest',
      questionId: q.id,
      modelId: q.modelId,
      modelTitle: models.find((m) => m.id === q.modelId)?.title || 'نموذج STEP',
      userWrongOption: wrongOption,
      dateAdded: new Date().toISOString(),
      mastered: false,
      question: q,
    };

    setMistakes((prev) => [mistakeObj, ...prev]);
    if (currentUser) {
      saveMistake(currentUser.id, mistakeObj).catch(console.error);
    }
  };

  // Study Plan
  const toggleTask = (taskId: string) => {
    if (!studyPlan) return;
    const updatedTasks = studyPlan.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    const updatedPlan: StudyPlan = { ...studyPlan, tasks: updatedTasks };
    setStudyPlan(updatedPlan);

    if (currentUser) {
      reportSyncStart();
      saveUserStudyPlan(currentUser.id, updatedPlan)
        .then(() => reportSyncSuccess())
        .catch((err) => reportSyncFailure(err));
    }
  };

  const createStudyPlan = (config: {
    targetDate: string;
    durationDays: number;
    hoursPerDay: number;
    restDays: string[];
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
  }) => {
    const generatedTasks: StudyTask[] = [];
    const daysArabic = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const categories: SkillType[] = ['grammar', 'vocabulary', 'reading', 'listening'];

    for (let i = 0; i < config.durationDays; i++) {
      const dayName = daysArabic[i % 7];
      const isRest = config.restDays.includes(dayName);

      if (isRest) {
        generatedTasks.push({
          id: `task-gen-${Date.now()}-${i}`,
          dayName,
          title: 'يوم استراحة واسترجاع خفيف للمعلومات',
          category: 'rest',
          durationHours: 1,
          completed: false,
          notes: 'مراجعة سريعة للقواعد والمفردات السابقة',
        });
      } else {
        const cat = categories[i % categories.length];
        const title =
          cat === 'grammar'
            ? 'Grammar: حل 25 سؤالاً في القواعد والتراكيب'
            : cat === 'reading'
            ? 'Reading: قراءة قطعتين علميتين واستخراج الأفكار الرئيسية'
            : cat === 'vocabulary'
            ? 'Vocabulary: حفظ 30 مفردة أكاديمية متكررة في STEP'
            : 'Listening: تدريب سمعي على محادثات أكاديمية';

        generatedTasks.push({
          id: `task-gen-${Date.now()}-${i}`,
          dayName,
          title,
          category: cat,
          durationHours: config.hoursPerDay,
          completed: false,
        });
      }
    }

    const newPlan: StudyPlan = {
      id: `plan-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      title: `خطة STEP المكثفة (${config.durationDays} يوم)`,
      targetDate: config.targetDate,
      durationText: `${config.durationDays} يوم`,
      dailyHours: config.hoursPerDay,
      restDays: config.restDays,
      currentLevel: config.currentLevel,
      tasks: generatedTasks,
      createdAt: new Date().toISOString(),
    };

    setStudyPlan(newPlan);

    if (currentUser) {
      reportSyncStart();
      saveUserStudyPlan(currentUser.id, newPlan)
        .then(() => reportSyncSuccess())
        .catch((err) => reportSyncFailure(err));
    }
  };

  const addTask = (taskData: Omit<StudyTask, 'id' | 'completed'>) => {
    if (!studyPlan) return;
    const newTask: StudyTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
    };
    const updatedPlan: StudyPlan = { ...studyPlan, tasks: [...studyPlan.tasks, newTask] };
    setStudyPlan(updatedPlan);

    if (currentUser) {
      saveUserStudyPlan(currentUser.id, updatedPlan).catch(console.error);
    }
  };

  const updateTask = (taskId: string, updates: Partial<StudyTask>) => {
    if (!studyPlan) return;
    const updatedTasks = studyPlan.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    const updatedPlan: StudyPlan = { ...studyPlan, tasks: updatedTasks };
    setStudyPlan(updatedPlan);

    if (currentUser) {
      saveUserStudyPlan(currentUser.id, updatedPlan).catch(console.error);
    }
  };

  const deleteTask = (taskId: string) => {
    if (!studyPlan) return;
    const updatedTasks = studyPlan.tasks.filter((t) => t.id !== taskId);
    const updatedPlan: StudyPlan = { ...studyPlan, tasks: updatedTasks };
    setStudyPlan(updatedPlan);

    if (currentUser) {
      saveUserStudyPlan(currentUser.id, updatedPlan).catch(console.error);
    }
  };

  // Ready Plans
  const adoptReadyPlan = (readyPlanId: string) => {
    const readyPlan = readyPlans.find((p) => p.id === readyPlanId);
    if (!readyPlan) return;

    const clonedPlan: StudyPlan = {
      id: `plan-adopted-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      title: readyPlan.title,
      targetDate: new Date(Date.now() + readyPlan.durationDays * 86400000).toISOString().split('T')[0],
      durationText: readyPlan.durationLabel || `${readyPlan.durationDays} يوم`,
      dailyHours: readyPlan.dailyHours,
      restDays: ['الجمعة'],
      currentLevel: 'intermediate',
      tasks: readyPlan.tasks.map((t, idx) => ({
        ...t,
        id: `adopted-task-${Date.now()}-${idx}`,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
    };

    setStudyPlan(clonedPlan);
    setActiveView('study-plan');

    if (currentUser) {
      reportSyncStart();
      saveUserStudyPlan(currentUser.id, clonedPlan)
        .then(() => reportSyncSuccess())
        .catch((err) => reportSyncFailure(err));
    }
  };

  const addReadyPlan = (planData: Omit<ReadyStudyPlan, 'id' | 'createdAt'>) => {
    const newReadyPlan: ReadyStudyPlan = {
      ...planData,
      id: `rplan-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReadyPlans((prev) => [newReadyPlan, ...prev]);
    saveReadyPlan(newReadyPlan).catch(console.error);
  };

  const updateReadyPlan = (id: string, updates: Partial<ReadyStudyPlan>) => {
    setReadyPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          saveReadyPlan(updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );
  };

  const deleteReadyPlan = (id: string) => {
    setReadyPlans((prev) => prev.filter((p) => p.id !== id));
    deleteReadyPlanInDb(id).catch(console.error);
  };

  // Challenge Room
  const createChallenge = (title: string, count: number, timeMins: number): string => {
    const code = `STEP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRoom: ChallengeRoom = {
      id: `room-${Date.now()}`,
      code,
      title: title || 'تحدي STEP المباشر',
      questionCount: count || 10,
      timeLimitMinutes: timeMins || 10,
      createdAt: new Date().toISOString(),
      participants: [
        {
          id: currentUser?.id || 'p-user',
          name: currentUser ? `${currentUser.name} (أنت)` : 'أنت',
          isCurrentUser: true,
          score: 0,
          completedQuestions: 0,
          totalQuestions: count || 10,
          finished: false,
          timeSpentSeconds: 0,
          rank: 1,
        },
      ],
    };
    setChallengeRoom(newRoom);
    return code;
  };

  const joinChallenge = (code: string): boolean => {
    if (!code.trim()) return false;
    if (!challengeRoom) createChallenge('تحدي المنافسة السريعة', 10, 10);
    return true;
  };

  const submitChallengeScore = (score: number) => {
    if (!challengeRoom) return;
    setChallengeRoom((prev) => {
      if (!prev) return null;
      const updated = prev.participants.map((p) =>
        p.isCurrentUser ? { ...p, score, finished: true, completedQuestions: prev.questionCount } : p
      );
      updated.sort((a, b) => b.score - a.score);
      const ranked = updated.map((p, idx) => ({ ...p, rank: idx + 1 }));
      return { ...prev, participants: ranked };
    });
  };

  // Admin Management Handlers
  const addAdmin = (adminData: { name: string; email: string; role: AdminRole }) => {
    const newAdmin: AdminUser = {
      id: `adm-${Date.now()}`,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      status: 'active',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'الآن',
      lastLogin: 'الآن',
    };
    setAdmins((prev) => [newAdmin, ...prev]);
    saveAdminToDb(newAdmin).catch(console.error);
    addActivityLog(`إضافة مشرف جديد: ${adminData.name} (${adminData.role})`, 'admin_user');
  };

  const updateAdmin = (id: string, updates: Partial<AdminUser>) => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, ...updates };
          saveAdminToDb(updated).catch(console.error);
          return updated;
        }
        return a;
      })
    );
  };

  const toggleAdminStatus = (id: string) => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'active' ? 'inactive' : 'active';
          const updated: AdminUser = { ...a, status: nextStatus, isActive: nextStatus === 'active' };
          saveAdminToDb(updated).catch(console.error);
          addActivityLog(`تغيير حالة المشرف ${a.name} إلى ${nextStatus === 'active' ? 'نشط' : 'معطل'}`, 'admin_user');
          return updated;
        }
        return a;
      })
    );
  };

  const deleteAdmin = (id: string) => {
    const target = admins.find((a) => a.id === id);
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    deleteAdminFromDb(id).catch(console.error);
    if (target) {
      addActivityLog(`حذف المشرف: ${target.name}`, 'admin_user');
    }
  };

  // Content Operations (Models & Questions) with Firestore Persistence
  const addModel = (model: ExamModel) => {
    setModels((prev) => [...prev, model]);
    saveModelToDb(model).catch(console.error);
    addActivityLog(`إضافة نموذج جديد: ${model.title}`, 'model');
  };

  const updateModel = (id: string, updates: Partial<ExamModel>) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          saveModelToDb(updated).catch(console.error);
          return updated;
        }
        return m;
      })
    );
  };

  const deleteModel = (id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
    deleteModelFromDb(id).catch(console.error);
    addActivityLog(`حذف النموذج رقم ${id}`, 'model');
  };

  const addQuestion = (q: Question) => {
    setQuestions((prev) => [q, ...prev]);
    saveQuestionToDb(q).catch(console.error);
    addActivityLog(`إضافة سؤال جديد في قسم ${q.skill}`, 'question');
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          saveQuestionToDb(updated).catch(console.error);
          return updated;
        }
        return item;
      })
    );
    addActivityLog(`تعديل السؤال رقم ${id}`, 'question');
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((item) => item.id !== id));
    deleteQuestionFromDb(id).catch(console.error);
    addActivityLog(`حذف السؤال رقم ${id}`, 'question');
  };

  // Excel / CSV Import with Firestore batch saving
  const importQuestionsBatch = (newQuestions: Question[]) => {
    let addedCount = 0;
    let updatedCount = 0;
    const toSave: Question[] = [];

    setQuestions((prev) => {
      const questionMap = new Map<string, Question>();
      prev.forEach((q) => questionMap.set(q.id, q));

      newQuestions.forEach((inQ) => {
        if (questionMap.has(inQ.id)) {
          const updated = { ...inQ, updatedAt: new Date().toISOString() };
          questionMap.set(inQ.id, updated);
          toSave.push(updated);
          updatedCount++;
        } else {
          const existingByText = Array.from(questionMap.values()).find(
            (item) => item.questionText.trim().toLowerCase() === inQ.questionText.trim().toLowerCase()
          );
          if (existingByText) {
            const updated = { ...inQ, id: existingByText.id, updatedAt: new Date().toISOString() };
            questionMap.set(existingByText.id, updated);
            toSave.push(updated);
            updatedCount++;
          } else {
            questionMap.set(inQ.id, inQ);
            toSave.push(inQ);
            addedCount++;
          }
        }
      });

      return Array.from(questionMap.values());
    });

    if (toSave.length > 0) {
      reportSyncStart();
      saveQuestionsBatch(toSave)
        .then(() => reportSyncSuccess())
        .catch((e) => reportSyncFailure(e));
    }

    addActivityLog(`استيراد Excel/CSV: تمت إضافة ${addedCount} سؤالاً وتحديث ${updatedCount} سؤالاً في قاعدة البيانات السحابية`, 'import');
    return { added: addedCount, updated: updatedCount };
  };

  // Real Excel Export using SheetJS (.xlsx)
  const exportQuestionsToExcel = (modelId?: string, range?: { start: number; end: number }) => {
    let dataset = questions;
    if (modelId && modelId !== 'all') {
      dataset = dataset.filter((q) => q.modelId === modelId);
    }
    if (range) {
      dataset = dataset.slice(range.start - 1, range.end);
    }

    const rows = dataset.map((q) => ({
      questionId: q.id,
      model: q.modelId,
      question: q.questionText,
      optionA: q.options[0]?.text || '',
      optionB: q.options[1]?.text || '',
      optionC: q.options[2]?.text || '',
      optionD: q.options[3]?.text || '',
      correctAnswer: q.correctOption,
      section: q.skill,
      passage: q.passage || '',
      explanation: q.explanation || '',
      image: q.imageUrl || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'STEP_Questions');

    const fileName = `STEP_Questions_${modelId || 'ALL'}_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    addActivityLog(`تصدير ملف Excel حقيقي (${dataset.length} سؤالاً)`, 'backup');
  };

  const exportQuestionsToCsv = (modelId?: string, range?: { start: number; end: number }) => {
    let dataset = questions;
    if (modelId && modelId !== 'all') {
      dataset = dataset.filter((q) => q.modelId === modelId);
    }
    if (range) {
      dataset = dataset.slice(range.start - 1, range.end);
    }

    const rows = dataset.map((q) => ({
      questionId: q.id,
      model: q.modelId,
      question: q.questionText,
      optionA: q.options[0]?.text || '',
      optionB: q.options[1]?.text || '',
      optionC: q.options[2]?.text || '',
      optionD: q.options[3]?.text || '',
      correctAnswer: q.correctOption,
      section: q.skill,
      passage: q.passage || '',
      explanation: q.explanation || '',
      image: q.imageUrl || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `STEP_Questions_${modelId || 'ALL'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addActivityLog(`تصدير ملف CSV (${dataset.length} سؤالاً)`, 'backup');
  };

  // Real Excel Export for Student Exam Attempts
  const exportAttemptsToExcel = () => {
    const rows = attempts.map((att, idx) => ({
      'رقم المحاولة': att.attemptNumber || idx + 1,
      'النموذج': att.modelTitle,
      'نوع الاختبار':
        att.examType === 'full'
          ? 'المحاكي الكامل'
          : att.examType === 'quick'
          ? 'اختبار سريع'
          : att.examType === 'weaknesses'
          ? 'نقاط الضعف'
          : 'مخصص',
      'النسبة المئوية': `${att.scorePercent}%`,
      'عدد الصحيح': att.correctCount,
      'عدد الخطأ': att.incorrectCount,
      'لم يُجب': att.unansweredCount,
      'المدة (دقيقة)': Math.round((att.totalTimeSeconds - att.timeRemainingSeconds) / 60) || 1,
      'التاريخ والوقت': att.completedAt || att.startedAt,
      'الحالة': att.status === 'completed' ? 'مكتمل' : 'قيد التقدم',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ ملاحظة: 'لا توجد محاولات مسجلة بعد' }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'نتائج_الاختبارات');
    XLSX.writeFile(workbook, `STEP_Exam_Results_${Date.now()}.xlsx`);
    addActivityLog(`تصدير نتائج واختبارات الطلاب إلى Excel (${rows.length} محاولة)`, 'backup');
  };

  // Real Excel Export for Recurring Mistakes
  const exportMistakesToExcel = () => {
    const rows = mistakes.map((m) => {
      const q = questions.find((item) => item.id === m.questionId);
      return {
        'معرف السؤال': m.questionId,
        'النموذج': q?.modelId || '',
        'القسم / المهارة': q?.skill || '',
        'نص السؤال': q?.questionText || '',
        'إجابة الطالب الخاطئة': m.userWrongOption || m.selectedWrongOption,
        'الإجابة الصحيحة': q?.correctOption || '',
        'تم الإتقان': m.mastered ? 'نعم' : 'لا',
        'الشرح الأكاديمي': q?.explanation || '',
        'تاريخ تسجيل الخطأ': m.dateAdded || m.addedAt,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{ ملاحظة: 'لا توجد أخطاء مسجلة حالياً' }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'بنك_الأخطاء');
    XLSX.writeFile(workbook, `STEP_Mistakes_Analysis_${Date.now()}.xlsx`);
    addActivityLog(`تصدير بنك الأخطاء المتكررة إلى Excel (${rows.length} خطأ)`, 'backup');
  };

  // Real Excel Export for Student Performance Summary
  const exportStudentPerformanceToExcel = () => {
    const completedAttempts = attempts.filter((a) => a.status === 'completed');
    const avgScore =
      completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((acc, c) => acc + (c.scorePercent ?? 0), 0) / completedAttempts.length)
        : 0;
    const bestScore =
      completedAttempts.length > 0 ? Math.max(...completedAttempts.map((a) => a.scorePercent ?? 0)) : 0;

    const rows = [
      { البند: 'اسم الطالب', القيمة: currentUser?.name || 'غير مسجل' },
      { البند: 'البريد الإلكتروني', القيمة: currentUser?.email || 'لا يوجد' },
      { البند: 'الدرجة المستهدفة', القيمة: currentUser?.targetScore ? `${currentUser.targetScore}` : 'غير محددة' },
      { البند: 'أيام الالتزام المتتالية', القيمة: currentUser?.studyStreak ?? 0 },
      { البند: 'إجمالي المحاولات المكتملة', القيمة: completedAttempts.length },
      { البند: 'متوسط درجات المحاولات', القيمة: `${avgScore}%` },
      { البند: 'أعلى درجة محققة', القيمة: `${bestScore}%` },
      { البند: 'إجمالي الأخطاء المسجلة', القيمة: mistakes.length },
      { البند: 'الأخطاء التي تم إتقانها', القيمة: mistakes.filter((m) => m.mastered).length },
      { البند: 'تاريخ التقرير', القيمة: new Date().toLocaleDateString('ar-SA') },
    ];

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير_الأداء');
    XLSX.writeFile(workbook, `STEP_Student_Report_${Date.now()}.xlsx`);
    addActivityLog('تصدير تقرير أداء الطالب إلى Excel', 'backup');
  };

  // Full Platform Backup Export
  const exportPlatformBackup = () => {
    const backupData = {
      version: '1.0-production',
      exportDate: new Date().toISOString(),
      platform: 'مرشدك لاختبار STEP',
      models,
      questions,
      attempts,
      mistakes,
      studyPlan,
      readyPlans,
      admins,
      activityLogs,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `STEP_Guide_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addActivityLog('تم استخراج وتنزيل نسخة احتياطية كاملة (Full Platform Backup)', 'backup');
  };

  // Full Platform Restore
  const restorePlatformBackup = (jsonContent: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonContent);
      if (!data.models || !data.questions) {
        return { success: false, message: 'الملف المرفوع غير متوافق أو لا يحتوي على بنية بيانات صحيحة.' };
      }

      if (Array.isArray(data.models)) setModels(data.models);
      if (Array.isArray(data.questions)) setQuestions(data.questions);
      if (Array.isArray(data.attempts)) setAttempts(data.attempts);
      if (Array.isArray(data.mistakes)) setMistakes(data.mistakes);
      if (data.studyPlan) setStudyPlan(data.studyPlan);
      if (Array.isArray(data.readyPlans)) setReadyPlans(data.readyPlans);
      if (Array.isArray(data.admins)) setAdmins(data.admins);
      if (Array.isArray(data.activityLogs)) setActivityLogs(data.activityLogs);

      addActivityLog('تمت استعادة نسخة احتياطية للمنصة بنجاح', 'backup');
      return { success: true, message: 'تمت استعادة كافة بيانات المنصة بنجاح!' };
    } catch (e: any) {
      return { success: false, message: `فشلت القراءة: ${e.message}` };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        models,
        questions,
        attempts,
        mistakes,
        studyPlan,
        readyPlans,
        admins,
        activityLogs,
        activeView,
        setActiveView,
        syncStatus,
        lastSyncError,
        activeInProgressExamPrompt,
        dismissInProgressPrompt,
        deleteMyAccount,
        isDeleteAccountModalOpen,
        setIsDeleteAccountModalOpen,
        currentAttempt,
        activeQuestions,
        lastCompletedAttempt,
        getAttemptsForModel,
        startExam,
        submitAnswer,
        toggleFlagQuestion,
        setCurrentQuestionIndex,
        updateCurrentAttemptTime,
        finishExam,
        resumeExam,
        exitExamEarly,
        viewAttemptResult,
        removeMistake,
        addMistakeManually,
        toggleTask,
        createStudyPlan,
        addTask,
        updateTask,
        deleteTask,
        adoptReadyPlan,
        addReadyPlan,
        updateReadyPlan,
        deleteReadyPlan,
        challengeRoom,
        createChallenge,
        joinChallenge,
        submitChallengeScore,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        register,
        logout,
        switchRole,
        isSearchOpen,
        setIsSearchOpen,
        currentAdminRole,
        setCurrentAdminRole,
        addAdmin,
        updateAdmin,
        toggleAdminStatus,
        deleteAdmin,
        addActivityLog,
        addModel,
        updateModel,
        deleteModel,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        importQuestionsBatch,
        exportQuestionsToExcel,
        exportQuestionsToCsv,
        exportAttemptsToExcel,
        exportMistakesToExcel,
        exportStudentPerformanceToExcel,
        exportPlatformBackup,
        restorePlatformBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
