import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle,
  Activity,
  Languages,
} from 'lucide-react';
import { SentimentAnalysisResult } from '../types/sentiment';

interface DashboardViewProps {
  analyses: SentimentAnalysisResult[];
  onSelectAnalysis: (analysis: SentimentAnalysisResult) => void;
  onNavigateToAnalyzer: () => void;
}

const COLORS = {
  Positive: '#10B981', // emerald-500
  Negative: '#F43F5E', // rose-500
  Neutral: '#F59E0B', // amber-500
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  analyses,
  onSelectAnalysis,
  onNavigateToAnalyzer,
}) => {
  const total = analyses.length;
  const positiveCount = analyses.filter((a) => a.sentiment === 'Positive').length;
  const negativeCount = analyses.filter((a) => a.sentiment === 'Negative').length;
  const neutralCount = analyses.filter((a) => a.sentiment === 'Neutral').length;

  const positivePercent = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
  const negativePercent = total > 0 ? Math.round((negativeCount / total) * 100) : 0;
  const neutralPercent = total > 0 ? Math.round((neutralCount / total) * 100) : 0;

  // Most frequent language
  const langCountMap: Record<string, number> = {};
  analyses.forEach((a) => {
    const lang = a.primaryLanguage || a.detectedLanguage.split(' ')[0] || 'Unknown';
    langCountMap[lang] = (langCountMap[lang] || 0) + 1;
  });

  let topLang = 'None';
  let maxLangCount = 0;
  Object.entries(langCountMap).forEach(([lang, count]) => {
    if (count > maxLangCount) {
      maxLangCount = count;
      topLang = lang;
    }
  });

  // Average sentiment score
  const avgScore =
    total > 0
      ? (analyses.reduce((acc, curr) => acc + curr.score, 0) / total).toFixed(2)
      : '0.00';

  // Sentiment Distribution Chart Data
  const sentimentPieData = [
    { name: 'Positive', value: positiveCount, color: COLORS.Positive },
    { name: 'Negative', value: negativeCount, color: COLORS.Negative },
    { name: 'Neutral', value: neutralCount, color: COLORS.Neutral },
  ].filter((d) => d.value > 0);

  // Fallback demo pie data if empty
  const displayPieData =
    sentimentPieData.length > 0
      ? sentimentPieData
      : [
          { name: 'Positive', value: 5, color: COLORS.Positive },
          { name: 'Negative', value: 3, color: COLORS.Negative },
          { name: 'Neutral', value: 2, color: COLORS.Neutral },
        ];

  // Language Distribution Data
  const langBarData = Object.entries(langCountMap).map(([name, count]) => ({
    name: name.length > 10 ? name.slice(0, 9) + '…' : name,
    count,
  }));

  const displayLangBarData =
    langBarData.length > 0
      ? langBarData
      : [
          { name: 'Kannada', count: 4 },
          { name: 'Hindi', count: 3 },
          { name: 'Tamil', count: 2 },
          { name: 'Telugu', count: 2 },
          { name: 'Malayalam', count: 1 },
          { name: 'Marathi', count: 1 },
        ];

  // Timeline score data (last 10 analyses)
  const trendData = [...analyses]
    .reverse()
    .slice(-10)
    .map((a, i) => ({
      index: `#${i + 1}`,
      score: a.score,
      confidence: Math.round(a.confidence * 100),
    }));

  const displayTrendData =
    trendData.length > 1
      ? trendData
      : [
          { index: '#1', score: 0.85, confidence: 94 },
          { index: '#2', score: -0.75, confidence: 91 },
          { index: '#3', score: 0.8, confidence: 92 },
          { index: '#4', score: 0.1, confidence: 85 },
          { index: '#5', score: -0.85, confidence: 95 },
        ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-semibold mb-2">
            TELEMETRY OVERVIEW
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sentiment Analytics Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time statistical synthesis of multilingual code-mixed Indian sentences.
          </p>
        </div>

        <button
          onClick={onNavigateToAnalyzer}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">TOTAL ANALYSES</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-2">
            {total}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Processed sentences</p>
        </div>

        {/* Positive Sentiment % */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">POSITIVE RATIO</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {positivePercent}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{positiveCount} positive texts</p>
        </div>

        {/* Negative Sentiment % */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">NEGATIVE RATIO</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-rose-600 dark:text-rose-400 mt-2">
            {negativePercent}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{negativeCount} negative texts</p>
        </div>

        {/* Top Language Pair */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">TOP LANGUAGE</span>
            <Languages className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 truncate font-mono">
            {topLang}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Avg Score: {avgScore}</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Sentiment Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Sentiment Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">Polarity Share</span>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="flex items-center justify-center gap-3 mt-2 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Pos ({positivePercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Neg ({negativePercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Neu ({neutralPercent}%)</span>
            </div>
          </div>
        </div>

        {/* 2. Sentiment Score Trends */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Sentiment Score Trend
            </h3>
            <span className="text-xs text-slate-400 font-mono">Recent Stream</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="index" stroke="#64748B" fontSize={11} fontFamily="monospace" />
                <YAxis domain={[-1, 1]} stroke="#64748B" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366F1" fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">
            Polarity variance [-1.0 to +1.0]
          </p>
        </div>

        {/* 3. Language Breakdown Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Languages Evaluated
            </h3>
            <span className="text-xs text-slate-400 font-mono">Indic Pairs</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayLangBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} interval={0} fontFamily="monospace" />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">
            Code-mixed distribution
          </p>
        </div>
      </div>

      {/* Recent Analyses List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Sentences Analyzed
            </h3>
          </div>
          <span className="text-xs text-slate-400">{analyses.length} Total Saved</span>
        </div>

        {analyses.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No analysis records yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Start by typing or selecting a code-mixed Indian sentence in the Sentiment Analyzer.
            </p>
            <button
              onClick={onNavigateToAnalyzer}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              Go to Sentiment Analyzer
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectAnalysis(item)}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700/60 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        item.sentiment === 'Positive'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : item.sentiment === 'Negative'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.sentiment} ({(item.confidence * 100).toFixed(0)}%)
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                      {item.detectedLanguage}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    "{item.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Score: {item.score > 0 ? `+${item.score.toFixed(2)}` : item.score.toFixed(2)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
