/**
 * Type definitions for pronunciation and response quality assessment
 */

export interface PronunciationAssessment {
  accuracyScore: number; // 0-100
  fluencyScore: number; // 0-100
  completenessScore: number; // 0-100
  overallScore: number; // Weighted average
  words: WordAssessment[];
  phonemes?: PhonemeAssessment[];
  suggestions: string[];
  transcription: string;
}

export interface WordAssessment {
  word: string;
  accuracyScore: number; // 0-100
  errorType?: 'Mispronunciation' | 'Omission' | 'Insertion';
  startTime?: number; // in seconds
  endTime?: number; // in seconds
  phonemes?: PhonemeAssessment[];
}

export interface PhonemeAssessment {
  phoneme: string;
  accuracyScore: number; // 0-100
  expectedPhoneme?: string;
  actualPhoneme?: string;
}

export interface ResponseQualityAssessment {
  grammarScore: number; // 0-100
  vocabularyScore: number; // 0-100
  fluencyScore: number; // 0-100
  completenessScore: number; // 0-100
  contextScore: number; // 0-100
  overallScore: number; // Weighted average
  corrections: GrammarCorrection[];
  suggestions: string[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  type: 'grammar' | 'vocabulary' | 'style';
}

export interface AssessmentRequest {
  audio: File | Blob;
  language: string; // 'es', 'en', 'fr', etc.
  referenceText?: string; // Optional: expected text for comparison
}

export interface AssessmentResponse {
  pronunciation?: PronunciationAssessment;
  quality?: ResponseQualityAssessment;
  error?: string;
  message?: string;
}
