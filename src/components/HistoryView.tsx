import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from 'lucide-react';
import { SentimentAnalysisResult, SentimentType } from '../types/sentiment';
import { deleteAnalysisRecord, clearAllAnalyses } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

interface HistoryViewProps {
  analyses: SentimentAnalysisResult[];
  onSelectAnalysis: (analysis: SentimentAnalysisResult) => void;
  onRefreshHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  analyses,
  onSelectAnalysis,
  onRefreshHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'All' | SentimentType>('All');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score_high' | 'score_low'>('newest');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { user } = useAuth();
  const { showToast } = useToast();

  // Extract unique languages for filter dropdown
  const uniqueLanguages = Array.from(
    new Set(analyses.map((a) => a.primaryLanguage || a.detectedLanguage.split(' ')[0]).filter(Boolean))
  );

  // Filter and sort items
  const filteredAnalyses = analyses
    .filter((item) => {
      const matchesSearch =
        item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.detectedLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.importantWords.some((w) => w.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSentiment =
        sentimentFilter === 'All' ? true : item.sentiment === sentimentFilter;

      const matchesLanguage =
        languageFilter === 'All'
          ? true
          : (item.primaryLanguage || '').toLowerCase().includes(languageFilter.toLowerCase()) ||
            item.detectedLanguage.toLowerCase().includes(languageFilter.toLowerCase());

      return matchesSearch && matchesSentiment && matchesLanguage;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'score_high') return b.score - a.score;
      if (sortBy === 'score_low') return a.score - b.score;
      return 0;
    });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      await deleteAnalysisRecord(id, user?.uid || 'guest_user');
      showToast('Record Removed', 'The analysis record was deleted.');
      onRefreshHistory();
    } catch (err) {
      showToast('Delete Failed', 'Could not delete record.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllAnalyses(user?.uid || 'guest_user');
      setShowClearConfirm(false);
      showToast('History Cleared', 'All analysis records removed.');
      onRefreshHistory();
    } catch (err) {
      showToast('Clear Failed', 'Could not clear history.', 'error');
    }
  };

  // Export as CSV
  const handleExportCSV = () => {
    if (analyses.length === 0) {
      showToast('No Data', 'There are no analyses to export.', 'error');
      return;
    }

    const headers = ['ID', 'Date', 'Input Text', 'Detected Language', 'Sentiment', 'Confidence', 'Sentiment Score', 'Important Words', 'Explanation'];
    const rows = analyses.map((a) => [
      a.id,
      new Date(a.createdAt).toISOString(),
      `"${a.text.replace(/"/g, '""')}"`,
      `"${a.detectedLanguage}"`,
      a.sentiment,
      a.confidence.toFixed(2),
      a.score.toFixed(2),
      `"${a.importantWords.join(', ')}"`,
      `"${a.explanation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `codemixed_sentiment_history_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Export Successful', 'Dataset downloaded in CSV format.');
  };

  // Export as JSON
  const handleExportJSON = () => {
    if (analyses.length === 0) {
      showToast('No Data', 'There are no analyses to export.', 'error');
      return;
    }
    const jsonStr = JSON.stringify(analyses, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `codemixed_sentiment_history_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    showToast('Export Successful', 'Dataset downloaded in JSON format.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Analysis History & Logs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, filter, and export all recorded code-mixed sentiment classifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          {analyses.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-900 dark:text-white">Clear All Analyses?</h4>
              <p className="text-xs text-slate-500 mt-1">
                This action will remove all {analyses.length} saved history records permanently from Firestore and local cache.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by text, language, sentiment words, or explanation..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Language Filter */}
          <div className="w-full md:w-48">
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Languages</option>
              {uniqueLanguages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score_high">Highest Score (+)</option>
              <option value="score_low">Lowest Score (-)</option>
            </select>
          </div>
        </div>

        {/* Sentiment Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 mr-2">Filter Sentiment:</span>
          {(['All', 'Positive', 'Negative', 'Neutral'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSentimentFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                sentimentFilter === filter
                  ? filter === 'Positive'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : filter === 'Negative'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : filter === 'Neutral'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            Showing {filteredAnalyses.length} of {analyses.length} records
          </span>
        </div>
      </div>

      {/* History Records List */}
      {filteredAnalyses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching records found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or analyze a new code-mixed sentence.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnalyses.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAnalysis(item)}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.sentiment === 'Positive'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : item.sentiment === 'Negative'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.sentiment === 'Positive' && <TrendingUp className="w-3.5 h-3.5" />}
                      {item.sentiment === 'Negative' && <TrendingDown className="w-3.5 h-3.5" />}
                      {item.sentiment === 'Neutral' && <Minus className="w-3.5 h-3.5" />}
                      {item.sentiment} ({(item.confidence * 100).toFixed(0)}%)
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {item.detectedLanguage}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()} at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Input Sentence */}
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    "{item.text}"
                  </h4>

                  {/* Explanation preview */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.explanation}
                  </p>

                  {/* Important words chips */}
                  {item.importantWords && item.importantWords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-medium text-slate-400">Tokens:</span>
                      {item.importantWords.slice(0, 5).map((w, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Score & Action delete */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Score</span>
                    <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {item.score > 0 ? `+${item.score.toFixed(2)}` : item.score.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete this record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
