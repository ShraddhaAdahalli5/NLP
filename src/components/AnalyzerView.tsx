import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  Mic,
  MicOff,
  Volume2,
  BookmarkCheck,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  HelpCircle,
  Share2,
  Tag,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LanguageCode, SentimentAnalysisResult, TokenAnalysis } from '../types/sentiment';
import { analyzeSentimentApi } from '../services/sentimentService';
import { saveAnalysisResult } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface AnalyzerViewProps {
  onAnalysisComplete?: (result: SentimentAnalysisResult) => void;
  initialText?: string;
  initialLanguage?: LanguageCode;
}

const SAMPLE_INPUTS = [
  {
    category: 'Kannada + English (Kanglish)',
    samples: [
      { text: 'Ivattu movie tumba super agittu!', lang: 'kannada-english' as LanguageCode, label: 'Super Movie' },
      { text: 'This product chennagilla, waste.', lang: 'kannada-english' as LanguageCode, label: 'Defective Product' },
      { text: 'Food okay ide, nothing special.', lang: 'kannada-english' as LanguageCode, label: 'Average Dinner' },
    ],
  },
  {
    category: 'Hindi + English (Hinglish)',
    samples: [
      { text: 'Mujhe ye phone bahut accha laga', lang: 'hindi-english' as LanguageCode, label: 'Phone Review' },
      { text: 'Service is bahut bad yaar', lang: 'hindi-english' as LanguageCode, label: 'Bad Service' },
      { text: 'Laptop delivery kal subah tak aa jayegi.', lang: 'hindi-english' as LanguageCode, label: 'Neutral Delivery' },
    ],
  },
  {
    category: 'Tamil, Telugu, Malayalam & Marathi',
    samples: [
      { text: 'Indha padam romba super ah irukku!', lang: 'tamil-english' as LanguageCode, label: 'Tanglish Hit' },
      { text: 'Ee cinema chala bagundi, actors performance next level!', lang: 'telugu-english' as LanguageCode, label: 'Tenglish Review' },
      { text: 'Ee film adipoli aayirunnu, total entertainment!', lang: 'malayalam-english' as LanguageCode, label: 'Manglish Praise' },
      { text: 'Ha picture khup sundar ahe, story lay bhari hoti!', lang: 'marathi-english' as LanguageCode, label: 'Marathlish Praise' },
      { text: 'Worst experience asalu nachaledu, waste of money.', lang: 'telugu-english' as LanguageCode, label: 'Tenglish Negative' },
    ],
  },
];

