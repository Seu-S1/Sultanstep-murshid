import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Footer } from './components/Footer';
import { Compass, Loader2 } from 'lucide-react';

// Views
import { AuthPageView } from './views/AuthPageView';
import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { ExamsHubView } from './views/ExamsHubView';
import { ModelsLibraryView } from './views/ModelsLibraryView';
import { ActiveExamView } from './views/ActiveExamView';
import { ExamResultView } from './views/ExamResultView';
import { MistakesReviewView } from './views/MistakesReviewView';
import { StudyPlanView } from './views/StudyPlanView';
import { ProgressAnalyticsView } from './views/ProgressAnalyticsView';
import { ChallengeArenaView } from './views/ChallengeArenaView';
import { CommunityForumView } from './views/CommunityForumView';
import { AdminDashboardView } from './views/AdminDashboardView';

const MainContent: React.FC = () => {
  const { currentUser, isSessionLoading, activeView, setActiveView, currentAttempt } = useApp();

  // 1. Initial Session Check: Checking persistent session in local storage & Firestore
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-blue-950 border border-blue-800/80 flex items-center justify-center mb-5 shadow-2xl animate-pulse">
          <Compass className="w-8 h-8 text-blue-300" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-white">مرشدك لاختبار STEP</h1>
        <p className="text-xs text-blue-300/80 mt-1 flex items-center gap-2 justify-center">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>جاري التحقق من الجلسة وتحميل المنصة...</span>
        </p>
      </div>
    );
  }

  // 2. Authentication Gate: If user is not authenticated, show AuthPageView as first page!
  // Unauthenticated visitors cannot access platform views or student data.
  if (!currentUser) {
    return <AuthPageView />;
  }

  // 3. Authenticated User: Render standard platform views
  const renderActiveView = () => {
    // If in the middle of taking a test, show ActiveExamView
    if (currentAttempt || activeView === 'test') {
      return <ActiveExamView />;
    }

    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'dashboard':
        return <DashboardView />;
      case 'exams':
        return <ExamsHubView />;
      case 'models':
        return <ModelsLibraryView />;
      case 'result':
        return <ExamResultView />;
      case 'mistakes':
        return <MistakesReviewView />;
      case 'study-plan':
        return <StudyPlanView />;
      case 'progress':
        return <ProgressAnalyticsView />;
      case 'challenge':
        return <ChallengeArenaView />;
      case 'community':
        return <CommunityForumView />;
      case 'admin':
        return <AdminDashboardView />;
      default:
        return <HomeView />;
    }
  };

  const isExamActive = !!currentAttempt || activeView === 'test';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-blue-900 selection:text-white transition-colors duration-200">
      {/* Hide standard navbar when exam is actively ongoing for zero distractions */}
      {!isExamActive && <Navbar />}

      <main className="flex-1">
        {renderActiveView()}
      </main>

      {/* Unified Academic Platform Footer */}
      <Footer />

      {/* Modals & Mobile Navigation */}
      <BottomNav />
      <AuthModal />
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
