import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Mic, Sparkles, TrendingUp, Award, Clock } from "lucide-react";
import { User } from "firebase/auth";
import studentIllustration from "../assets/images/student_presentation_illustration_1783407559301.jpg";

interface LandingPageProps {
  onStart: () => void;
  onViewProgress: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  authLoading: boolean;
}

export default function LandingPage({ 
  onStart, 
  onViewProgress,
  user,
  onSignIn,
  onSignOut,
  authLoading
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col" id="landing-page">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onViewProgress}
              className="text-slate-600 hover:text-blue-600 font-semibold transition text-sm px-3 py-2 rounded-lg"
            >
              Progress Tracker
            </button>

            {authLoading ? (
              <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            ) : user ? (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 pl-1.5 pr-3 py-1 rounded-xl">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="w-7 h-7 rounded-full object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold block text-slate-800 leading-tight">
                    {user.displayName || "User"}
                  </span>
                  <button 
                    onClick={onSignOut}
                    className="text-[10px] text-red-500 hover:text-red-700 font-semibold block leading-none hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
                <button 
                  onClick={onSignOut}
                  className="sm:hidden text-xs text-red-500 hover:text-red-700 font-bold px-1 rounded border border-red-200 bg-red-50"
                >
                  Out
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 text-slate-700 font-semibold text-sm px-3.5 py-2 rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.29 1.945 15.42 1 12.24 1 5.92 1 12.24s4.92 11.24 11.24 11.24c6.6 0 11-4.63 11-11.24 0-.756-.08-1.333-.18-1.955H12.24z"/>
                </svg>
                <span className="hidden xs:inline">Sign In</span>
              </button>
            )}

            <button
              onClick={onStart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-100"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 grid md:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, description, CTA */}
          <div className="md:col-span-7 space-y-8 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                <span>Powered by Gemini 3.5 AI</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                AI Presentation Coach
              </h1>
              <p className="font-display text-xl sm:text-2xl text-blue-600 font-semibold tracking-wide">
                Practice. Improve. Present with Confidence.
              </p>
              <p className="text-slate-600 max-w-xl mx-auto md:mx-0 text-base sm:text-lg leading-relaxed">
                Step up your speaking game. Upload your script, present into your mic, 
                and receive instant AI evaluations on voice clarity, speaking pace, filler word frequency, 
                and emotional confidence level.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
            >
              <button
                onClick={onStart}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-2xl transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-200 group"
              >
                <span>Start Practice</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onViewProgress}
                className="w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-lg px-8 py-4 rounded-2xl transition"
              >
                View Progress
              </button>
            </motion.div>

            {/* Micro Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200"
            >
              <div>
                <span className="block text-3xl font-extrabold text-slate-900">100%</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Instant Feedback</span>
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-slate-900">0%</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Stage Fright</span>
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-slate-900">130+</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">WPM Target Pace</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual illustration */}
          <div className="md:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full max-w-md aspect-square bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100"
            >
              <img
                src={studentIllustration}
                alt="Student presenting with confidence"
                className="w-full h-full object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-4 -left-4 bg-white px-4 py-3 rounded-2xl shadow-lg border border-slate-100 flex items-center space-x-3">
                <div className="bg-emerald-500 text-white p-2 rounded-xl">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Overall Rating</div>
                  <div className="text-sm font-bold text-slate-800">Excellent (92%)</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white px-4 py-3 rounded-2xl shadow-lg border border-slate-100 flex items-center space-x-3">
                <div className="bg-blue-500 text-white p-2 rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Pacing</div>
                  <div className="text-sm font-bold text-slate-800">132 WPM</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Feature Highlights */}
        <section className="bg-white border-t border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-display text-3xl font-bold text-slate-900">How AI Presentation Coach Helps You</h2>
              <p className="text-slate-500 mt-2">Practice in private, identify your crutch words, and master your pacing ahead of presentation day.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Mic className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Speech-to-Text Analysis</h3>
                <p className="text-sm text-slate-600">Speak naturally. Our system captures your actual speech transcript directly using built-in browser recognition.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Speaking Pace Regulator</h3>
                <p className="text-sm text-slate-600">We track your words per minute in real-time, helping you avoid running too fast or slow.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Filler Word Detonator</h3>
                <p className="text-sm text-slate-600">Track and count verbal fillers like 'um', 'like', and 'actually' so you can swap them with confident silence.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Gemini Performance Plan</h3>
                <p className="text-sm text-slate-600">Receive comprehensive performance evaluations and structural advice customized just for your speaking script.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <span>&copy; {new Date().getFullYear()} AI Presentation Coach. Created for students' success.</span>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-slate-400">Secure Client Sandbox</span>
            <span className="text-slate-400">Web Speech Integrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
