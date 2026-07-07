import React from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, Award, Clock, Sparkles, Activity, ChevronRight, 
  HeartHandshake, ChevronLeft, Plus, CheckCircle, Flame
} from "lucide-react";
import { FeedbackReport } from "../types";

interface ProgressPageProps {
  pastSessions: FeedbackReport[];
  onGoBack: () => void;
  onViewReport: (report: FeedbackReport) => void;
  onStartNewPractice: () => void;
}

export default function ProgressPage({ 
  pastSessions, 
  onGoBack, 
  onViewReport,
  onStartNewPractice
}: ProgressPageProps) {
  // Sort sessions oldest to newest for proper chronological line charting
  const sortedSessions = [...pastSessions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const totalSessions = pastSessions.length;
  
  // High-level Calculations
  const avgScore = totalSessions > 0
    ? Math.round(pastSessions.reduce((acc, s) => acc + s.overallScore, 0) / totalSessions)
    : 0;

  const avgWPM = totalSessions > 0
    ? Math.round(pastSessions.reduce((acc, s) => {
        const wpm = Math.round((s.wordCount / (s.durationSeconds || 1)) * 60);
        return acc + wpm;
      }, 0) / totalSessions)
    : 0;

  // Track filler word averages across sessions
  const avgFillers = totalSessions > 0
    ? (pastSessions.reduce((acc, s) => {
        const counts = s.fillerWordsAnalysis.reduce((sum, f) => sum + f.count, 0);
        return acc + counts;
      }, 0) / totalSessions).toFixed(1)
    : "0.0";

  // Calculate improvement delta
  const initialScore = sortedSessions[0]?.overallScore || 0;
  const latestScore = sortedSessions[sortedSessions.length - 1]?.overallScore || 0;
  const scoreDelta = latestScore - initialScore;

  // SVG Score Trend Lines Calculator
  const drawScoreTrendSvg = () => {
    if (sortedSessions.length < 2) return null;

    const width = 600;
    const height = 180;
    const padding = 40;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const maxVal = 100;
    const minVal = 50;
    const range = maxVal - minVal;

    // Create points
    const points = sortedSessions.map((session, idx) => {
      const x = padding + (idx / (sortedSessions.length - 1)) * chartW;
      const y = height - padding - ((session.overallScore - minVal) / range) * chartH;
      return { x, y, score: session.overallScore, title: session.title, date: session.date, id: session.id };
    });

    const linePath = points.map(p => `${p.x},${p.y}`).join(" ");
    const areaPath = `M ${points[0].x},${height - padding} L ${linePath} L ${points[points.length - 1].x},${height - padding} Z`;

    return { points, linePath, areaPath, width, height, padding, minVal, maxVal, chartW, chartH };
  };

  const trendChart = drawScoreTrendSvg();

  // Multi-line chart details for separate skills (Clarity and Confidence)
  const drawSkillsComparisonSvg = () => {
    if (sortedSessions.length < 2) return null;

    const width = 600;
    const height = 180;
    const padding = 40;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const maxVal = 100;
    const minVal = 50;
    const range = maxVal - minVal;

    const clarityPoints = sortedSessions.map((s, idx) => {
      const x = padding + (idx / (sortedSessions.length - 1)) * chartW;
      const y = height - padding - ((s.clarityScore - minVal) / range) * chartH;
      return { x, y, value: s.clarityScore };
    });

    const confidencePoints = sortedSessions.map((s, idx) => {
      const x = padding + (idx / (sortedSessions.length - 1)) * chartW;
      const y = height - padding - ((s.confidenceScore - minVal) / range) * chartH;
      return { x, y, value: s.confidenceScore };
    });

    const clarityPath = clarityPoints.map(p => `${p.x},${p.y}`).join(" ");
    const confidencePath = confidencePoints.map(p => `${p.x},${p.y}`).join(" ");

    return { clarityPoints, confidencePoints, clarityPath, confidencePath, width, height, padding, chartW, chartH };
  };

  const skillsChart = drawSkillsComparisonSvg();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="progress-tracking-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <button
            onClick={onGoBack}
            className="text-slate-500 hover:text-blue-600 font-semibold text-sm flex items-center space-x-1 transition mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Studio</span>
          </button>
          <h1 className="font-display text-3xl font-bold text-slate-900">Progress Tracker</h1>
          <p className="text-slate-500 text-sm">Chronological overview of your presentation skill developments.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onStartNewPractice}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm flex items-center space-x-2 shadow-md shadow-blue-100"
          >
            <Plus className="h-4 w-4" />
            <span>Practice Now</span>
          </button>
        </div>
      </div>

      {totalSessions === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-6">
          <TrendingUp className="h-16 w-16 text-blue-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-800 text-xl">Unlock Your Progress Tracker</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Once you complete two or more practice presentations, we will draw custom timeline graphs charting your overall score, speaking velocity, and clarity indexes.
            </p>
          </div>
          <button
            onClick={onStartNewPractice}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
          >
            Launch First Practice Run
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-left">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Workouts Runs</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-800">{totalSessions} Runs</span>
                <span className="text-xs text-emerald-500 font-bold flex items-center">
                  <Flame className="h-3.5 w-3.5 mr-0.5 fill-current" />
                  Active
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-left">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Average Score</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-800">{avgScore}%</span>
                {totalSessions > 1 && scoreDelta !== 0 && (
                  <span className={`text-xs font-bold ${scoreDelta > 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {scoreDelta > 0 ? `+${scoreDelta}%` : `${scoreDelta}%`} lift
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-left">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Speaking Pace</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-800">{avgWPM} WPM</span>
                <span className="text-xs text-emerald-600 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  Golden Range
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-left">
              <span className="text-xs text-slate-400 font-semibold block uppercase">Filler words average</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-800">{avgFillers}</span>
                <span className="text-xs text-slate-400 font-medium">Per Session</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          {totalSessions < 2 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800 text-sm flex items-center space-x-3 text-left">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <span>Complete one more practice run to draw dynamic score improvement and skill trajectory graphs.</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Overall Score Improvement Chart */}
              {trendChart && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4 text-left">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-800">Overall Presentation Score History</h3>
                    <p className="text-slate-400 text-xs">Tracking chronological improvement over practicing sessions</p>
                  </div>

                  <div className="w-full overflow-x-auto custom-scrollbar">
                    <div className="min-w-[450px] h-[200px] relative">
                      <svg className="w-full h-full" viewBox={`0 0 ${trendChart.width} ${trendChart.height}`}>
                        <defs>
                          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {Array.from({ length: 3 }).map((_, idx) => {
                          const val = Math.round(trendChart.minVal + (trendChart.maxVal - trendChart.minVal) * (idx / 2));
                          const y = trendChart.height - trendChart.padding - (idx / 2) * trendChart.chartH;
                          return (
                            <g key={idx} className="opacity-40">
                              <line
                                x1={trendChart.padding}
                                y1={y}
                                x2={trendChart.width - trendChart.padding}
                                y2={y}
                                stroke="#cbd5e1"
                                strokeWidth="1"
                              />
                              <text x="5" y={y + 4} fill="#64748b" fontSize="10" className="font-mono">
                                {val}%
                              </text>
                            </g>
                          );
                        })}

                        {/* Draw area and path */}
                        <path d={trendChart.areaPath} fill="url(#scoreGrad)" />
                        <path d={`M ${trendChart.points.map(p => `${p.x},${p.y}`).join(" L ")}`} fill="none" stroke="#0284c7" strokeWidth="2.5" />

                        {/* Interactive dots */}
                        {trendChart.points.map((p, idx) => (
                          <g key={idx}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="5"
                              fill="#ffffff"
                              stroke="#0284c7"
                              strokeWidth="2"
                            />
                            <text
                              x={p.x}
                              y={p.y - 10}
                              fill="#1e293b"
                              fontSize="10"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="font-mono"
                            >
                              {p.score}%
                            </text>
                            <text
                              x={p.x}
                              y={trendChart.height - 12}
                              fill="#64748b"
                              fontSize="9"
                              fontWeight="semibold"
                              textAnchor="middle"
                              className="hidden sm:block"
                            >
                              Run {idx + 1}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Skill Dimensions Comparison Chart */}
              {skillsChart && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-display font-bold text-lg text-slate-800">Vocal Metrics Comparison</h3>
                      <p className="text-slate-400 text-xs">Comparing Vocal Clarity vs Spoken Confidence over time</p>
                    </div>
                    {/* legend */}
                    <div className="flex items-center space-x-3 text-xs font-semibold">
                      <div className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                        <span className="text-slate-500">Clarity</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                        <span className="text-slate-500">Confidence</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto custom-scrollbar">
                    <div className="min-w-[450px] h-[200px] relative">
                      <svg className="w-full h-full" viewBox={`0 0 ${skillsChart.width} ${skillsChart.height}`}>
                        {/* Grid lines */}
                        {Array.from({ length: 3 }).map((_, idx) => {
                          const y = skillsChart.height - skillsChart.padding - (idx / 2) * skillsChart.chartH;
                          return (
                            <line
                              key={idx}
                              x1={skillsChart.padding}
                              y1={y}
                              x2={skillsChart.width - skillsChart.padding}
                              y2={y}
                              stroke="#f1f5f9"
                              strokeWidth="1.5"
                            />
                          );
                        })}

                        {/* Draw lines */}
                        <path d={`M ${skillsChart.clarityPath}`} fill="none" stroke="#a855f7" strokeWidth="2.5" />
                        <path d={`M ${skillsChart.confidencePath}`} fill="none" stroke="#f97316" strokeWidth="2.5" />

                        {/* Clarity points */}
                        {skillsChart.clarityPoints.map((p, idx) => (
                          <circle
                            key={`clarity-${idx}`}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill="#ffffff"
                            stroke="#a855f7"
                            strokeWidth="2"
                          />
                        ))}

                        {/* Confidence points */}
                        {skillsChart.confidencePoints.map((p, idx) => (
                          <circle
                            key={`conf-${idx}`}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill="#ffffff"
                            stroke="#f97316"
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coach Progress Assessment Text */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm text-left grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center space-x-2 text-blue-600">
                <HeartHandshake className="h-5.5 w-5.5 text-blue-600" />
                <h3 className="font-display font-bold text-lg text-slate-800">AI Coach Progress Evaluation</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {scoreDelta > 0 
                  ? `Spectacular progress! Your speaking scores have increased by ${scoreDelta}% since your baseline. Your words per minute rate has successfully stabilized into the golden educational boundary of 120-150 WPM. Your next milestone is focus and intent: try to breathe for 2 full seconds instead of saying "like" or "um" at slide boundaries.`
                  : "Welcome to your progress console! Every presentation you practice helps reinforce speaking patterns and reduces crutch vocabulary. Complete more presentation runs with our teleprompter to unlock deep progress statistics."}
              </p>
            </div>
            <div className="md:col-span-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm">
                <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                <span>Next Milestone Target</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc text-left">
                <li>Minimize filler frequency below 3</li>
                <li>Reach overall speaking clarity of 95%</li>
                <li>Stabilize pace variation below 10 WPM</li>
              </ul>
            </div>
          </div>

          {/* Historical Run Lists */}
          <div className="space-y-4 text-left">
            <h3 className="font-display font-bold text-xl text-slate-800">Completed Workout Sessions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {pastSessions.map((session, index) => {
                const rating = session.overallScore >= 85 ? "Excellent" : session.overallScore >= 60 ? "Medium" : "Basic";
                const ratingColor = 
                  rating === "Excellent" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                  rating === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                  "bg-rose-50 text-rose-700 border-rose-100";

                return (
                  <div 
                    key={session.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-blue-300 transition hover:shadow-sm"
                  >
                    <div className="space-y-1 flex-1 min-w-0 pr-2">
                      <h4 className="font-semibold text-slate-800 text-sm truncate">{session.title}</h4>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{session.date} • {session.wordCount} words</span>
                        
                        {pastSessions[index + 1] ? (() => {
                          const prev = pastSessions[index + 1];
                          const delta = session.overallScore - prev.overallScore;
                          if (delta > 0) {
                            return (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                ▲ +{delta}%
                              </span>
                            );
                          } else if (delta < 0) {
                            return (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                                ▼ {delta}%
                              </span>
                            );
                          } else {
                            return (
                              <span className="text-[9px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                ● 0%
                              </span>
                            );
                          }
                        })() : (
                          <span className="text-[9px] font-semibold text-blue-600 bg-blue-50/50 border border-blue-100/50 px-1.5 py-0.5 rounded">
                            Baseline
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${ratingColor}`}>
                        {session.overallScore}% • {rating}
                      </span>
                      <button
                        onClick={() => onViewReport(session)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
