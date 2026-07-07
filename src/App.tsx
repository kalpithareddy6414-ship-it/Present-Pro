/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Mic, Activity, TrendingUp, Sparkles, Award } from "lucide-react";
import { DEFAULT_SESSIONS } from "./data/mockSessions";
import { FeedbackReport } from "./types";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import LivePractice from "./components/LivePractice";
import FeedbackReportView from "./components/FeedbackReport";
import ProgressPage from "./components/ProgressPage";
import AuthModal from "./components/AuthModal";
import MentorSection from "./components/MentorSection";
import YouTubeRecommendations from "./components/YouTubeRecommendations";
import DailyActivities from "./components/DailyActivities";

// Firebase imports
import { auth, googleProvider, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { collection, doc, setDoc, getDocs, deleteDoc, query } from "firebase/firestore";

type ViewState = "landing" | "dashboard" | "practice" | "report" | "progress" | "mentor" | "youtube" | "activities";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  
  // Load initial sessions from localStorage or default mock sessions
  const [pastSessions, setPastSessions] = useState<FeedbackReport[]>([]);
  
  // User Authentication States
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        await loadSessionsFromFirestore(currentUser.uid);
      } else {
        loadSessionsFromLocalStorage();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadSessionsFromLocalStorage = () => {
    const saved = localStorage.getItem("ai_present_coach_sessions");
    if (saved) {
      try {
        setPastSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved sessions, loading defaults", e);
        setPastSessions(DEFAULT_SESSIONS);
      }
    } else {
      setPastSessions(DEFAULT_SESSIONS);
      localStorage.setItem("ai_present_coach_sessions", JSON.stringify(DEFAULT_SESSIONS));
    }
  };

  const loadSessionsFromFirestore = async (uid: string) => {
    const sessionsPath = `users/${uid}/sessions`;
    try {
      const q = query(collection(db, sessionsPath));
      const querySnapshot = await getDocs(q);
      const loaded: FeedbackReport[] = [];
      querySnapshot.forEach((docSnap) => {
        loaded.push(docSnap.data() as FeedbackReport);
      });
      
      // Sort sessions by date descending
      loaded.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (loaded.length > 0) {
        setPastSessions(loaded);
      } else {
        // Pre-populate with local storage or defaults if Firestore is empty
        const localSaved = localStorage.getItem("ai_present_coach_sessions");
        let toUpload: FeedbackReport[] = DEFAULT_SESSIONS;
        if (localSaved) {
          try {
            toUpload = JSON.parse(localSaved);
          } catch (e) {
            toUpload = DEFAULT_SESSIONS;
          }
        }
        
        // Upload each to Firestore in parallel
        await Promise.all(
          toUpload.map(async (session) => {
            const docPath = `users/${uid}/sessions/${session.id}`;
            await setDoc(doc(db, docPath), session);
          })
        );
        setPastSessions(toUpload);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, sessionsPath);
    }
  };

  // Auth helper operations
  const handleSignIn = () => {
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign-out failed:", e);
    }
  };

  // Practice configurations
  const [activeConfig, setActiveConfig] = useState<{ title: string; script: string }>({
    title: "",
    script: ""
  });

  // Recent practice spoken outcomes (to feed into new Gemini assessment)
  const [recentPracticeData, setRecentPracticeData] = useState<{
    transcript: string;
    durationSeconds: number;
    wordCount: number;
  }>({
    transcript: "",
    durationSeconds: 0,
    wordCount: 0
  });

  // Active Report ID if viewing a history report
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleStartPractice = (config: { title: string; script: string }) => {
    setActiveConfig(config);
    setCurrentView("practice");
  };

  const handleFinishPractice = (results: { 
    transcript: string; 
    durationSeconds: number; 
    wordCount: number;
    fillerWordsCount: number;
    wpmHistory: number[];
  }) => {
    setRecentPracticeData({
      transcript: results.transcript,
      durationSeconds: results.durationSeconds,
      wordCount: results.wordCount
    });
    setSelectedReportId(null); // Fresh assessment
    
    // Auto-complete Daily Activity Task 5: "Record and complete 1 speech practice run in the Studio"
    try {
      const savedTasksStr = localStorage.getItem("present_coach_completed_tasks");
      let tasks: string[] = [];
      if (savedTasksStr) {
        tasks = JSON.parse(savedTasksStr);
      }
      if (!tasks.includes("task5")) {
        tasks.push("task5");
        localStorage.setItem("present_coach_completed_tasks", JSON.stringify(tasks));
      }
    } catch (e) {
      console.error("Failed to update daily tasks status", e);
    }

    setCurrentView("report");
  };

  const handleSaveReport = async (newReport: FeedbackReport) => {
    // Inject the active title configured in practice
    const enhancedReport = {
      ...newReport,
      title: activeConfig.title || newReport.title
    };
    const updated = [enhancedReport, ...pastSessions];
    
    if (user) {
      const docPath = `users/${user.uid}/sessions/${enhancedReport.id}`;
      try {
        await setDoc(doc(db, docPath), enhancedReport);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, docPath);
      }
    } else {
      localStorage.setItem("ai_present_coach_sessions", JSON.stringify(updated));
    }
    setPastSessions(updated);
  };

  const handleDeleteSession = async (id: string) => {
    const filtered = pastSessions.filter(s => s.id !== id);
    
    if (user) {
      const docPath = `users/${user.uid}/sessions/${id}`;
      try {
        await deleteDoc(doc(db, docPath));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      }
    } else {
      localStorage.setItem("ai_present_coach_sessions", JSON.stringify(filtered));
    }
    setPastSessions(filtered);
  };

  const handleViewReport = (report: FeedbackReport) => {
    setSelectedReportId(report.id);
    setCurrentView("report");
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex flex-col font-sans">
      
      {/* Top Banner (Header) if not on landing page */}
      {currentView !== "landing" && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button 
              onClick={() => setCurrentView("landing")}
              className="flex items-center space-x-3 hover:opacity-80 transition"
              id="back-to-landing-logo"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <span className="font-display font-bold text-base leading-tight block text-[#1E293B]">
                  AI Presentation Coach
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Practice. Improve. Present with Confidence.
                </span>
              </div>
            </button>
            
            <nav className="flex items-center space-x-6 h-full">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`text-sm font-semibold h-full px-1 border-b-2 transition-all duration-200 ${
                  currentView === "dashboard" 
                    ? "text-blue-600 border-blue-600" 
                    : "text-slate-600 border-transparent hover:text-blue-600"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView("activities")}
                className={`text-sm font-semibold h-full px-1 border-b-2 transition-all duration-200 ${
                  currentView === "activities" 
                    ? "text-blue-600 border-blue-600" 
                    : "text-slate-600 border-transparent hover:text-blue-600"
                }`}
              >
                Daily Activities
              </button>
              <button
                onClick={() => setCurrentView("mentor")}
                className={`text-sm font-semibold h-full px-1 border-b-2 transition-all duration-200 ${
                  currentView === "mentor" 
                    ? "text-blue-600 border-blue-600" 
                    : "text-slate-600 border-transparent hover:text-blue-600"
                }`}
              >
                AI Mentor
              </button>
              <button
                onClick={() => setCurrentView("youtube")}
                className={`text-sm font-semibold h-full px-1 border-b-2 transition-all duration-200 ${
                  currentView === "youtube" 
                    ? "text-blue-600 border-blue-600" 
                    : "text-slate-600 border-transparent hover:text-blue-600"
                }`}
              >
                Video Learning
              </button>
              <button
                onClick={() => setCurrentView("progress")}
                className={`text-sm font-semibold h-full px-1 border-b-2 transition-all duration-200 ${
                  currentView === "progress" 
                    ? "text-blue-600 border-blue-600" 
                    : "text-slate-600 border-transparent hover:text-blue-600"
                }`}
              >
                Progress Tracker
              </button>

              {authLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
              ) : user ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 h-2/3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="hidden md:block text-left max-w-[100px] truncate">
                    <span className="text-xs font-bold block text-slate-800 leading-tight truncate">
                      {user.displayName || "User"}
                    </span>
                    <button 
                      onClick={handleSignOut}
                      className="text-[10px] text-red-500 hover:text-red-700 font-semibold block leading-none hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="md:hidden text-xs text-red-500 hover:text-red-700 font-bold px-1 py-0.5 rounded border border-red-200 bg-red-50"
                  >
                    Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-xl hover:bg-slate-50 transition shadow-sm shrink-0"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.29 1.945 15.42 1 12.24 1 5.92 1 12.24s4.92 11.24 11.24 11.24c6.6 0 11-4.63 11-11.24 0-.756-.08-1.333-.18-1.955H12.24z"/>
                  </svg>
                  <span>Sign In</span>
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* Primary Dynamic Layouts */}
      <main className="flex-1">
        {currentView === "landing" && (
          <LandingPage 
            onStart={() => setCurrentView("dashboard")} 
            onViewProgress={() => setCurrentView("progress")}
            user={user}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            authLoading={authLoading}
          />
        )}

        {currentView === "dashboard" && (
          <Dashboard 
            pastSessions={pastSessions}
            onStartPractice={handleStartPractice}
            onViewReport={handleViewReport}
            onDeleteSession={handleDeleteSession}
            onViewProgress={() => setCurrentView("progress")}
          />
        )}

        {currentView === "practice" && (
          <LivePractice 
            config={activeConfig}
            onFinishPractice={handleFinishPractice}
            onCancel={() => setCurrentView("dashboard")}
          />
        )}

        {currentView === "report" && (
          <FeedbackReportView 
            reportId={selectedReportId}
            practiceTranscript={recentPracticeData.transcript}
            durationSeconds={recentPracticeData.durationSeconds}
            wordCount={recentPracticeData.wordCount}
            intendedScript={activeConfig.script}
            onPracticeAgain={() => setCurrentView("dashboard")}
            onGoBack={() => setCurrentView("dashboard")}
            pastSessions={pastSessions}
            onSaveReport={handleSaveReport}
          />
        )}

        {currentView === "progress" && (
          <ProgressPage 
          	pastSessions={pastSessions}
            onGoBack={() => setCurrentView("dashboard")}
            onViewReport={handleViewReport}
            onStartNewPractice={() => {
              setActiveConfig({ title: "", script: "" });
              setCurrentView("dashboard");
            }}
          />
        )}

        {currentView === "activities" && (
          <DailyActivities />
        )}

        {currentView === "mentor" && (
          <MentorSection />
        )}

        {currentView === "youtube" && (
          <YouTubeRecommendations />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
