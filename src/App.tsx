import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Footer } from './components/Footer';

// Views
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
  const { activeView, setActiveView, currentAttempt } = useApp();

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-900 selection:text-white">
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
