import { FeedbackReport } from "../types";

export const DEFAULT_SESSIONS: FeedbackReport[] = [
  {
    id: "session-1",
    date: "2026-07-03",
    title: "History Term Paper - Dry Run",
    overallScore: 64,
    paceScore: 55,
    fillerScore: 50,
    clarityScore: 72,
    confidenceScore: 79,
    durationSeconds: 120,
    wordCount: 360,
    transcript: "So, basically, um, the French Revolution was started in, like, 1789, and it was, you know, super crazy because of the, uh, social inequality. Basically, the commoners, uh, were starving, like, so bad while the nobility lived in crazy luxury. Um, so they got super angry and storm- stormed the Bastille, which was, you know, this giant prison. It was like, yeah, a symbol of royal tyranny. So, basically, yeah, that is how it kicked off, and then everything changed completely.",
    pacingOverview: "Your speaking speed was around 180 words per minute. This is significantly faster than the recommended educational range (120-150 WPM). Speaking too quickly makes it difficult for your classmates and teachers to absorb the dense historical arguments you are making.",
    suggestions: [
      "Incorporate silent 2-second transitions between your introduction, main arguments, and conclusion.",
      "Vocalize ending consonants like 't' in 'Bastille' and 'd' in 'started' to naturally slow down your articulation.",
      "Write visual indicators like '[BREATH]' in bold red on your index cards or slides as physical reminders to pause."
    ],
    fillerWordsAnalysis: [
      { word: "basically", count: 4, advice: "Used as a conversational filler. Replace with 'Essentially' or simply start the sentence directly without it." },
      { word: "so", count: 3, advice: "A connective crutch. Stop the sentence with a period, pause, and start the next point fresh." },
      { word: "um", count: 4, advice: "Occurs when searching for the next historical date. Silence is more commanding than a nasal sound." },
      { word: "like", count: 4, advice: "Slightly informal. Slow down to express descriptions with precise adjectives." },
      { word: "you know", count: 2, advice: "This asks the audience to fill in the blank. Trust your authority and state the facts directly." }
    ],
    paceTimeline: [
      { timestamp: "0:10", wordsPerMinute: 165 },
      { timestamp: "0:20", wordsPerMinute: 180 },
      { timestamp: "0:30", wordsPerMinute: 195 },
      { timestamp: "0:40", wordsPerMinute: 190 },
      { timestamp: "0:50", wordsPerMinute: 175 },
      { timestamp: "1:00", wordsPerMinute: 185 },
      { timestamp: "1:10", wordsPerMinute: 170 },
      { timestamp: "1:20", wordsPerMinute: 180 }
    ]
  },
  {
    id: "session-2",
    date: "2026-07-04",
    title: "Biology Presentation - Practice 1",
    overallScore: 78,
    paceScore: 82,
    fillerScore: 70,
    clarityScore: 78,
    confidenceScore: 84,
    durationSeconds: 90,
    wordCount: 215,
    transcript: "Today, we are going to explore the cell structure. Um, cells are the basic, like, functional building blocks of all living organisms. There are two main types: prokaryotic and eukaryotic. Eukaryotic cells, um, have a true nucleus, you know, which contains their DNA. In contrast, prokaryotics don't have that membrane-bound nucleus. So, basically, organelles like the mitochondria generate energy, which is, uh, extremely vital for cell survival.",
    pacingOverview: "Your overall speaking pace was 143 words per minute. This is excellent! It falls perfectly into the ideal classroom presentation range of 120-150 WPM, allowing the scientific definitions to sink in clearly.",
    suggestions: [
      "Your speed is excellent, but you are still relying on filler words like 'um' when transitioning between cell types.",
      "Take advantage of slides displaying diagrams of mitochondria to naturally pause and point, resting your voice for a brief second."
    ],
    fillerWordsAnalysis: [
      { word: "um", count: 3, advice: "Mainly occurs when switching from general definitions to technical biological terms." },
      { word: "like", count: 1, advice: "Minor usage, but remember that scientific explanations benefit from crisp, objective delivery." },
      { word: "you know", count: 1, advice: "Avoid conversational tags. Explain eukaryotic features confidently as a subject matter expert." }
    ],
    paceTimeline: [
      { timestamp: "0:10", wordsPerMinute: 135 },
      { timestamp: "0:20", wordsPerMinute: 148 },
      { timestamp: "0:30", wordsPerMinute: 140 },
      { timestamp: "0:40", wordsPerMinute: 145 },
      { timestamp: "0:50", wordsPerMinute: 152 },
      { timestamp: "1:00", wordsPerMinute: 138 },
      { timestamp: "1:10", wordsPerMinute: 142 },
      { timestamp: "1:20", wordsPerMinute: 145 },
      { timestamp: "1:30", wordsPerMinute: 143 }
    ]
  },
  {
    id: "session-3",
    date: "2026-07-05",
    title: "Biology Presentation - Final Run",
    overallScore: 92,
    paceScore: 94,
    fillerScore: 90,
    clarityScore: 91,
    confidenceScore: 93,
    durationSeconds: 105,
    wordCount: 232,
    transcript: "Welcome everyone. Today we are going to talk about eukaryotic and prokaryotic cells. Eukaryotic cells possess a membrane-bound nucleus housing genetic material, along with specialized organelles like mitochondria that act as cellular powerhouses. In contrast, prokaryotic cells are simpler, single-celled organisms lacking a defined nucleus. By understanding these structural differences, we can better grasp the cellular complexity that supports multicellular life. Thank you.",
    pacingOverview: "A masterclass in pacing! Averaging 132 words per minute, your speed allowed for high comprehension. The natural cadence, rhythmic structure, and professional posture were outstanding.",
    suggestions: [
      "Excellent eye contact simulation and natural phrasing. Continue this exact style.",
      "For public stage speaking, consider projecting your voice slightly more at key terms like 'cellular complexity' for theatrical emphasis."
    ],
    fillerWordsAnalysis: [
      { word: "like", count: 1, advice: "Used as a true comparator here rather than a speech filler, which is perfectly appropriate." }
    ],
    paceTimeline: [
      { timestamp: "0:10", wordsPerMinute: 128 },
      { timestamp: "0:20", wordsPerMinute: 132 },
      { timestamp: "0:30", wordsPerMinute: 135 },
      { timestamp: "0:40", wordsPerMinute: 130 },
      { timestamp: "0:50", wordsPerMinute: 134 },
      { timestamp: "1:00", wordsPerMinute: 129 },
      { timestamp: "1:10", wordsPerMinute: 131 },
      { timestamp: "1:20", wordsPerMinute: 135 },
      { timestamp: "1:30", wordsPerMinute: 132 },
      { timestamp: "1:40", wordsPerMinute: 133 },
      { timestamp: "1:45", wordsPerMinute: 132 }
    ]
  }
];
