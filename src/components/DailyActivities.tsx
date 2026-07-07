import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Award, CheckCircle, Flame, Mic, Play, Square, 
  RotateCcw, Sparkles, Trophy, CheckSquare, ListTodo, Info 
} from "lucide-react";

interface TongueTwister {
  id: string;
  text: string;
  focus: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const TONGUE_TWISTERS: TongueTwister[] = [
  {
    id: "tt1",
    text: "Peter Piper picked a peck of pickled peppers.",
    focus: "P / B Plosives (improves mouth crispness)",
    difficulty: "Easy"
  },
  {
    id: "tt2",
    text: "She sells seashells by the seashore, and the shells she sells are seashells, I'm sure.",
    focus: "S / Sh Sibilance (improves clarity under speed)",
    difficulty: "Medium"
  },
  {
    id: "tt3",
    text: "Red lorry, yellow lorry, red lorry, yellow lorry, red lorry, yellow lorry.",
    focus: "R / L Liquid consonants (strengthens tongue tip agility)",
    difficulty: "Hard"
  },
  {
    id: "tt4",
    text: "Which witch wished which wicked wish to win the wish?",
    focus: "W / Wh Glide (improves lip rounding and flow)",
    difficulty: "Medium"
  },
  {
    id: "tt5",
    text: "A proper copper coffee pot, purple paper, and a pristine presentation.",
    focus: "P / K Back-mouth consonants (reduces mumbling)",
    difficulty: "Hard"
  }
];

interface DailyTask {
  id: string;
  label: string;
  points: number;
}

const DAILY_TASKS: DailyTask[] = [
  { id: "task1", label: "Perform 2 minutes of deep diaphragmatic breathing", points: 20 },
  { id: "task2", label: "Practice reading a tongue twister aloud 5 times", points: 20 },
  { id: "task3", label: "Ask a question in the AI Mentor section", points: 20 },
  { id: "task4", label: "Watch 1 curated video tutorial in the Video Learning section", points: 20 },
  { id: "task5", label: "Record and complete 1 speech practice run in the Studio", points: 20 }
];

export default function DailyActivities() {
  const [completedTwisters, setCompletedTwisters] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState<number>(3); // simulated starting streak
  const [activeTwisterId, setActiveTwisterId] = useState<string | null>(null);
  
  // Audio state during tongue twister practice
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number[]>([]);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState<string | null>(null);

  // Load activity history
  useEffect(() => {
    const savedTwisters = localStorage.getItem("present_coach_completed_twisters");
    const savedTasks = localStorage.getItem("present_coach_completed_tasks");
    const savedStreak = localStorage.getItem("present_coach_streak_count");

    if (savedTwisters) setCompletedTwisters(JSON.parse(savedTwisters));
    if (savedTasks) setCompletedTasks(JSON.parse(savedTasks));
    if (savedStreak) setStreakCount(Number(savedStreak));
  }, []);

  // Timer simulation for active twister practice
  useEffect(() => {
    let interval: any = null;
    let waveInterval: any = null;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Simulate live audio waveform jumpiness
      waveInterval = setInterval(() => {
        const levels = Array.from({ length: 15 }, () => Math.floor(Math.random() * 85) + 15);
        setAudioLevel(levels);
      }, 100);
    } else {
      clearInterval(interval);
      clearInterval(waveInterval);
      setRecordingSeconds(0);
      setAudioLevel([]);
    }

    return () => {
      clearInterval(interval);
      clearInterval(waveInterval);
    };
  }, [isRecording]);

  const handleToggleTask = (id: string) => {
    const updated = completedTasks.includes(id)
      ? completedTasks.filter((tId) => tId !== id)
      : [...completedTasks, id];
    
    setCompletedTasks(updated);
    localStorage.setItem("present_coach_completed_tasks", JSON.stringify(updated));

    // If all tasks are completed, boost streak!
    if (updated.length === DAILY_TASKS.length) {
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem("present_coach_streak_count", String(newStreak));
      setShowSuccessOverlay("🎉 All daily activities completed! Your speaking streak has increased!");
    }
  };

