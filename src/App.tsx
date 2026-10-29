import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { AnalyzerView } from './components/AnalyzerView';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { BenchmarkView } from './components/BenchmarkView';
import { AboutView } from './components/AboutView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './components/Toast';
import { SentimentAnalysisResult, LanguageCode } from './types/sentiment';
import { getUserAnalyses, saveAnalysisResult } from './lib/firebase';

// Initial preloaded seed data for final-year project demonstration
const INITIAL_DEMO_DATA: SentimentAnalysisResult[] = [
  {
    id: 'demo_init_1',
    userId: 'guest_user',
    text: 'Ivattu movie tumba super agittu!',
    requestedLanguage: 'kannada-english',
    detectedLanguage: 'Kannada + English (Kanglish)',
    primaryLanguage: 'Kannada',
    codeMixedType: 'Kannada-English',
    sentiment: 'Positive',
    confidence: 0.96,
    score: 0.88,
    importantWords: ['tumba', 'super', 'agittu'],
    positiveWords: ['super'],
    negativeWords: [],
    neutralWords: ['ivattu', 'movie', 'tumba', 'agittu'],
    tokens: [
      { word: 'Ivattu', detectedLang: 'KA', polarity: 'neutral', score: 0.0, gloss: 'Today' },
      { word: 'movie', detectedLang: 'EN', polarity: 'neutral', score: 0.0, gloss: 'Movie/film' },
      { word: 'tumba', detectedLang: 'KA', polarity: 'neutral', score: 0.1, gloss: 'Very / A lot (amplifier)', isModifier: true },
      { word: 'super', detectedLang: 'EN', polarity: 'positive', score: 0.9, gloss: 'Superb / Excellent' },
      { word: 'agittu!', detectedLang: 'KA', polarity: 'neutral', score: 0.0, gloss: 'Was / Happened' },
    ],
    explanation: 'The sentence expresses strong positive satisfaction regarding a cinema experience using the Kannada amplifier "tumba" combined with the English positive adjective "super".',
    linguisticBreakdown: {
      codeSwitchingIndex: 0.75,
      subwordNegationDetected: false,
      sarcasmProbability: 0.02,
      transliterationConfidence: 0.96,
      sourceScript: 'Latin/Romanized',
    },
    createdAt: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 'demo_init_2',
    userId: 'guest_user',
    text: 'This product chennagilla, waste.',
    requestedLanguage: 'kannada-english',
    detectedLanguage: 'Kannada + English (Kanglish)',
    primaryLanguage: 'Kannada',
    codeMixedType: 'Kannada-English',
    sentiment: 'Negative',
    confidence: 0.95,
    score: -0.85,
    importantWords: ['chennagilla', 'waste'],
    positiveWords: [],
    negativeWords: ['chennagilla', 'waste'],
    neutralWords: ['this', 'product'],
    tokens: [
      { word: 'This', detectedLang: 'EN', polarity: 'neutral', score: 0.0, gloss: 'Demonstrative pronoun' },
      { word: 'product', detectedLang: 'EN', polarity: 'neutral', score: 0.0, gloss: 'Item' },
      { word: 'chennagilla,', detectedLang: 'KA', polarity: 'negative', score: -0.85, gloss: 'Is not good / Defective', isNegation: true },
      { word: 'waste.', detectedLang: 'EN', polarity: 'negative', score: -0.8, gloss: 'Worthless / Useless' },
    ],
    explanation: 'Contains the critical Kannada bound negation morpheme "chennagi" + "-illa" (not good) alongside the strong negative English descriptor "waste".',
    linguisticBreakdown: {
      codeSwitchingIndex: 0.67,
      subwordNegationDetected: true,
      sarcasmProbability: 0.05,
      transliterationConfidence: 0.94,
      sourceScript: 'Latin/Romanized',
    },
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: 'demo_init_3',
    userId: 'guest_user',
    text: 'Mujhe ye phone bahut accha laga',
    requestedLanguage: 'hindi-english',
    detectedLanguage: 'Hindi + English (Hinglish)',
    primaryLanguage: 'Hindi',
    codeMixedType: 'Hindi-English',
    sentiment: 'Positive',
    confidence: 0.94,
    score: 0.82,
    importantWords: ['bahut', 'accha'],
    positiveWords: ['accha'],
    negativeWords: [],
    neutralWords: ['mujhe', 'ye', 'phone', 'laga'],
    tokens: [
      { word: 'Mujhe', detectedLang: 'HI', polarity: 'neutral', score: 0.0, gloss: 'To me' },
      { word: 'ye', detectedLang: 'HI', polarity: 'neutral', score: 0.0, gloss: 'This' },
      { word: 'phone', detectedLang: 'EN', polarity: 'neutral', score: 0.0, gloss: 'Mobile device' },
      { word: 'bahut', detectedLang: 'HI', polarity: 'neutral', score: 0.1, gloss: 'Very (amplifier)', isModifier: true },
      { word: 'accha', detectedLang: 'HI', polarity: 'positive', score: 0.85, gloss: 'Good / Nice' },
      { word: 'laga', detectedLang: 'HI', polarity: 'neutral', score: 0.0, gloss: 'Felt / Seemed' },
    ],
    explanation: 'The user conveys direct consumer appreciation via the Hindi praise predicate "accha" modified by the intensifier "bahut".',
    linguisticBreakdown: {
      codeSwitchingIndex: 0.4,
      subwordNegationDetected: false,
      sarcasmProbability: 0.01,
      transliterationConfidence: 0.95,
      sourceScript: 'Latin/Romanized',
    },
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: 'demo_init_4',
    userId: 'guest_user',
    text: 'Service is bahut bad yaar',
    requestedLanguage: 'hindi-english',
    detectedLanguage: 'Hindi + English (Hinglish)',
    primaryLanguage: 'Hindi',
    codeMixedType: 'Hindi-English',
    sentiment: 'Negative',
    confidence: 0.93,
    score: -0.78,
    importantWords: ['bahut', 'bad', 'yaar'],
    positiveWords: [],
    negativeWords: ['bad'],
    neutralWords: ['service', 'is', 'bahut', 'yaar'],
    tokens: [
      { word: 'Service', detectedLang: 'EN', polarity: 'neutral', score: 0.0, gloss: 'Customer service' },
      { word: 'is', detectedLang: 'EN', polarity: 'neutral', score: 0.0, gloss: 'Copula' },
      { word: 'bahut', detectedLang: 'HI', polarity: 'neutral', score: -0.1, gloss: 'Very', isModifier: true },
      { word: 'bad', detectedLang: 'EN', polarity: 'negative', score: -0.8, gloss: 'Unsatisfactory' },
      { word: 'yaar', detectedLang: 'HI', polarity: 'neutral', score: 0.0, gloss: 'Friend (discourse marker)' },
    ],
    explanation: 'Inter-sentential code-switching with the negative English evaluation "bad" amplified by the Hindi intensifier "bahut".',
    linguisticBreakdown: {
      codeSwitchingIndex: 0.75,
      subwordNegationDetected: false,
      sarcasmProbability: 0.08,
      transliterationConfidence: 0.93,
      sourceScript: 'Latin/Romanized',
    },
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'demo_init_5',
    userId: 'guest_user',
    text: 'Food okay ide, nothing special.',
    requestedLanguage: 'kannada-english',
    detectedLanguage: 'Kannada + English (Kanglish)',
    primaryLanguage: 'Kannada',
    codeMixedType: 'Kannada-English',
    sentiment: 'Neutral',
    confidence: 0.86,
    score: 0.05,
    importantWords: ['okay', 'special'],
    positiveWords: [],
    negativeWords: [],
    neutralWords: ['food', 'okay', 'ide', 'nothing', 'special'],
    tokens: [
      { word: 'Food', detectedLang: 'EN', polarity: 'neutral', score: 0.0, gloss: 'Meal' },
      { word: 'okay', detectedLang: 'EN', polarity: 'neutral', score: 0.05, gloss: 'Acceptable' },
      { word: 'ide,', detectedLang: 'KA', polarity: 'neutral', score: 0.0, gloss: 'Is there / Exists' },
      { word: 'nothing', detectedLang: 'EN', polarity: 'neutral', score: -0.05, gloss: 'Null' },
      { word: 'special.', detectedLang: 'EN', polarity: 'neutral', score: 0.05, gloss: 'Extraordinary' },
    ],
    explanation: 'The sentence exhibits balanced, neutral feedback ("okay ide", "nothing special") indicating an average experience.',
    linguisticBreakdown: {
      codeSwitchingIndex: 0.5,
      subwordNegationDetected: false,
      sarcasmProbability: 0.03,
      transliterationConfidence: 0.92,
      sourceScript: 'Latin/Romanized',
    },
    createdAt: Date.now() - 1000 * 60 * 10,
  },
];

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [analyses, setAnalyses] = useState<SentimentAnalysisResult[]>([]);
  const [selectedTextToAnalyze, setSelectedTextToAnalyze] = useState('');
  const [selectedLanguageToAnalyze, setSelectedLanguageToAnalyze] = useState<LanguageCode>('auto');
  const [loadingHistory, setLoadingHistory] = useState(true);

  const { user } = useAuth();
  const { showToast } = useToast();

  // Load User Analyses from Firebase Firestore & Local Seed
  const loadUserHistory = async () => {
    try {
      const userId = user?.uid || 'guest_user';
      const list = await getUserAnalyses(userId);

      if (list && list.length > 0) {
        setAnalyses(list);
      } else {
        // If empty, initialize with research demo seed data
        setAnalyses(INITIAL_DEMO_DATA);
        INITIAL_DEMO_DATA.forEach((item) => saveAnalysisResult(item, user));
      }
    } catch (err) {
      console.warn('History load error:', err);
      setAnalyses(INITIAL_DEMO_DATA);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadUserHistory();
  }, [user]);

  const handleAnalysisComplete = (newResult: SentimentAnalysisResult) => {
    setAnalyses((prev) => [newResult, ...prev.filter((item) => item.id !== newResult.id)]);
  };

  const handleSelectAnalysis = (analysis: SentimentAnalysisResult) => {
    setSelectedTextToAnalyze(analysis.text);
    setSelectedLanguageToAnalyze(analysis.requestedLanguage);
    setActiveTab('analyzer');
    showToast('Loaded into Analyzer', `Viewing analysis for: "${analysis.text}"`);
  };

  const handleSelectSampleFromHome = (sampleText: string, lang: LanguageCode) => {
    setSelectedTextToAnalyze(sampleText);
    setSelectedLanguageToAnalyze(lang);
    setActiveTab('analyzer');
    showToast('Sample Loaded', `Ready to test ${lang}: "${sampleText}"`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectSampleText={handleSelectSampleFromHome}
          />
        )}

        {activeTab === 'analyzer' && (
          <AnalyzerView
            onAnalysisComplete={handleAnalysisComplete}
            initialText={selectedTextToAnalyze}
            initialLanguage={selectedLanguageToAnalyze}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            analyses={analyses}
            onSelectAnalysis={handleSelectAnalysis}
            onNavigateToAnalyzer={() => {
              setSelectedTextToAnalyze('');
              setSelectedLanguageToAnalyze('auto');
              setActiveTab('analyzer');
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            analyses={analyses}
            onSelectAnalysis={handleSelectAnalysis}
            onRefreshHistory={loadUserHistory}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView analyses={analyses} />}

        {activeTab === 'benchmark' && <BenchmarkView />}

        {activeTab === 'about' && <AboutView />}

        {activeTab === 'profile' && <ProfileView totalAnalysesCount={analyses.length} />}
      </main>

      {/* Immersive System Status Bar Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md py-3 px-4 sm:px-6 shrink-0 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ONLINE
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden sm:inline">Engine: Multilingual Gemini NLP v2.4</span>
            <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden md:inline">Latency: ~140ms</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 font-medium">
              Firestore Cloud Active
            </span>
            <span>KA • HI • TA • TE • ML • MR</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
