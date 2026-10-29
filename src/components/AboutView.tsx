import React from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  Network,
  GitBranch,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Code2,
  Workflow,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-8 text-white border border-indigo-800/40 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
          <BookOpen className="w-3.5 h-3.5" />
          Academic & Research Documentation
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Code-Mixed Indian Language Sentiment Analysis System
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed max-w-3xl">
          An AI-powered Computational Linguistics and Natural Language Processing architecture tailored for Dravidian and Indo-Aryan code-switched texts transliterated in Latin (Romanized) script.
        </p>
      </div>

      {/* 1. Problem Statement & Motivation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
          <Cpu className="w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Problem Statement & Linguistic Challenges
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Over 600 million multilingual social media and e-commerce users in India communicate in <strong>code-mixed dialects</strong> (e.g. Kanglish, Hinglish, Tanglish, Tenglish, Manglish, Marathlish). Conventional English or monolingual Indic NLP models fail significantly on such inputs due to five major linguistic bottlenecks:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              A. Phonetic & Orthographic Variations
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Absence of standard spelling rules in Latin script (e.g. <em>"chennagide"</em> vs <em>"channagide"</em> vs <em>"cennagide"</em> in Kannada; <em>"bahut"</em> vs <em>"bohot"</em> in Hindi).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              B. Subword Negation Binding
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Dravidian agglutinative suffixes flip polarity within a single word (e.g., <em>"chennagi"</em> [Good] + <em>"-illa"</em> [Not] = <em>"chennagilla"</em> [Negative / Defective]).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              C. Intra-Sentential Code-Switching
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Grammatical matrix framing transitions across phrases (e.g. <em>"This product chennagilla, total waste."</em> switches from English to Kannada to English).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              D. Amplifiers & Discourse Particles
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Colloquial modifiers (<em>"tumba"</em>, <em>"bahut"</em>, <em>"romba"</em>, <em>"chala"</em>, <em>"khup"</em>, <em>"adipoli"</em>) dramatically heighten semantic polarity.
            </p>
          </div>
        </div>
      </div>

      {/* 2. System Architecture Flow */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
          <Workflow className="w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Multi-Stage NLP Pipeline Architecture
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              01
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Preprocessing & Tokenization
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Raw code-mixed text undergoes whitespace/punctuation normalization, emoji parsing, and subword token decomposition.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              02
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Token-Level Language Identification (LID)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Assigns language tags (<code>EN</code>, <code>KA</code>, <code>HI</code>, <code>TA</code>, <code>TE</code>, <code>ML</code>, <code>MR</code>) to each word token and computes Code-Switching Index (CSI).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              03
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Semantic Attentive Classification & Polarity Scoring
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Evaluates contextual sentiment representations via Gemini LLM with structured output schema, yielding discrete classification (Positive/Negative/Neutral) and continuous score [-1.0 to +1.0].
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              04
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Firebase Firestore Real-Time Persistence
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Synchronizes user analysis records to Cloud Firestore with user authentication boundaries and local offline backup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tech Stack Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          3. Technical Stack & Implementation Details
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 block font-medium">Frontend</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
              React 19 + TypeScript
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 block font-medium">Styling & UI</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
              Tailwind CSS v4 + Motion
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 block font-medium">Backend & API</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
              Express + Node.js
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 block font-medium">Database & Auth</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
              Cloud Firestore + Auth
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