  const handleStartPractice = (id: string) => {
    setActiveTwisterId(id);
    setIsRecording(true);
    setRecordingSeconds(0);
  };

  const handleStopPractice = (id: string) => {
    setIsRecording(false);
    
    // Add to completed twisters
    if (!completedTwisters.includes(id)) {
      const updated = [...completedTwisters, id];
      setCompletedTwisters(updated);
      localStorage.setItem("present_coach_completed_twisters", JSON.stringify(updated));
    }

    setShowSuccessOverlay("✨ Great job! Your articulation and vocal clarity are improving!");
    
    // Auto complete task2 (practice tongue twister) if not completed
    if (!completedTasks.includes("task2")) {
      handleToggleTask("task2");
    }
  };

  const handleResetProgress = () => {
    setCompletedTwisters([]);
    setCompletedTasks([]);
    setStreakCount(0);
    localStorage.removeItem("present_coach_completed_twisters");
    localStorage.removeItem("present_coach_completed_tasks");
    localStorage.setItem("present_coach_streak_count", "0");
  };

  // Calculations
  const taskPoints = completedTasks.reduce((sum, id) => {
    const task = DAILY_TASKS.find((t) => t.id === id);
    return sum + (task ? task.points : 0);
  }, 0);

  const twisterPoints = completedTwisters.length * 10;
  const totalScore = Math.min(100, taskPoints);