const LANGUAGE_OPTIONS: { value: LanguageCode; label: string; badge: string }[] = [
  { value: 'auto', label: 'Auto Detect (Any Indic + English)', badge: 'Smart' },
  { value: 'kannada-english', label: 'Kannada-English (Kanglish)', badge: 'KA+EN' },
  { value: 'hindi-english', label: 'Hindi-English (Hinglish)', badge: 'HI+EN' },
  { value: 'tamil-english', label: 'Tamil-English (Tanglish)', badge: 'TA+EN' },
  { value: 'telugu-english', label: 'Telugu-English (Tenglish)', badge: 'TE+EN' },
  { value: 'malayalam-english', label: 'Malayalam-English (Manglish)', badge: 'ML+EN' },
  { value: 'marathi-english', label: 'Marathi-English (Marathlish)', badge: 'MR+EN' },
];

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({
  onAnalysisComplete,
  initialText = '',
  initialLanguage = 'auto',
}) => {
  const [text, setText] = useState(initialText);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(initialLanguage);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SentimentAnalysisResult | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (initialLanguage) {
      setSelectedLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  // Voice Input Setup
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Microphone Unavailable', 'Web Speech API is not supported in this browser.', 'error');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian accent/English mix optimization

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening...', 'Speak your code-mixed sentence clearly.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        showToast('Speech Recognized', 'Audio transcribed into input box.');
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        showToast('Audio Input Error', event.error, 'error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      showToast('Audio Error', e.message, 'error');
    }
  };

  const handleAnalyze = async (overrideText?: string, overrideLang?: LanguageCode) => {
    const textToAnalyze = overrideText || text;
    const langToUse = overrideLang || selectedLanguage;

    if (!textToAnalyze.trim()) {
      showToast('Input Required', 'Please enter or select a code-mixed sentence to analyze.', 'error');
      return;
    }

    setAnalyzing(true);
    setSelectedToken(null);

    try {
      const analysisResult = await analyzeSentimentApi(textToAnalyze, langToUse);
      setResult(analysisResult);

      // Persist to Firebase Firestore & local state
      await saveAnalysisResult(analysisResult, user);

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }

      showToast(
        'Analysis Complete',
        `Predicted ${analysisResult.sentiment} with ${(analysisResult.confidence * 100).toFixed(0)}% confidence.`
      );

      // Confetti burst for strongly positive sentiment
      if (analysisResult.sentiment === 'Positive' && analysisResult.score > 0.6) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10B981', '#6366F1', '#F59E0B'],
          });
        } catch {
          // ignore if canvas unavailable
        }
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      showToast('Analysis Failed', 'Could not complete NLP analysis. Please retry.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectSample = (sampleText: string, sampleLang: LanguageCode) => {
    setText(sampleText);
    setSelectedLanguage(sampleLang);
    handleAnalyze(sampleText, sampleLang);
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setSelectedToken(null);
  };

  const handleCopy = () => {
    if (!result) return;
    const summary = `Code-Mixed Sentiment Analysis Result:
Text: "${result.text}"
Detected Language: ${result.detectedLanguage}
Sentiment: ${result.sentiment} (${(result.confidence * 100).toFixed(1)}% Confidence, Score: ${result.score.toFixed(2)})
Key Sentiment Words: ${result.importantWords.join(', ')}
Explanation: ${result.explanation}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    showToast('Copied to Clipboard', 'Analysis summary copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadAloud = (speechText: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('TTS Unsupported', 'Speech synthesis is not supported in this browser.', 'error');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-semibold mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            BHARTIYA CODE-MIXED NLP ENGINE v2.4
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Code-Mixed Sentiment Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Multi-lingual transliterated sentiment classification with subword bound morpheme negation, code-switching index, and token-level language attribution.
          </p>

          <div className="flex flex-wrap gap-2 mt-4 text-[11px] font-mono text-slate-300">
            <span className="px-2.5 py-1 bg-slate-900/60 rounded-lg border border-slate-700/60">Kannada-EN (Kanglish)</span>
            <span className="px-2.5 py-1 bg-slate-900/60 rounded-lg border border-slate-700/60">Hindi-EN (Hinglish)</span>
            <span className="px-2.5 py-1 bg-slate-900/60 rounded-lg border border-slate-700/60">Tamil-EN (Tanglish)</span>
            <span className="px-2.5 py-1 bg-slate-900/60 rounded-lg border border-slate-700/60">Telugu-EN (Tenglish)</span>
            <span className="px-2.5 py-1 bg-slate-900/60 rounded-lg border border-slate-700/60">Malayalam & Marathi</span>
          </div>
        </div>
      </div>

      {/* Main Analyzer Input Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl transition-all">
        {/* Language Selection & Mode Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-0.5">
              Select Language Mix
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Specify the target pair or let the model auto-detect Indic-English mixing.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-xs"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                handleAnalyze();
              }
            }}
            placeholder="Type or paste code-mixed sentence here (e.g. 'Ivattu movie tumba super agittu!' or 'Mujhe ye phone bahut accha laga' or 'This product chennagilla, waste')..."
            rows={4}
            className="w-full p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base leading-relaxed resize-y font-normal transition-all"
          />

          <div className="flex items-center justify-between mt-2 px-1 text-xs text-slate-400 font-mono">
            <span>{text.length} chars • {text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
            <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-mono">Enter</kbd> to analyze</span>
          </div>
        </div>

        {/* Controls and Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceInput}
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
              title="Speak code-mixed sentence"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
              <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
            </button>

            {text && (
              <button
                onClick={handleClear}
                type="button"
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={analyzing || !text.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Semantics...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Analyze Sentiment</span>
              </>
            )}
          </button>
        </div>

        {/* Example Input Suggestions */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Benchmark Sentences (Click to load & test):</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_INPUTS.map((group, gIdx) => (
              <div key={gIdx} className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  {group.category}
                </p>
                <div className="flex flex-col gap-1.5">
                  {group.samples.map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSelectSample(sample.text, sample.lang)}
                      className="text-left text-xs p-2 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 text-slate-700 dark:text-slate-200 transition-all truncate group"
                      title={sample.text}
                    >
                      <span className="font-semibold text-[10px] text-slate-400 block group-hover:text-indigo-400">
                        {sample.label}:
                      </span>
                      <span className="truncate italic">"{sample.text}"</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Result Card (Immersive UI Layout) */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-900 border-2 border-indigo-500/20 dark:border-indigo-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Top Bar / Header of Result */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                  PREDICTED POLARITY
                </span>
                <div className="flex items-center gap-4 mt-2">
                  <span
                    className={`text-3xl sm:text-5xl font-black uppercase tracking-tight italic ${
                      result.sentiment === 'Positive'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : result.sentiment === 'Negative'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {result.sentiment}
                  </span>

                  <div className="flex flex-col gap-1">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                      {result.detectedLanguage}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      CONFIDENCE: {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReadAloud(result.text)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors"
                  title="Listen to input sentence"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Neural Diagnostics Visualizer Strip */}
            <div className="my-5 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-end gap-1 h-6">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" />
                  <span className="w-1 h-5 bg-indigo-400 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-6 bg-indigo-600 rounded-full animate-pulse delay-150" />
                  <span className="w-1 h-4 bg-indigo-400 rounded-full animate-pulse delay-100" />
                  <span className="w-1 h-5 bg-indigo-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Transliteration & Code-Switching Attribution
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Confidence: {(result.linguisticBreakdown.transliterationConfidence * 100).toFixed(0)}% • Script: {result.linguisticBreakdown.sourceScript}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">CSI Metric</span>
                  <p className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {(result.linguisticBreakdown.codeSwitchingIndex * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">CONFIDENCE</span>
                <p className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  {(result.confidence * 100).toFixed(0)}%
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">POLARITY SCORE</span>
                <p className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  {result.score > 0 ? `+${result.score.toFixed(2)}` : result.score.toFixed(2)}
                </p>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">[-1.00 to +1.00]</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">CODE SWITCHING</span>
                <p className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  {(result.linguisticBreakdown.codeSwitchingIndex * 100).toFixed(0)}%
                </p>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">Transition rate</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">NEGATION / SARCASM</span>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                  {result.linguisticBreakdown.subwordNegationDetected ? '⚠️ Negation Detected' : 'Normal Polarity'}
                </p>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Sarcasm: {(result.linguisticBreakdown.sarcasmProbability * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Explanation Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-indigo-50/40 dark:bg-slate-950/60 border border-indigo-100 dark:border-slate-800 mb-5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider font-mono">
                    Model Reasoning & Linguistic Attributions
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Code-Switching Token Matrix */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                    Token Sentiment & Language Attribution
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Click on any token for morpho-syntactic gloss
                </span>
              </div>

              {/* Tokens Ribbon */}
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800">
                {result.tokens.map((token, idx) => {
                  const isSelected = selectedToken?.word === token.word;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedToken(token)}
                      className={`group relative px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all text-left flex items-center gap-1.5 ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 scale-105 shadow-md'
                          : 'hover:scale-102'
                      } ${
                        token.polarity === 'positive'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                          : token.polarity === 'negative'
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/80 text-rose-800 dark:text-rose-300'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span>{token.word}</span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-slate-500 dark:text-slate-400">
                        {token.detectedLang}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Token Detail Card (if clicked) */}
              {selectedToken && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Token: <span className="font-mono text-indigo-600 dark:text-indigo-400">"{selectedToken.word}"</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold font-mono">
                      LANG: {selectedToken.detectedLang}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-slate-600 dark:text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-400">Polarity: </span>
                      <span className="font-semibold capitalize">{selectedToken.polarity} ({selectedToken.score > 0 ? `+${selectedToken.score}` : selectedToken.score})</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 font-sans">Meaning / Gloss: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100 font-sans">{selectedToken.gloss || 'Standard token'}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Important Words Pills */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Key Polar Triggers
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.positiveWords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mr-1">Positive:</span>
                    {result.positiveWords.map((w, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
                      >
                        + {w}
                      </span>
                    ))}
                  </div>
                )}

                {result.negativeWords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 ml-0 sm:ml-4">
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold mr-1">Negative:</span>
                    {result.negativeWords.map((w, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-rose-100/70 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800"
                      >
                        - {w}
                      </span>
                    ))}
                  </div>
                )}

                {result.positiveWords.length === 0 && result.negativeWords.length === 0 && (
                  <span className="text-xs text-slate-500 italic">No strong polar terms detected; text is balanced/neutral.</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
