import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, FileText, Clock, Award, Activity, 
  Trash2, ChevronRight, Plus, Sparkles, TrendingUp, AlertCircle,
  Upload, X
} from "lucide-react";
import { FeedbackReport } from "../types";
import mammoth from "mammoth";

interface DashboardProps {
  pastSessions: FeedbackReport[];
  onStartPractice: (config: { title: string; script: string }) => void;
  onViewReport: (report: FeedbackReport) => void;
  onDeleteSession: (id: string) => void;
  onViewProgress: () => void;
}

export default function Dashboard({ 
  pastSessions, 
  onStartPractice, 
  onViewReport, 
  onDeleteSession,
  onViewProgress
}: DashboardProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [error, setError] = useState("");

  // Document upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "reading" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFileName("");
    setUploadStatus("idle");
    setScript("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    
    setUploadStatus("reading");
    setUploadedFileName(file.name);
    setError("");

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileExtension === "docx") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            if (!arrayBuffer) {
              throw new Error("Failed to read Word document buffer.");
            }
            const result = await mammoth.extractRawText({ arrayBuffer });
            if (result && result.value) {
              setScript(result.value);
              setUploadStatus("success");
              // Auto-fill title if empty
              if (!title) {
                const cleanName = file.name.replace(/\.[^/.]+$/, "");
                setTitle(cleanName);
              }
            } else {
              throw new Error("Could not extract text from this Word document.");
            }
          } catch (err: any) {
            console.error("Mammoth docx extraction error:", err);
            setUploadStatus("error");
            setError(`Error reading Word document: ${err.message || "Invalid format"}`);
          }
        };
        reader.onerror = () => {
          setUploadStatus("error");
          setError("Failed to read Word document file.");
        };
        reader.readAsArrayBuffer(file);
      } else if (fileExtension === "txt" || fileExtension === "md" || fileExtension === "rtf" || fileExtension === "html" || fileExtension === "json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text) {
            setScript(text);
            setUploadStatus("success");
            // Auto-fill title if empty
            if (!title) {
              const cleanName = file.name.replace(/\.[^/.]+$/, "");
              setTitle(cleanName);
            }
          } else {
            setUploadStatus("error");
            setError("The uploaded document is empty.");
          }
        };
        reader.onerror = () => {
          setUploadStatus("error");
          setError("Failed to read text file.");
        };
        reader.readAsText(file);
      } else {
        setUploadStatus("error");
        setError("Unsupported format. Please upload a Microsoft Word document (.docx) or a text document (.txt, .md, .rtf).");
      }
    } catch (err: any) {
      setUploadStatus("error");
      setError(`Error reading document: ${err.message || err}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a presentation title.");
      return;
    }
    setError("");
    onStartPractice({
      title: title.trim(),
      script: script.trim()
    });
    // Reset form
    setTitle("");
    setScript("");
    setShowConfig(false);
  };

  // Pre-fill fields with template script for convenience
  const applyBiologyTemplate = () => {
    setTitle("Biology - Eukaryotic Cells");
    setScript(
      "Today, we are going to explore the cell structure. Cells are the basic functional building blocks of all living organisms. Eukaryotic cells have a true membrane-bound nucleus housing genetic material, along with specialized organelles like mitochondria that act as energy powerhouses."
    );
  };

  const applyHistoryTemplate = () => {
    setTitle("The French Revolution Introduction");
    setScript(
      "The French Revolution erupted in seventeen eighty-nine, fueled by deep-seated social inequality and extreme food shortages. The commoners rose up to demand liberties, storming the Bastille, which stood as a powerful symbol of royal tyranny and absolute royal authority."
    );
  };

  // Calculate summary stats
  const totalSessions = pastSessions.length;
  const avgScore = totalSessions > 0 
    ? Math.round(pastSessions.reduce((acc, s) => acc + s.overallScore, 0) / totalSessions)
    : 0;
  const highestScore = totalSessions > 0
    ? Math.max(...pastSessions.map(s => s.overallScore))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="practice-dashboard">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Your Practice Studio</h1>
          <p className="text-slate-500 mt-1">Practice, review, and track your presentations in a stress-free environment.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onViewProgress}
            className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-4 py-2.5 rounded-xl transition text-sm"
          >
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Progress Tracker</span>
          </button>
          
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm shadow-md shadow-blue-200"
          >
            <Plus className="h-4 w-4" />
            <span>Start Practice</span>
          </button>
        </div>
      </div>

      {/* Brief Stats Row */}
      {totalSessions > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Practice Runs</span>
              <span className="text-2xl font-bold text-slate-800">{totalSessions} runs</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Coach Score</span>
              <span className="text-2xl font-bold text-slate-800">{avgScore}%</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Best Score Achieved</span>
              <span className="text-2xl font-bold text-slate-800">{highestScore}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Practice configuration panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white rounded-2xl border border-blue-200 shadow-lg"
          >
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Configure New Practice Run
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Name your presentation and optionally paste a script to read from during your run.</p>
                </div>
                <button 
                  onClick={() => setShowConfig(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm flex items-center space-x-2 border border-red-100">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="p-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Presentation Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="p-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Biology Semestral Slide Deck"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-800 focus:outline-none transition text-sm"
                  />
                </div>

                {/* Document Upload Area */}
                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-slate-700">
                    Upload Script Document <span className="text-slate-400 font-normal">(Optional)</span>
                  </span>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center cursor-pointer text-center relative ${
                      dragActive 
                        ? "border-blue-500 bg-blue-50/50" 
                        : uploadStatus === "success"
                          ? "border-emerald-500 bg-emerald-50/20"
                          : "border-slate-200 bg-slate-50/40 hover:border-blue-400 hover:bg-slate-50/80"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.txt,.md,.rtf,.html"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {uploadStatus === "idle" && (
                      <div className="space-y-2">
                        <div className="p-3 bg-white border border-slate-100 rounded-xl inline-block shadow-sm text-slate-400 hover:text-blue-500 transition">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Drag & drop your presentation script, or <span className="text-blue-600 underline">browse files</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Supports Microsoft Word (.docx) or Text Files (.txt, .md, .rtf)
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadStatus === "reading" && (
                      <div className="space-y-3">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
                        <p className="text-sm font-semibold text-slate-600">Extracting script text...</p>
                      </div>
                    )}

                    {uploadStatus === "success" && (
                      <div className="space-y-2 w-full max-w-md">
                        <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-100 p-3 rounded-xl">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                            <div className="text-left min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{uploadedFileName}</p>
                              <p className="text-[10px] text-emerald-700 font-medium">
                                Successfully loaded • {script ? script.split(/\s+/).length : 0} words
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearUploadedFile();
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 text-left">Click file to change, or clear it to start over.</p>
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl inline-block">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-red-600">Upload error occurred</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearUploadedFile();
                          }}
                          className="text-xs text-slate-500 underline hover:text-slate-700 block"
                        >
                          Clear & Try Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="p-script" className="block text-sm font-semibold text-slate-700">
                      Edit Script Text <span className="text-slate-400 font-normal">(Auto-filled from upload)</span>
                    </label>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-400 font-semibold uppercase">Try Templates:</span>
                      <button
                        type="button"
                        onClick={applyBiologyTemplate}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Biology
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={applyHistoryTemplate}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        History
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="p-script"
                    rows={5}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Paste/type or upload your script to auto-populate. It will display in the interactive teleprompter!"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-800 focus:outline-none transition text-sm leading-relaxed"
                  />
                  <p className="text-xs text-slate-400 mt-1">You will be able to speak along to this script, and Gemini will cross-analyze your reading against your actual vocal performance.</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm flex items-center space-x-2 shadow-md shadow-blue-100"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Launch Teleprompter & Mic</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Section */}
      <div className="grid md:grid-cols-12 gap-8">
        {/* Left/Main Column: Past Practice Sessions */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl font-bold text-slate-800">Your Practice Logs</h3>
            <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {totalSessions} runs logged
            </span>
          </div>

          {totalSessions === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-5">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <FileText className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="font-semibold text-slate-800 text-lg">No Practice Sessions Yet</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  You haven't run any presentation practices yet. Configure your first run with an optional script and activate your microphone to receive custom AI evaluations.
                </p>
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm inline-flex items-center space-x-2 shadow-md shadow-blue-100"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Practice Run</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pastSessions.map((session, index) => {
                const mins = Math.floor(session.durationSeconds / 60);
                const secs = session.durationSeconds % 60;
                const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

                const rating = session.overallScore >= 85 ? "Excellent" : session.overallScore >= 60 ? "Medium" : "Basic";
                const ratingColor = 
                  rating === "Excellent" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                  rating === "Medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                  "bg-rose-50 text-rose-700 border-rose-100";

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${ratingColor}`}>
                          {session.overallScore}% • {rating}
                        </span>

                        {pastSessions[index + 1] ? (() => {
                          const prev = pastSessions[index + 1];
                          const delta = session.overallScore - prev.overallScore;
                          if (delta > 0) {
                            return (
                              <span className="text-xs font-bold bg-emerald-100/60 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <span>▲</span>
                                <span>+{delta}% improved</span>
                              </span>
                            );
                          } else if (delta < 0) {
                            return (
                              <span className="text-xs font-bold bg-rose-100/60 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <span>▼</span>
                                <span>{delta}% decreased</span>
                              </span>
                            );
                          } else {
                            return (
                              <span className="text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <span>●</span>
                                <span>No change</span>
                              </span>
                            );
                          }
                        })() : (
                          <span className="text-xs font-semibold bg-blue-50/50 text-blue-600 border border-blue-100/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <span>★</span>
                            <span>Baseline Run</span>
                          </span>
                        )}

                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(session.date).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-lg group-hover:text-blue-600 transition">
                        {session.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 font-semibold uppercase">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{timeStr} duration</span>
                        </span>
                        <span>•</span>
                        <span>{session.wordCount} words spoken</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-50 transition"
                        title="Delete run"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => onViewReport(session)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-4 py-2.5 rounded-xl transition text-sm flex items-center space-x-1.5"
                      >
                        <span>View Report</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Mini Guidelines & Tips */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-3xl shadow-md space-y-4">
            <div className="bg-white/15 w-10 h-10 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-100" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg">AI Speech Tips</h4>
              <p className="text-blue-100 text-xs">Simple tricks to score higher in your presentations:</p>
            </div>
            <ul className="space-y-3 text-xs text-blue-50 text-left list-none pl-0">
              <li className="flex items-start space-x-2">
                <span className="bg-white/15 h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span><strong>Target 130 WPM</strong>: Aim for a slow, articulate reading speed. It increases clarity dramatically.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-white/15 h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span><strong>Embrace the Pause</strong>: When you lose your place, hold a silent breath rather than saying "um" or "like".</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="bg-white/15 h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span><strong>Enunciate Consonants</strong>: Clear vocalizations increase your AI Clarity ratings automatically.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider block">Coaching Standards</h4>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Perfect Pace</span>
                <span className="text-slate-800 font-bold">120 - 150 WPM</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-full rounded-full" />
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 font-semibold">Filler Tolerance</span>
                <span className="text-slate-800 font-bold">&lt; 3 per minute</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-4/5 rounded-full" />
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500 font-semibold">Vocal Clarity</span>
                <span className="text-slate-800 font-bold">&gt; 85% Coherence</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-11/12 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
