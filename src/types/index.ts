export type SkillType = 'reading' | 'grammar' | 'listening' | 'vocabulary';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string; // questionId - unique identifier
  modelId: string; // e.g. 'step-51'
  skill: SkillType;
  questionText: string;
  passage?: string; // For reading questions
  passageTitle?: string;
  audioScript?: string; // For listening questions
  imageUrl?: string; // Optional image/diagram
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string; // Detailed Arabic explanation of the rule and correct choice
  difficulty: 'easy' | 'medium' | 'hard';
  updatedAt?: string;
}

export interface ExamModel {
  id: string;
  number: number; // e.g., 51, 50, ..., 5
  title: string; // e.g., "نموذج STEP 51"
  description: string;
  totalQuestions: number;
  durationMinutes: number;
  skills: SkillType[];
  isRecent?: boolean;
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  password?: string;
  authProvider?: 'password' | 'google';
  resetToken?: string;
  resetTokenExpires?: number;
  avatar?: string;
  joinedDate: string;
  targetScore: number;
  studyStreak: number;
  lastActiveDate: string;
  status?: 'active' | 'disabled';
  lastLogin?: string;
  phone?: string;
  notes?: string;
}

export type AdminRole = 'super_admin' | 'content_admin' | 'support_admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  isActive?: boolean;
  createdAt: string;
  lastActive: string;
  lastLogin?: string;
}

export interface ActivityLogItem {
  id: string;
  adminName: string;
  action: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'import' | 'backup' | 'model' | 'question' | 'plan' | 'admin_user' | 'student_account';
}

export interface ExamAttempt {
  id: string;
  userId: string;
  modelId: string;
  modelTitle: string;
  attemptNumber: number; // 1, 2, 3...
  examType: 'full' | 'quick' | 'weaknesses' | 'custom' | 'challenge';
  status: 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  totalTimeSeconds: number;
  timeSpentSeconds?: number;
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  flaggedQuestions: string[];
  scorePercent?: number;
  correctCount?: number;
  incorrectCount?: number;
  unansweredCount?: number;
  wrongQuestionIds?: string[];
  skillBreakdown?: Record<SkillType, { correct: number; total: number; percent: number }>;
}

export interface MistakeItem {
  id: string;
  userId: string;
  questionId: string;
  modelId: string;
  modelTitle: string;
  userWrongOption: 'A' | 'B' | 'C' | 'D';
  selectedWrongOption?: 'A' | 'B' | 'C' | 'D';
  frequency?: number;
  dateAdded: string;
  addedAt?: string;
  mastered: boolean;
  question?: Question;
}

export interface StudyTask {
  id: string;
  dayName: string; // e.g. اليوم 1 or الأحد
  dateStr?: string;
  title: string;
  category: SkillType | 'exam' | 'review' | 'rest';
  durationHours: number;
  completed: boolean;
  notes?: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  targetDate: string;
  durationText: string;
  dailyHours: number;
  restDays: string[];
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  tasks: StudyTask[];
  createdAt: string;
}

export interface ReadyStudyPlan {
  id: string;
  title: string;
  durationDays: number;
  durationLabel?: string;
  dailyHours: number;
  targetScoreHint?: string;
  description: string;
  badge?: string;
  skills?: SkillType[];
  tasks: StudyTask[];
  createdBy?: string;
  createdByAdmin?: string;
  isPublished?: boolean;
  createdAt: string;
}

export interface ChallengeParticipant {
  id: string;
  name: string;
  isCurrentUser: boolean;
  score: number;
  completedQuestions: number;
  totalQuestions: number;
  finished: boolean;
  timeSpentSeconds: number;
  rank?: number;
}

export interface ChallengeRoom {
  id: string;
  code: string;
  title: string;
  questionCount: number;
  timeLimitMinutes: number;
  createdAt: string;
  participants: ChallengeParticipant[];
}

export type ActiveView = 
  | 'home' 
  | 'dashboard' 
  | 'exams' 
  | 'models' 
  | 'test' 
  | 'result' 
  | 'mistakes' 
  | 'study-plan' 
  | 'progress' 
  | 'challenge' 
  | 'community' 
  | 'admin';
