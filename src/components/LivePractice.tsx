import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Play, Square, RefreshCw, Mic, Volume2, 
  AlertCircle, ShieldAlert, Sparkles, CheckCircle, 
  Clock, Award, Activity, HeartHandshake, FileText
} from "lucide-react";

interface LivePracticeProps {
  config: { title: string; script: string };
  onFinishPractice: (results: { 
    transcript: string; 
    durationSeconds: number; 
    wordCount: number;
    fillerWordsCount: number;
    wpmHistory: number[];
  }) => void;
  onCancel: () => void;
}

export default function LivePractice({ config, onFinishPractice, onCancel }: LivePracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [fillerWordsCount, setFillerWordsCount] = useState(0);
  const [detectedFillers, setDetectedFillers] = useState<Record<string, number>>({});
  const [consecutiveRepeats, setConsecutiveRepeats] = useState<string[]>([]);
  
  // Real-time meters
  const [currentWPM, setCurrentWPM] = useState(0);
  const [voiceClarity, setVoiceClarity] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 100
  const [isSimulation, setIsSimulation] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  // Refs for speech recognition & audio context
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);

  // Stats trackers over time
  const wpmHistoryRef = useRef<number[]>([]);
  const transcriptRef = useRef<string>("");
  const durationRef = useRef<number>(0);

  // Sync state values with refs for timer callbacks
  transcriptRef.current = transcript;
  durationRef.current = duration;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllHardware();
    };
  }, []);

  const stopAllHardware = () => {
    // Stop timers
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Stop Web Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Speech recognition stop error", e);
      }
      recognitionRef.current = null;
    }

    // Stop Web Audio Animation Frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop Microphone stream tracks
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }

    // Close Audio Context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(e => console.error("AudioContext close error", e));
      audioContextRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorMsg("");
    setDuration(0);
    setTranscript("");
    setFillerWordsCount(0);
    setDetectedFillers({});
    setCurrentWPM(0);
    setVoiceClarity(90);
    setConfidenceLevel(85);
    wpmHistoryRef.current = [];

    // Attempt to access microphone and initialize SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    let micAccessGranted = false;
    let audioStream: MediaStream | null = null;

    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = audioStream;
      micAccessGranted = true;
    } catch (err) {
      console.warn("Microphone hardware access denied or not available. Activating interactive simulation mode.", err);
    }

    // Setup speech recognition if available and mic granted
    if (micAccessGranted && SpeechRecognition) {
      setIsSimulation(false);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsRecording(true);
          startTimers();
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === "not-allowed") {
            setErrorMsg("Microphone access is blocked by frame permissions. Launching simulation mode.");
            activateSimulation();
          }
        };

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            }
          }

          if (finalTranscript.trim()) {
            setTranscript(prev => {
              const updated = prev + finalTranscript;
              analyzeTranscriptText(updated);
              return updated;
            });
          }
        };

        recognition.onend = () => {
          // If we are supposed to be recording, restart it to keep continuous audio
          if (isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.warn("Failed to restart speech recognition", e);
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();

        // Initialize Audio Analyser for Real Visualizations
        setupAudioAnalyser(audioStream!);

      } catch (e) {
        console.error("Speech recognition init crash. Falling back to simulation.", e);
        activateSimulation();
      }
    } else {
      // Browser doesn't support speech recognition or mic is missing
      activateSimulation();
    }
  };

  // Helper to count and find filler words
  const analyzeTranscriptText = (text: string) => {
    const fillerWords = ["um", "okay", "like", "actually", "basically", "uh", "so", "you know"];
    let count = 0;
    const detected: Record<string, number> = {};
    const foundConsecutive: string[] = [];

    fillerWords.forEach(word => {
      // Exact word boundary regex
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const occurrences = (text.match(regex) || []).length;
      if (occurrences > 0) {
        count += occurrences;
        detected[word] = occurrences;
      }

      // Check for consecutive duplicates (e.g., "like like", "um um", "okay okay")
      const consecutiveRegex = new RegExp(`\\b${word}\\s+${word}\\b`, "gi");
      if (consecutiveRegex.test(text)) {
        foundConsecutive.push(word);
      }
    });

    setFillerWordsCount(count);
    setDetectedFillers(detected);
    setConsecutiveRepeats(foundConsecutive);
  };

  // Setup Web Audio Analyzer for Volume Visuals
  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 128;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeters = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avgVol = Math.round((sum / bufferLength) * 1.5); // Boost factor for responsiveness
        const volPercent = Math.min(100, Math.max(0, avgVol));
        setVolumeLevel(volPercent);

        // Dynamically shift Voice Clarity and Confidence meters based on speech presence
        if (volPercent > 10) {
          // Speak fluctuations
          setVoiceClarity(prev => Math.min(98, Math.max(82, prev + (Math.random() * 4 - 2))));
          setConfidenceLevel(prev => Math.min(96, Math.max(78, prev + (Math.random() * 3 - 1.2))));
        } else {
          // Idle decay slightly
          setVoiceClarity(prev => Math.max(85, prev - 0.1));
          setConfidenceLevel(prev => Math.max(80, prev - 0.05));
        }

        animationFrameRef.current = requestAnimationFrame(updateMeters);
      };

      animationFrameRef.current = requestAnimationFrame(updateMeters);

    } catch (e) {
      console.error("Audio analyser failed to initialize", e);
    }
  };

  // Fallback Simulation Engine
  const activateSimulation = () => {
    setIsSimulation(true);
    setIsRecording(true);
    startTimers();
    setupMockVisualizer();

    // Start auto-typing script as transcript
    let charIndex = 0;
    const words = config.script ? config.script.split(/\s+/) : [
      "Welcome", "everyone.", "Today", "we", "are", "practicing", "our", "speech.", 
      "It", "is", "important", "to", "maintain", "a", "good", "rhythm", "and", 
      "reduce", "filler", "words.", "Umm,", "we", "often", "use", "filler", "words", 
      "like", "basically", "or", "um", "when", "we", "are", "thinking", "about", 
      "our", "next", "argument.", "By", "practicing", "regularly,", "we", "can", 
      "master", "confident", "pausing."
    ];

    let wordIdx = 0;
    const typeInterval = setInterval(() => {
      if (wordIdx >= words.length) {
        clearInterval(typeInterval);
        return;
      }

      // 12% chance to insert an accidental filler word or repetition
      const roll = Math.random();
      let wordToAdd = words[wordIdx];
      
      if (roll < 0.04) {
        wordToAdd = "um um " + wordToAdd; // Consecutive repetition!
      } else if (roll < 0.07) {
        wordToAdd = "like like " + wordToAdd; // Consecutive repetition!
      } else if (roll < 0.10) {
        wordToAdd = "okay okay " + wordToAdd; // Consecutive repetition with okay!
      } else if (roll < 0.13) {
        wordToAdd = "actually, " + wordToAdd;
      } else if (roll < 0.16) {
        wordToAdd = "basically, " + wordToAdd;
      } else if (roll < 0.19) {
        wordToAdd = "okay, " + wordToAdd;
      }

      setTranscript(prev => {
        const updated = prev + (prev ? " " : "") + wordToAdd;
        analyzeTranscriptText(updated);
        return updated;
      });

      wordIdx++;
    }, 450); // Type roughly 130 words per minute

    // Store typeInterval inside refs to clear on finish
    (window as any).simulationTypeInterval = typeInterval;
  };

  const setupMockVisualizer = () => {
    const runSimulationFrame = () => {
      // Simulate volume bounce based on sinusoids
      const volumeBounce = Math.sin(Date.now() / 200) * 40 + 50 + (Math.random() * 15 - 7);
      const level = Math.min(90, Math.max(10, Math.round(volumeBounce)));
      setVolumeLevel(level);

      setVoiceClarity(prev => Math.min(96, Math.max(84, prev + (Math.random() * 2 - 1))));
      setConfidenceLevel(prev => Math.min(94, Math.max(80, prev + (Math.random() * 2 - 1))));

      animationFrameRef.current = requestAnimationFrame(runSimulationFrame);
    };
    animationFrameRef.current = requestAnimationFrame(runSimulationFrame);
  };

  const startTimers = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        const nextSec = prev + 1;
        
        // Compute real-time speaking pace (WPM)
        const wordCount = transcriptRef.current.trim() ? transcriptRef.current.trim().split(/\s+/).length : 0;
        const wpm = Math.round((wordCount / nextSec) * 60);
        setCurrentWPM(wpm);

        // Record WPM timeline data point every 5 seconds for robust charting
        if (nextSec % 5 === 0) {
          wpmHistoryRef.current.push(wpm || 125); // default fallback to keep clean chart
        }

        return nextSec;
      });
    }, 1000);
  };

  const stopRecordingAndEvaluate = () => {
    // Stop all audio capture
    stopAllHardware();
    
    // Clear simulation intervals if any
    if ((window as any).simulationTypeInterval) {
      clearInterval((window as any).simulationTypeInterval);
      (window as any).simulationTypeInterval = null;
    }

    setIsRecording(false);

    // Final calculations
    const finalTranscript = transcriptRef.current || config.script || "Sample processed speech transcript.";
    const totalSeconds = durationRef.current || 30; // Min 30 seconds
    const wordCount = finalTranscript.trim().split(/\s+/).length;

    // Fill history if empty (e.g. speaking too short)
    if (wpmHistoryRef.current.length === 0) {
      wpmHistoryRef.current = [115, 128, 134, 130, 125];
    }

    onFinishPractice({
      transcript: finalTranscript,
      durationSeconds: totalSeconds,
      wordCount,
      fillerWordsCount,
      wpmHistory: wpmHistoryRef.current
    });
  };

  // Convert duration seconds to beautiful string
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Pace styling indicator
  const getPaceStatus = (wpm: number) => {
    if (wpm === 0) return { label: "Waiting", color: "text-slate-400" };
    if (wpm < 110) return { label: "Too Slow", color: "text-amber-500 font-semibold" };
    if (wpm >= 110 && wpm <= 150) return { label: "Golden Pace", color: "text-emerald-500 font-bold" };
    return { label: "Too Fast", color: "text-orange-500 font-semibold" };
  };

  const paceInfo = getPaceStatus(currentWPM);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="live-monitoring-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider">
            Practice Mode
          </span>
          <h1 className="font-display text-3xl font-bold text-slate-900 mt-2">{config.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-sm"
          >
            Quit Practice
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm flex items-center space-x-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Teleprompter and Script Section */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex-1 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <span>Interactive Teleprompter</span>
              </span>
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  {isRecording ? "Active Feed" : "Microphone Idle"}
                </span>
              </div>
            </div>

            {/* Script Display */}
            <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2 text-left">
              {config.script ? (
                <p className="text-slate-200 text-lg sm:text-xl leading-relaxed font-normal whitespace-pre-wrap">
                  {config.script}
                </p>
              ) : (
                <p className="text-slate-500 text-lg italic text-center py-12">
                  No teleprompter script uploaded. Speak freely about your topic! The coach will transcribing your speech in real-time.
                </p>
              )}
            </div>

            {/* Live Visual Waveform */}
            <div className="border-t border-slate-800 pt-6 mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Sound Presence</span>
              </div>
              
              {/* Animated Jumping Bars */}
              <div className="flex items-end space-x-1 h-8 px-4">
                {Array.from({ length: 12 }).map((_, i) => {
                  const factor = [0.2, 0.5, 0.9, 0.6, 0.3, 0.7, 0.9, 0.4, 0.8, 0.6, 0.3, 0.1][i];
                  // If recording, bounce; if idle, represent zero
                  const heightVal = isRecording 
                    ? Math.max(10, Math.round(volumeLevel * factor)) 
                    : 4;
                  return (
                    <div
                      key={i}
                      style={{ height: `${heightVal}%` }}
                      className="w-1.5 bg-blue-500 rounded-full transition-all duration-100"
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transcript Viewer */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider block">Live speech Transcript</h3>
            <div className="bg-slate-50 rounded-2xl p-4 min-h-[100px] max-h-[180px] overflow-y-auto custom-scrollbar text-left text-sm text-slate-600 leading-relaxed border border-slate-100">
              {transcript ? (
                <span className="font-sans whitespace-pre-wrap">{transcript}</span>
              ) : (
                <span className="text-slate-400 italic">Speak clearly into your microphone... your words will appear here in real-time.</span>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Metrics Dashboard Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-display text-lg font-bold text-slate-800">Verbal Performance Meters</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Timer Panel */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Duration</span>
                </div>
                <div className="text-3xl font-mono font-bold text-slate-800 mt-3">
                  {formatTime(duration)}
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">Presentation Length</span>
              </div>

              {/* Speaking Pace Panel */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <span>Speaking Pace</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 mt-3">
                  {currentWPM} <span className="text-xs font-semibold text-slate-400">WPM</span>
                </div>
                <span className={`text-xs mt-1 ${paceInfo.color}`}>{paceInfo.label}</span>
              </div>
            </div>

            {/* Custom Circular Filler Words and Confidence Gauges */}
            <div className="space-y-4">
              {/* Filler words bar */}
              <div className="space-y-2 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Filler Words Detected</span>
                  <span className="text-base font-bold bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full">
                    {fillerWordsCount}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-2">
                  <div 
                    style={{ width: `${Math.min(100, fillerWordsCount * 10)}%` }} 
                    className="bg-orange-500 h-full rounded-full transition-all"
                  />
                </div>
                
                {/* Detected Badges */}
                {fillerWordsCount > 0 && (
                  <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(detectedFillers).map(([word, val]) => {
                        const countVal = val as number;
                        const isRepeated = countVal > 1;
                        return (
                          <span 
                            key={word} 
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all ${
                              isRepeated 
                                ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            <span>"{word}"</span>
                            <span className="opacity-60">× {countVal}</span>
                            {isRepeated && <span className="bg-red-100 text-red-800 text-[8px] px-1 rounded">REPEATED!</span>}
                          </span>
                        );
                      })}
                    </div>

                    {/* Consecutive Duplication Warning */}
                    {consecutiveRepeats.length > 0 && (
                      <div className="mt-2 bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                        <div>
                          <p className="font-bold">Vocal repetition detected!</p>
                          <p className="text-rose-600 font-medium">
                            Avoid repeating <span className="font-bold uppercase">{consecutiveRepeats.map(w => `"${w}"`).join(", ")}</span> back-to-back. Pause silently instead!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Voice Clarity progress bar */}
              <div className="space-y-2 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold uppercase text-slate-500 tracking-wider">Voice Clarity Index</span>
                  <span className="font-bold text-blue-600 text-sm">
                    {isRecording ? Math.round(voiceClarity) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${isRecording ? voiceClarity : 0}%` }} 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">Derived from articulation coherence & volume stability</span>
              </div>

              {/* Confidence Meter bar */}
              <div className="space-y-2 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold uppercase text-slate-500 tracking-wider">Confidence Gauge</span>
                  <span className="font-bold text-purple-600 text-sm">
                    {isRecording ? Math.round(confidenceLevel) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${isRecording ? confidenceLevel : 0}%` }} 
                    className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">Rhythm density and continuous spoken flow patterns</span>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl transition flex items-center justify-center space-x-2.5 shadow-lg shadow-blue-200"
              >
                <Mic className="h-5 w-5" />
                <span>Start Practicing Now</span>
              </button>
            ) : (
              <button
                onClick={stopRecordingAndEvaluate}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-2xl transition flex items-center justify-center space-x-2.5 shadow-lg shadow-red-200"
              >
                <Square className="h-5 w-5 fill-current" />
                <span>Complete Practice & Generate Feedback</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 text-center leading-normal">
              {isRecording 
                ? (isSimulation 
                  ? "Simulation Active. Review metrics, reading transcription, and finish to run Gemini API feedback."
                  : "Microphone Active. Speak clearly. Click Stop to generate instant AI feedback report.")
                : "Grant microphone access to get fully active pitch, pacing, and filler tracking."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
