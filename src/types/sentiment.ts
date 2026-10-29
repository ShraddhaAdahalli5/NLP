export type SentimentType = 'Positive' | 'Negative' | 'Neutral';

export type LanguageCode =
  | 'auto'
  | 'kannada-english'
  | 'hindi-english'
  | 'tamil-english'
  | 'telugu-english'
  | 'malayalam-english'
  | 'marathi-english';

export type TokenLanguageTag = 'EN' | 'KA' | 'HI' | 'TA' | 'TE' | 'ML' | 'MR' | 'O';

export interface TokenAnalysis {
  word: string;
  detectedLang: TokenLanguageTag;
  polarity: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  gloss?: string; // Meaning or English translation
  isModifier?: boolean;
  isNegation?: boolean;
}

export interface LinguisticBreakdown {
  codeSwitchingIndex: number; // 0.0 - 1.0 (ratio of cross-language transitions)
  subwordNegationDetected: boolean;
  sarcasmProbability: number;
  transliterationConfidence: number;
  sourceScript: 'Latin/Romanized' | 'Native' | 'Mixed';
}

export interface SentimentAnalysisResult {
  id: string;
  userId?: string;
  text: string;
  requestedLanguage: LanguageCode;
  detectedLanguage: string; // e.g., "Kannada + English (Kanglish)"
  primaryLanguage: string;
  codeMixedType: string;
  sentiment: SentimentType;
  confidence: number; // 0.0 - 1.0
  score: number; // -1.0 to +1.0
  importantWords: string[];
  positiveWords: string[];
  negativeWords: string[];
  neutralWords: string[];
  tokens: TokenAnalysis[];
  explanation: string;
  linguisticBreakdown: LinguisticBreakdown;
  createdAt: number; // Epoch timestamp
}

export interface UserStats {
  totalAnalyses: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  averageScore: number;
  mostFrequentLanguage: string;
  languageCounts: Record<string, number>;
}

export interface BenchmarkItem {
  id: string;
  text: string;
  language: string;
  expectedSentiment: SentimentType;
  actualSentiment?: SentimentType;
  confidence?: number;
  score?: number;
  explanation?: string;
  status?: 'pending' | 'correct' | 'incorrect' | 'running';
}

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  collegeName?: string;
  projectRole?: string;
  bio?: string;
  createdAt?: number;
}