  // Title rank based on streak & performance
  const getRank = () => {
    const totalDone = completedTasks.length + completedTwisters.length;
    if (totalDone >= 10) return { title: "Fluent Rhetorician", desc: "You have supreme vocal control and pristine articulation.", color: "text-purple-600 bg-purple-50 border-purple-200" };
    if (totalDone >= 6) return { title: "Clarity Specialist", desc: "Your speech pacing is balanced and you rarely stumble.", color: "text-blue-600 bg-blue-50 border-blue-200" };
    if (totalDone >= 3) return { title: "Vocal Apprentice", desc: "You are actively exercising your articulation muscle.", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    return { title: "Novice Speaker", desc: "Start building your daily speaking habit to unlock higher titles.", color: "text-slate-600 bg-slate-50 border-slate-200" };
  };

  const rank = getRank();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="daily-activities-studio">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Flame className="h-5 w-5 fill-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Habits & Agility</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Daily Activities</h1>
          <p className="text-slate-500 mt-1">
            Warm up your voice, practice tongue agility, and follow our daily speech exercises to become a confident speaker.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs">
            <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
            <div>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block leading-none">Daily Streak</span>
              <span className="text-base font-bold text-amber-800">{streakCount} Days Active</span>
            </div>
          </div>
          
          <button
            onClick={handleResetProgress}
            className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 font-semibold px-3.5 py-2.5 rounded-xl transition"
          >
            Reset Habits
          </button>
        </div>
      </div>

      {/* Success Banner Overlay Notification */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-emerald-800 text-sm shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
              <span className="font-semibold">{showSuccessOverlay}</span>
            </div>
            <button
              onClick={() => setShowSuccessOverlay(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-emerald-100"
            >
              Awesome
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Progress Tracker overview & Rank */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Score tracking */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Trophy className="h-5 w-5 text-blue-600" />
              <h3 className="font-display font-bold text-slate-800 text-base">Vocal Habit Score</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Progress</span>
                <span className="text-xl font-bold text-blue-600">{totalScore}%</span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">
                Complete all daily tasks to hit 100% and build your speaking streak.
              </span>
            </div>

            {/* Curated Stats breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tasks Checked</span>
                <span className="text-lg font-bold text-slate-800">{completedTasks.length} / {DAILY_TASKS.length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Twisters Practiced</span>
                <span className="text-lg font-bold text-slate-800">{completedTwisters.length} / {TONGUE_TWISTERS.length}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Rank Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Award className="h-5 w-5 text-blue-600" />
              <h3 className="font-display font-bold text-slate-800 text-base">Your Oratory Title</h3>
            </div>

            <div className={`p-4 rounded-xl border text-center space-y-2 ${rank.color}`}>
              <span className="text-xs font-bold uppercase tracking-wider">Rank Status</span>
              <h4 className="font-display font-bold text-lg leading-tight">{rank.title}</h4>
              <p className="text-xs leading-relaxed opacity-90">{rank.desc}</p>
            </div>

            <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-normal">
                To upgrade to a <strong>Fluent Rhetorician</strong>, complete at least 10 actions combined (checking off tasks and recording tongue twisters!).
              </p>
            </div>
          </div>

        </div>

        {/* Right column: Tongue Twisters & Daily Tasks lists */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Daily Tasks List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ListTodo className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Daily Speech Checklist</h3>
                <p className="text-xs text-slate-450">Fulfill these routines daily to embed good public speaking muscle memory.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {DAILY_TASKS.map((task) => {
                const checked = completedTasks.includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all ${
                        checked 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "border-slate-300 bg-white group-hover:border-blue-400"
                      }`}>
                        {checked && <CheckCircle className="h-4 w-4 fill-blue-600 text-white" />}
                      </div>
                      <span className={`text-xs font-semibold leading-relaxed transition ${
                        checked ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-slate-950"
                      }`}>
                        {task.label}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      checked 
                        ? "bg-slate-100 text-slate-400" 
                        : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                    }`}>
                      +{task.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tongue Twisters Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Mic className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Articulation & Tongue Twisters</h3>
                <p className="text-xs text-slate-450">Read these fast to loosen up your lips, jaw, and tongue prior to a pitch.</p>
              </div>
            </div>

            <div className="space-y-4">
              {TONGUE_TWISTERS.map((twister) => {
                const practiced = completedTwisters.includes(twister.id);
                const isPracticing = activeTwisterId === twister.id && isRecording;

                return (
                  <div
                    key={twister.id}
                    className={`p-4 rounded-xl border transition duration-200 ${
                      isPracticing
                        ? "bg-blue-50/50 border-blue-300 ring-1 ring-blue-200"
                        : practiced
                        ? "bg-slate-50/80 border-slate-150"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            twister.difficulty === "Easy"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : twister.difficulty === "Medium"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>
                            {twister.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Focus: <strong className="text-slate-600">{twister.focus}</strong>
                          </span>
                        </div>

                        <p className="font-display font-bold text-slate-800 leading-snug pr-4">
                          "{twister.text}"
                        </p>
                      </div>

                      {/* Micro Practice controls */}
                      <div className="shrink-0 flex items-center gap-2 self-end md:self-start">
                        {practiced && !isPracticing && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded flex items-center gap-1 border border-emerald-150">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Completed
                          </span>
                        )}

                        {isPracticing ? (
                          <button
                            onClick={() => handleStopPractice(twister.id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Square className="h-3.5 w-3.5 fill-white" />
                            <span>Stop ({recordingSeconds}s)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartPractice(twister.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Mic className="h-3.5 w-3.5" />
                            <span>{practiced ? "Practice Again" : "Mic Practice"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Interactive waveform simulation if practicing this twister */}
                    {isPracticing && (
                      <div className="mt-4 pt-3.5 border-t border-blue-200 flex items-center gap-4 bg-white p-3 rounded-lg border border-blue-100 animate-pulse">
                        <div className="text-xs font-semibold text-blue-600 flex items-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 bg-rose-600 rounded-full" />
                          <span>Mic listening... read twister clearly 3 times</span>
                        </div>
                        <div className="flex-1 flex items-end justify-center h-6 gap-0.5">
                          {audioLevel.map((lvl, index) => (
                            <div
                              key={index}
                              className="bg-blue-500 rounded-t w-1 transition-all duration-100"
                              style={{ height: `${lvl}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
