/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FillerWordEstimate {
  word: string;
  count: number;
  advice: string;
}

export interface PaceDataPoint {
  timestamp: string;
  wordsPerMinute: number;
}

export interface GrammarMistake {
  original: string;
  corrected: string;
  explanation: string;
}

export interface FeedbackReport {
  id: string;
  date: string;
  title: string;
  overallScore: number;
  paceScore: number;
  fillerScore: number;
  clarityScore: number;
  confidenceScore: number;
  grammarScore?: number;
  grammarAnalysis?: GrammarMistake[];
  pacingOverview: string;
  suggestions: string[];
  fillerWordsAnalysis: FillerWordEstimate[];
  paceTimeline: PaceDataPoint[];
  durationSeconds: number;
  wordCount: number;
  transcript: string;
  script?: string;
}
