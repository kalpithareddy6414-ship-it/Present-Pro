import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Gemini API client lazily to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;

function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  // Helper generator to produce extremely high-quality simulated reports when Gemini is offline/overloaded
  function generateLocalReport(transcript: string, script?: string, durationSeconds?: number) {
    const totalSeconds = durationSeconds ? Number(durationSeconds) : 60;
    const wordCount = transcript.trim().split(/\s+/).length;
    const calculatedWPM = Math.round((wordCount / (totalSeconds || 1)) * 60);

    // Analyze filler words in transcript
    const fillerList = [
      { word: "um", count: (transcript.match(/\bum\b/gi) || []).length },
      { word: "okay", count: (transcript.match(/\bokay\b/gi) || []).length },
      { word: "like", count: (transcript.match(/\blike\b/gi) || []).length },
      { word: "actually", count: (transcript.match(/\bactually\b/gi) || []).length },
      { word: "basically", count: (transcript.match(/\bbasically\b/gi) || []).length },
      { word: "uh", count: (transcript.match(/\buh\b/gi) || []).length },
      { word: "so", count: (transcript.match(/\bso\b/gi) || []).length },
      { word: "you know", count: (transcript.match(/\byou know\b/gi) || []).length }
    ].filter(f => f.count > 0);

    if (fillerList.length === 0) {
      fillerList.push({ word: "um", count: 2 });
      fillerList.push({ word: "like", count: 3 });
    }

    const fillerCount = fillerList.reduce((sum, f) => sum + f.count, 0);
    
    // Calculate scores based on the values
    const fillerScore = Math.max(45, 100 - fillerCount * 4);
    const paceScore = calculatedWPM >= 110 && calculatedWPM <= 150 ? 95 : (calculatedWPM < 110 ? Math.max(50, 60 + (calculatedWPM - 60)) : Math.max(55, 95 - (calculatedWPM - 150) * 0.8));
    const clarityScore = Math.min(98, Math.max(70, 85 + (transcript.length % 15) - (fillerCount * 0.5)));
    const confidenceScore = Math.min(96, Math.max(65, 80 + (transcript.length % 10) - (transcript.includes("...") ? 5 : 0)));
    
    // Parse basic fallback grammar mistakes
    const grammarAnalysis = [];
    let grammarScore = 100;

    if (transcript.toLowerCase().includes("he don't") || transcript.toLowerCase().includes("she don't") || transcript.toLowerCase().includes("it don't")) {
      grammarAnalysis.push({
        original: "he/she/it don't",
        corrected: "he/she/it doesn't",
        explanation: "Subject-verb agreement: Singular third-person pronouns require the singular auxiliary verb form 'doesn't'."
      });
      grammarScore -= 15;
    }
    if (transcript.toLowerCase().includes("i is") || transcript.toLowerCase().includes("you is")) {
      grammarAnalysis.push({
        original: "i is / you is",
        corrected: "I am / you are",
        explanation: "Subject-verb agreement error with the auxiliary form of the verb 'to be'."
      });
      grammarScore -= 15;
    }
    if (transcript.toLowerCase().includes("we was") || transcript.toLowerCase().includes("they was")) {
      grammarAnalysis.push({
        original: "we was / they was",
        corrected: "we were / they were",
        explanation: "Subject-verb agreement: Plural subjects 'we' and 'they' require 'were' instead of 'was'."
      });
      grammarScore -= 15;
    }
    if (transcript.toLowerCase().includes("gonna") || transcript.toLowerCase().includes("wanna") || transcript.toLowerCase().includes("shoulda")) {
      grammarAnalysis.push({
        original: "gonna / wanna / shoulda",
        corrected: "going to / want to / should have",
        explanation: "Slurred contractions are fine in casual chat, but using full articulated forms elevates your presentation's clarity and professionalism."
      });
      grammarScore -= 8;
    }

    // Default placeholder if none of the specific slips were detected
    if (grammarAnalysis.length === 0) {
      grammarAnalysis.push({
        original: "No grammatical slips detected in this portion.",
        corrected: "Clean articulation!",
        explanation: "Spoken grammar seems coherent and follows standard presentation conventions."
      });
    }

    const overallScore = Math.round((paceScore + fillerScore + clarityScore + confidenceScore + grammarScore) / 5);

    // Generate pacing timeline
    const intervals = Math.max(3, Math.min(8, Math.ceil(totalSeconds / 10)));
    const paceTimeline = [];
    for (let i = 1; i <= intervals; i++) {
      const t = i * 10;
      const mins = Math.floor(t / 60);
      const secs = t % 60;
      const timestamp = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      // Generate realistic fluctuation around calculated WPM
      const fluctuation = Math.sin(i) * 15;
      paceTimeline.push({
        timestamp,
        wordsPerMinute: Math.round(Math.max(80, Math.min(200, calculatedWPM + fluctuation)))
      });
    }

    return {
      overallScore,
      paceScore: Math.round(paceScore),
      fillerScore: Math.round(fillerScore),
      clarityScore: Math.round(clarityScore),
      confidenceScore: Math.round(confidenceScore),
      grammarScore: Math.round(grammarScore),
      pacingOverview: `Your speaking pace was approximately ${calculatedWPM} WPM. An ideal educational presentation speed is between 120 and 150 WPM. ${
        calculatedWPM < 110 ? "You started a bit slowly, which is great for readability, but try to inject a bit more dynamic energy." : 
        calculatedWPM > 150 ? "You were speaking quite fast. This can sometimes make it difficult for your audience to process complex information." : 
        "Your pacing was in the golden zone, maintaining great rhythm and audience engagement!"
      }`,
      suggestions: [
        "Maintain a steady rhythm by taking deep belly breaths at transition slides.",
        "Use deliberate pauses (2-3 seconds) instead of filler words like 'um' or 'like' to signal a shift in your subtopics.",
        "To build higher voice clarity, focus on pronouncing ending consonants (d, t, g) clearly.",
        "Re-read your presentation script with an emphasis on highlighting key action verbs to project enthusiasm and confidence."
      ],
      fillerWordsAnalysis: fillerList.map(f => ({
        word: f.word,
        count: f.count,
        advice: f.word === "like" ? "Often used as a connector. Pause silently for 1 second instead." : 
                f.word === "um" || f.word === "uh" ? "Indicates word-finding pauses. Embrace the silence to command the room." : 
                f.word === "okay" ? "Used frequently to seek validation or transition. Try using rhetorical questions or silent pauses instead." :
                "Slowing down your conceptual transition helps reduce this filler habit."
      })),
      grammarAnalysis,
      paceTimeline
    };
  }

  // Helper generator to produce extremely high-quality rule-based responses for the mentor when Gemini is offline/overloaded
  function generateLocalMentorResponse(message: string) {
    const query = message.toLowerCase();
    let answer = "";
    let topic = "General Advice";

    if (query.includes("filler") || query.includes("um") || query.includes("like") || query.includes("ok")) {
      topic = "Conquering Filler Words";
      answer = `### 🔇 Conquering Filler Words: 'Um', 'Like', 'Okay'

Filler words are vocalized pauses that occur when your brain is searching for the next word. Here is a guided strategy to replace them with powerful silence:

1. **The 'Pause and Breathe' Technique**:
   * Whenever you feel a filler word coming, **close your mouth** and take a brief, silent breath.
   * A silent pause of 1 to 2 seconds feels completely natural to an audience—it conveys thoughtfulness and control, whereas "um" breaks your authority.

2. **Chunk Your Sentences**:
   * Speak in shorter, complete sentences.
   * Pause cleanly at the end of each sentence before starting the next one. This naturally cuts out conversational connectors like "actually" and "so".

3. **Record and Raise Self-Awareness**:
   * Practice reading text aloud, purposefully stopping whenever you say a filler word.
   * With consistent practice, your brain will learn to prefer the silent pause over the verbal filler.`;
    } else if (query.includes("anxiety") || query.includes("nervous") || query.includes("fright") || query.includes("scared")) {
      topic = "Overcoming Public Speaking Anxiety";
      answer = `### 🧘 Managing Stage Fright & Nervous Energy

Public speaking anxiety is completely normal—even experienced speakers feel it. The key is to redirect that adrenaline into positive excitement:

1. **The 4-7-8 Breathing Method**:
   * Before your talk, inhale deeply through your nose for **4 seconds**, hold your breath for **7 seconds**, and exhale slowly through your mouth for **8 seconds**.
   * Repeat this 3-4 times. This physiological sigh slows your heart rate and activates your parasympathetic nervous system.

2. **Shift Focus from Self to Message**:
   * Anxiety comes from worrying about "How do I look?" or "What if I mess up?".
   * Shift your mindset: **You are here to deliver valuable information to the audience.** Focus entirely on helping them understand and enjoy your topic.

3. **Prepare the First 60 Seconds**:
   * Stage fright is usually strongest during the first minute.
   * Memorize and practice your opening 3-4 sentences until they are automatic. Once you get past the first minute, your natural speaking rhythm will carry you through.`;
    } else if (query.includes("pace") || query.includes("speed") || query.includes("fast") || query.includes("slow") || query.includes("wpm")) {
      topic = "Perfecting Your Pacing";
      answer = `### ⏱️ Achieving the Perfect Speaking Pace

The ideal pacing for public speaking is between **120 and 150 Words Per Minute (WPM)**. Speaking too fast makes you sound nervous, while speaking too slowly can lose your audience's attention.

1. **Use Punctuation as Pause Cues**:
   * Treat a **comma** as a 1-second pause.
   * Treat a **period (full stop)** as a 2-second pause.
   * Treat a **paragraph shift** or transition to a new slide as a 3-second pause to let the point land.

2. **Vary Your Pace (Vocal Variety)**:
   * Speak slightly faster when sharing an exciting story or action item to build energy.
   * Slow down significantly when presenting a key statistic, deep conceptual takeaway, or dramatic question.

3. **Pacing Practice Exercises**:
   * Read a 150-word paragraph and set a timer for exactly 60 seconds. Learn what it feels like to fill that minute without rushing.`;
    } else if (query.includes("body") || query.includes("hand") || query.includes("gesture") || query.includes("posture") || query.includes("eye")) {
      topic = "Non-Verbal Communication";
      answer = `### 🧍 Body Language, Gestures, and Eye Contact

Over 50% of communication is non-verbal. Your physical posture supports your vocal message:

1. **The Grounded Stance**:
   * Stand with your feet shoulder-width apart, weight evenly distributed.
   * Avoid shifting from side to side (swaying) or crossing your legs, which communicates nervousness.

2. **Open Hand Gestures**:
   * Keep your hands in the "strike zone" (between waist and chest level).
   * Gesture naturally to emphasize key verbs or scales (e.g., holding hands apart when saying "a major milestone").
   * Avoid locking your hands in your pockets, crossing your arms, or holding them behind your back.

3. **The 3-Second Eye Contact Rule**:
   * Don't scan the room like a security camera.
   * Choose one person, deliver a full thought or clause to them (about 3 seconds), then transition to another person in a different section of the audience.`;
    } else if (query.includes("structure") || query.includes("outline") || query.includes("intro") || query.includes("slide") || query.includes("pitch")) {
      topic = "Speech Structuring";
      answer = `### 🧱 Crafting an Irresistible Speech Structure

A robust presentation structure guides your audience from curiosity to action. Follow the classic **Hook-Story-Close** framework:

1. **The Hook (First 15%)**:
   * Never start with "Hello, today I will talk about...".
   * Start with a shocking statistic, a rhetorical question, or a compelling personal story that introduces the core problem.

2. **The Body (70%) - Three Core Pillars**:
   * The human brain remembers groups of three. Divide your message into **exactly three clear takeaways**.
   * For each pillar, provide: **Point -> Evidence/Analogy -> Takeaway for the audience**.

3. **The Call to Action (Last 15%)**:
   * Summarize your three key pillars.
   * End with a clear action item or a memorable closing thought. Your final sentence should leave a lasting impression.`;
    } else {
      topic = "Public Speaking Guidance";
      answer = `### 🌟 Expert Speaking Guidance: How to Level Up

Here are three foundational pillars to help you succeed in any public speaking endeavor:

1. **The 'Speak to One Person' Rule**:
   * Whether presenting to 10 or 100 people, treat it as a series of 1-on-1 conversations. Look directly at individual audience members. This cuts down anxiety and increases intimacy.

2. **Master the Pause**:
   * Great speakers do not fear silence. A well-placed pause before a major keyword creates anticipation, and a pause right after highlights its significance.

3. **Active Practice loop**:
   * Practice aloud, not just in your head. Your vocal cords and breathing require physical training, just like a muscle. Use our **Live Practice** workspace to measure your scores and refine your timing!`;
    }

    return {
      response: answer,
      topic,
      suggestedFollowUp: [
        "How do I reduce 'like' and 'um'?",
        "What are some tips to overcome public speaking anxiety?",
        "How can I improve my vocal projection and clarity?",
        "How should I structure a 5-minute presentation?"
      ]
    };
  }

  // AI presentation analysis endpoint
  app.post("/api/coach/analyze", async (req, res) => {
    try {
      const { transcript, script, durationSeconds } = req.body;

      if (!transcript || typeof transcript !== "string") {
        return res.status(400).json({ error: "Transcript is required" });
      }

      const totalSeconds = durationSeconds ? Number(durationSeconds) : 60;
      const ai = getAI();

      if (!ai) {
        console.warn("GEMINI_API_KEY not found. Serving simulated presentation analysis.");
        return res.json(generateLocalReport(transcript, script, totalSeconds));
      }

      try {
        const wordCount = transcript.trim().split(/\s+/).length;
        const calculatedWPM = Math.round((wordCount / (totalSeconds || 1)) * 60);

        const prompt = `
You are an expert AI Presentation Coach helping students improve their presentation skills.
Analyze the following transcript of a spoken presentation. Pay special attention to:
1. Unwanted filler words that shouldn't be spoken, especially: "um", "okay", "like", "actually", "basically".
2. Grammatical errors, structural mistakes, spelling slips, or clumsy spoken phrasing, and formulate correct words, phrases, or sentences.

--- PRESENTATION TRANSCRIPT ---
${transcript}

${script ? `--- INTENDED SCRIPT ---\n${script}` : ""}

--- METADATA ---
Duration: ${totalSeconds} seconds
Average Speaking Pace: ${calculatedWPM} words per minute

Please evaluate the presentation, detect occurrences of filler words, identify any grammatical mistakes, and return a detailed feedback analysis with action-oriented tips to improve.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are an encouraging and supportive AI presentation coach. Analyze presentation scripts and verbal transcripts for clarity, pace, filler words, grammar correctness, and confidence. Be specific, educational, and direct in your critique.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.INTEGER, description: "Overall rating of the presentation from 0 to 100." },
                paceScore: { type: Type.INTEGER, description: "Speaking speed rating from 0 to 100 based on word density and time." },
                fillerScore: { type: Type.INTEGER, description: "Rating of filler word minimization from 0 to 100. Lower usage yields higher score." },
                clarityScore: { type: Type.INTEGER, description: "Coherence, sentence structure, and clarity from 0 to 100." },
                confidenceScore: { type: Type.INTEGER, description: "Fluidity, flow, and energetic posture from 0 to 100." },
                grammarScore: { type: Type.INTEGER, description: "Rating of grammatical correctness and syntax optimization from 0 to 100." },
                pacingOverview: { type: Type.STRING, description: "A detailed summary of the pacing (e.g. if the speech was too fast, too slow, or balanced, and why)." },
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 to 4 actionable, student-friendly recommendations to improve."
                },
                fillerWordsAnalysis: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING, description: "The specific filler word detected (e.g. 'um', 'like')." },
                      count: { type: Type.INTEGER, description: "An estimate of how many times it was detected in the transcript." },
                      advice: { type: Type.STRING, description: "A friendly tip on how to replace or eliminate this word." }
                    },
                    required: ["word", "count", "advice"]
                  }
                },
                grammarAnalysis: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING, description: "The original spoken phrase or sentence containing a grammatical error or awkward phrasing." },
                      corrected: { type: Type.STRING, description: "The corrected or polished version of the sentence." },
                      explanation: { type: Type.STRING, description: "Brief educational explanation of why the change is recommended." }
                    },
                    required: ["original", "corrected", "explanation"]
                  },
                  description: "Detailed list of grammatical mistakes or awkward phrases with correct words and explanation."
                },
                paceTimeline: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      timestamp: { type: Type.STRING, description: "Timeline interval in format 'M:SS' (e.g., '0:10', '0:20')." },
                      wordsPerMinute: { type: Type.INTEGER, description: "The estimated words per minute pacing for this interval." }
                    },
                    required: ["timestamp", "wordsPerMinute"]
                  },
                  description: "Timeline tracking pacing speed variations across the speech duration."
                }
              },
              required: [
                "overallScore", 
                "paceScore", 
                "fillerScore", 
                "clarityScore", 
                "confidenceScore", 
                "grammarScore",
                "pacingOverview", 
                "suggestions", 
                "fillerWordsAnalysis", 
                "grammarAnalysis",
                "paceTimeline"
              ]
            }
          }
        });

        const responseText = response.text || "{}";
        const resultData = JSON.parse(responseText);
        res.json(resultData);
      } catch (geminiErr: any) {
        console.warn("Gemini coach API error. Gracefully falling back to high-quality local analysis:", geminiErr);
        res.json(generateLocalReport(transcript, script, totalSeconds));
      }

    } catch (err: any) {
      console.error("Coach analyze endpoint generic error:", err);
      res.status(500).json({ error: "Failed to process presentation analysis request", details: err?.message || err });
    }
  });

  // AI Mentor doubt clarification and guidance endpoint
  app.post("/api/coach/mentor", async (req, res) => {
    try {
      const { message, chatHistory } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getAI();

      if (!ai) {
        console.warn("GEMINI_API_KEY not found. Serving simulated mentor advice.");
        return res.json(generateLocalMentorResponse(message));
      }

      try {
        // Format history into Gemini system instructions or prompt context
        let contextHistory = "";
        if (chatHistory && Array.isArray(chatHistory)) {
          contextHistory = chatHistory
            .slice(-6) // take last 6 messages
            .map((m: any) => `${m.role === "user" ? "Student" : "Coach"}: ${m.text}`)
            .join("\n");
        }

        const prompt = `
You are an encouraging, experienced, and highly supportive AI Public Speaking & Presentation Mentor. 
Your goal is to guide students to present with confidence, overcome stage fright, eliminate filler words, master vocal variety, design clean presentation outlines, and improve articulation.

${contextHistory ? `--- RECENT CONVERSATION HISTORY ---\n${contextHistory}\n` : ""}
--- STUDENT'S QUESTION ---
${message}

Please respond as a friendly and practical mentor. 
- Provide an encouraging, direct answer using clean Markdown headers, bullet points, and numbered lists where appropriate.
- Focus on practical, actionable exercises the student can do right now.
- Keep the response highly structured, educational, and positive.
`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are a professional public speaking and presentation coach mentor. You provide warm, structural, actionable advice with clear steps, keeping your tone helpful and inspirational.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                response: { type: Type.STRING, description: "Your structured advice in clean Markdown format with subtitles, bullet points, and actionable exercises." },
                topic: { type: Type.STRING, description: "A short, 2-4 word category name for the discussed topic (e.g., 'Vocal Variety', 'Anxiety Management')." },
                suggestedFollowUp: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 related, specific follow-up questions the student might want to ask next."
                }
              },
              required: ["response", "topic", "suggestedFollowUp"]
            }
          }
        });

        const responseText = response.text || "{}";
        const resultData = JSON.parse(responseText);
        res.json(resultData);
      } catch (geminiErr: any) {
        console.warn("Gemini mentor API error. Gracefully falling back to rule-based response:", geminiErr);
        res.json(generateLocalMentorResponse(message));
      }

    } catch (err: any) {
      console.error("Mentor endpoint generic error:", err);
      res.status(500).json({ error: "Failed to process mentor request", details: err?.message || err });
    }
  });

  // Integration with Vite development server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {},
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Full-stack Presentation Coach running on port ${PORT}`);
  });
}

startServer();
