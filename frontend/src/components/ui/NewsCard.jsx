import { ExternalLink, MapPin, Clock, Sparkles, Radio } from 'lucide-react';

export default function NewsCard({ article, index, onFactCheck }) {
  const analysis = article.aiAnalysis || {};
  const isReal = article.isReal !== false && article.verdict !== 'FAKE_HOAX';

  // Format relative timestamp if not provided
  const getTimeString = () => {
    if (article.timestampFormatted) return article.timestampFormatted;
    if (!article.publishedAt) return 'Updated recently';
    const diffSec = Math.floor((Date.now() - new Date(article.publishedAt).getTime()) / 1000);
    if (isNaN(diffSec) || diffSec < 0) return 'Just now';
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
  };

  return (
    <div
      className={`notion-card p-4 space-y-3 transition-all duration-200 flex flex-col justify-between h-full border hover:shadow-md ${
        isReal
          ? 'bg-notion-card hover:border-neutral-400 dark:hover:border-neutral-600'
          : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
      }`}
    >
      <div className="space-y-2.5">
        {/* Top Tag Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`notion-pill text-[10px] font-bold ${
                isReal ? 'notion-pill-green' : 'notion-pill-red'
              }`}
            >
              {isReal ? '● Verified Real' : '🚨 Flagged Hoax / Fake'}
            </span>

            {article.isLiveRss && (
              <span className="notion-pill notion-pill-blue text-[10px] flex items-center gap-0.5 animate-pulse font-semibold">
                <Radio size={9} /> Live RSS
              </span>
            )}

            {article.incidentType && (
              <span className="notion-pill notion-pill-gray text-[10px] capitalize">
                {article.incidentType.replace('_', ' ')}
              </span>
            )}

            {article.credibilityScore !== undefined && (
              <span className="text-[10px] text-notion-dim font-mono">
                {article.credibilityScore}% Truth Score
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-notion-dim">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {article.source || 'News Wire'}
            </span>
          </div>
        </div>

        {/* Headline */}
        <h3 className="text-xs font-bold text-notion-heading font-serif leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-[11px] text-notion-muted line-clamp-3 leading-relaxed">
          {article.description}
        </p>
      </div>

      {/* Footer Details & Action Buttons */}
      <div className="pt-2.5 border-t border-notion-border flex items-center justify-between text-[11px] text-notion-dim flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <MapPin size={11} className="text-blue-500 flex-shrink-0" />
            <span className="truncate max-w-[120px]">
              {analysis.road || article.location || 'Vadodara'}
            </span>
          </span>

          <span className="flex items-center gap-1 text-[10px] text-notion-dim font-mono">
            <Clock size={10} className="text-neutral-400" />
            <span>{getTimeString()}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onFactCheck && (
            <button
              onClick={() => onFactCheck(article)}
              className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 font-semibold bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/40"
              title="Load into OCR & NLP Truth Engine"
            >
              <Sparkles size={10} />
              <span>Verify</span>
            </button>
          )}

          {article.url && article.url !== '#' && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-notion-heading flex items-center gap-1 transition-colors font-semibold text-neutral-700 dark:text-neutral-300"
            >
              <span>Source</span>
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

