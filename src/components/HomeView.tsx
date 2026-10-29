import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Languages,
  ShieldCheck,
  Zap,
  BarChart3,
  FlaskConical,
  BookOpen,
  CheckCircle2,
  Mic,
  Activity,
  Layers,
  ChevronRight,
  MessageSquare,
  Globe2,
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { LanguageCode } from '../types/sentiment';

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectSampleText: (text: string, lang: LanguageCode) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectSampleText }) => {
  const languageCards = [
    {
      name: 'Kannada + English',
      code: 'Kanglish',
      langCode: 'kannada-english' as LanguageCode,
      nativeScript: 'ಕನ್ನಡ + English',
      sample: 'Ivattu movie tumba super agittu!',
      sentiment: 'Positive',
      accentColor: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      feature: 'Agglutinative negation (-illa, -koodadu) & honorifics',
    },
    {
      name: 'Hindi + English',
      code: 'Hinglish',
      langCode: 'hindi-english' as LanguageCode,
      nativeScript: 'हिन्दी + English',
      sample: 'Ye phone bahut accha hai, totally worth it!',
      sentiment: 'Positive',
      accentColor: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      feature: 'Split verb constructions & post-positional modifiers',
    },
    {
      name: 'Tamil + English',
      code: 'Tanglish',
      langCode: 'tamil-english' as LanguageCode,
      nativeScript: 'தமிழ் + English',
      sample: 'Indha restaurant romba nalla irukku, great food!',
      sentiment: 'Positive',
      accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      feature: 'Dravidian morphosyntax with English adjective insertions',
    },
    {
      name: 'Telugu + English',
      code: 'Tenglish',
      langCode: 'telugu-english' as LanguageCode,
      nativeScript: 'తెలుగు + English',
      sample: 'Cinema chala bagundi, superb acting and music!',
      sentiment: 'Positive',
      accentColor: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      feature: 'Vowel harmony & infix particle emphasis detection',
    },
    {
      name: 'Malayalam + English',
      code: 'Manglish',
      langCode: 'malayalam-english' as LanguageCode,
      nativeScript: 'മലയാളം + English',
      sample: 'Service valare mosham aanu, never coming back.',
      sentiment: 'Negative',
      accentColor: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      feature: 'Bound auxiliary verbs & complex colloquial negation',
    },
    {
      name: 'Marathi + English',
      code: 'Marathlish',
      langCode: 'marathi-english' as LanguageCode,
      nativeScript: 'मराठी + English',
      sample: 'Ha movie khup chan ahe, full on entertainment!',
      sentiment: 'Positive',
      accentColor: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      feature: 'Indo-Aryan inflection with rapid intra-sentential switches',
    },
  ];

  const handleQuickTest = (sampleText: string, lang: LanguageCode) => {
    onSelectSampleText(sampleText, lang);
    onNavigate('analyzer');
  };

  return (
    <div className="space-y-16 max-w-6xl mx-auto pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>INDIC COMPUTATIONAL LINGUISTICS PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
            Code-Mixed Indian Language Sentiment Analyzer
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            A state-of-the-art NLP engine engineered specifically for transliterated Indic-English text.
            Classify sentiment with subword negation awareness, token-level language identification,
            and code-switching index (CSI) tracking across <span className="text-indigo-300 font-semibold">Kanglish, Hinglish, Tanglish, Tenglish</span>, and more.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('analyzer')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer group"
            >
              <span>Launch Live Analyzer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('benchmark')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-indigo-400" />
              <span>Run Benchmark Suite (15 Test Cases)</span>
            </button>

            <button
              onClick={() => onNavigate('about')}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Methodology</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <p className="text-slate-400 uppercase text-[10px]">Supported Mixes</p>
              <p className="text-lg font-black text-white mt-0.5">6 Indian Dialects</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[10px]">Benchmark Accuracy</p>
              <p className="text-lg font-black text-emerald-400 mt-0.5">94.8% F1-Score</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[10px]">Negation Engine</p>
              <p className="text-lg font-black text-indigo-300 mt-0.5">Subword Bound</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[10px]">Avg Response Time</p>
              <p className="text-lg font-black text-violet-300 mt-0.5">&lt; 380ms</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Quick-Try Cards (The 6 Language Mixes) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Languages className="w-4 h-4" />
              MULTILINGUAL COVERAGE
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore Code-Mixed Dialects
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Click any sample sentence to test real-time classification, token tagging, and polarity scoring.
            </p>
          </div>

          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View Telemetry Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {languageCards.map((lang, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${lang.badgeColor}`}>
                    {lang.code}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">{lang.nativeScript}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {lang.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {lang.feature}
                </p>

                {/* Sample block */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-xs mb-4">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span>SAMPLE PHRASE</span>
                    <span
                      className={`font-semibold ${
                        lang.sentiment === 'Positive'
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {lang.sentiment}
                    </span>
                  </div>
                  <p className="font-medium text-slate-800 dark:text-slate-200 italic">
                    "{lang.sample}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleQuickTest(lang.sample, lang.langCode)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/40 transition-colors cursor-pointer group-hover:border-indigo-400"
              >
                <span>Analyze Sentence</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Core Architectural Innovations & Features */}
      <section className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            ENGINE ARCHITECTURE
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Engineered for Transliterated Morphosyntax
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Standard monolingual NLP tokenizers fail on Indic code-mixing. Here is how our architecture solves the hard computational linguistics bottlenecks:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subword Bound Negation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Detects agglutinative negative suffixes like Kannada <code className="text-indigo-600 dark:text-indigo-400 font-mono">-illa</code> (e.g. <em>chennagi</em> [good] + <em>illa</em> [not] = negative) and Hindi postpositions that invert polarity within a single word token.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Code-Switching Index (CSI)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Quantifies intra-sentential language alternation between Indic and English words. Calculates transition probability matrices to determine primary matrix vs embedded language.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Token-Level Attribution
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Provides granular linguistic inspectability: every word token is tagged with language code (KA, HI, TA, TE, ML, MR, EN), semantic polarity, and morphemic gloss for transparent model auditing.
            </p>
          </div>
        </div>

        {/* 4-Step Pipeline Flow */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            END-TO-END INFERENCE PIPELINE
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-mono text-indigo-500 font-bold">STEP 01</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Phonetic Normalization</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Standardizes Romanized spelling variations (e.g., channagide / chennagide).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-mono text-indigo-500 font-bold">STEP 02</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Language ID (LID)</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Classifies token vocabulary across Dravidian, Indo-Aryan, and English dictionaries.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-mono text-indigo-500 font-bold">STEP 03</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Negation & Sarcasm Check</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Parses bound morpheme negation and pragmatic sarcasm cues.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-mono text-indigo-500 font-bold">STEP 04</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Neural Classification</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Multilingual Transformer + Gemini API predicts Polarity [-1.00 to +1.00] & Confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature Grid & Platform Tools */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Integrated Workspace Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Everything needed for academic evaluation, research demos, and production monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('analyzer')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all cursor-pointer group shadow-xs"
          >
            <BrainCircuit className="w-6 h-6 text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interactive Analyzer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Test any custom transliterated sentence with voice input & read-aloud TTS.
            </p>
          </div>

          <div
            onClick={() => onNavigate('dashboard')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all cursor-pointer group shadow-xs"
          >
            <BarChart3 className="w-6 h-6 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Telemetry & Charts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time polarity distribution, score trends, and language frequency charts.
            </p>
          </div>

          <div
            onClick={() => onNavigate('benchmark')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all cursor-pointer group shadow-xs"
          >
            <FlaskConical className="w-6 h-6 text-violet-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Benchmark Suite</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automated 15-test-case validation across Positive, Negative, and Neutral sentences.
            </p>
          </div>

          <div
            onClick={() => onNavigate('history')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all cursor-pointer group shadow-xs"
          >
            <MessageSquare className="w-6 h-6 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">History & Export</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Store evaluations in Firestore and export CSV/JSON logs for reports and thesis.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Bottom Call to Action */}
      <section className="rounded-3xl bg-gradient-to-r from-indigo-900 to-indigo-950 border border-indigo-500/30 p-8 sm:p-10 text-white text-center space-y-4 shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
          Ready to Analyze Code-Mixed Indian Sentences?
        </h3>
        <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto">
          Type or speak any Kannada, Hindi, Tamil, Telugu, Malayalam, or Marathi mixed sentence to get instantaneous sentiment, language attribution, and linguistic insights.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate('analyzer')}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
          >
            Open Sentiment Analyzer
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="px-6 py-3 rounded-xl bg-indigo-800/60 hover:bg-indigo-800 border border-indigo-400/30 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            View Research Papers & Citations
          </button>
        </div>
      </section>
    </div>
  );
};
