'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { ArrowLeft, Copy, Check, ExternalLink, AlertTriangle, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import Badge, { qualityToVariant } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { MatchResult, WarmPathResult, AiAnalysis } from '@/lib/types';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#0D0D0D] transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function AiDraftButton({ target, connection, matchType }: {
  target: WarmPathResult['target'];
  connection: MatchResult['connection'];
  matchType: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, connection, matchType }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDraft(data.draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  if (draft) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280]">
            <Sparkles size={11} className="text-purple-500" />
            AI-generated intro draft
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generate} className="text-xs text-[#6B7280] hover:text-[#0D0D0D]">
              <RefreshCw size={11} />
            </button>
            <CopyButton text={draft} />
          </div>
        </div>
        <textarea
          defaultValue={draft}
          key={draft}
          rows={4}
          className="w-full text-sm border border-purple-200 rounded-lg px-3 py-2.5 text-[#0D0D0D] bg-purple-50 resize-none focus:outline-none focus:border-purple-400 transition-colors"
        />
      </div>
    );
  }

  return (
    <div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <><div className="w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin" />Generating...</>
        ) : (
          <><Sparkles size={11} />Generate AI intro draft</>
        )}
      </button>
    </div>
  );
}

function MatchCard({ match, target, isExpanded }: { match: MatchResult; target: WarmPathResult['target']; isExpanded: boolean }) {
  const [open, setOpen] = useState(isExpanded);

  return (
    <div className="border border-[#E5E3DE] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-[#F7F7F5] transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant={qualityToVariant(match.evidenceConfidence)}>{match.evidenceConfidence} confidence</Badge>
          <span className="text-sm font-medium text-[#0D0D0D] truncate">{match.connection.rawName}</span>
          {match.connection.rawConnectedThrough && (
            <span className="text-xs text-[#6B7280] shrink-0">via {match.connection.rawConnectedThrough}</span>
          )}
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded shrink-0">{match.matchType}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <div className="flex items-center gap-1.5 w-24">
            <ProgressBar value={match.connectionStrength} className="flex-1" />
            <span className="text-xs text-[#6B7280] w-6">{match.connectionStrength}</span>
          </div>
          <span className="text-[#6B7280] text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 bg-white border-t border-[#E5E3DE] space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs font-medium text-[#6B7280] mb-1">Connection</div>
              <div className="font-medium text-[#0D0D0D]">{match.connection.rawName}</div>
              {match.connection.rawTitle && <div className="text-xs text-[#6B7280]">{match.connection.rawTitle}</div>}
              {match.connection.rawCompany && <div className="text-xs text-[#6B7280]">{match.connection.rawCompany}</div>}
              {match.connection.rawLinkedIn && (
                <a
                  href={`https://linkedin.com/in/${match.connection.normLinkedIn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  <ExternalLink size={10} /> LinkedIn
                </a>
              )}
            </div>
            <div>
              <div className="text-xs font-medium text-[#6B7280] mb-1">Connected Through</div>
              <div className="font-medium text-[#0D0D0D]">{match.connection.rawConnectedThrough || <span className="text-gray-400">Not specified</span>}</div>
              <div className="text-xs text-[#6B7280] mt-0.5">Match type: {match.matchType}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-[#6B7280] mb-1.5">Why this match was found</div>
            <p className="text-sm text-[#0D0D0D] bg-[#F7F7F5] rounded-lg px-3 py-2.5 leading-relaxed">{match.reason}</p>
          </div>

          <div>
            <div className="text-xs font-medium text-[#6B7280] mb-1.5">Suggested next action</div>
            <p className="text-sm text-[#0D0D0D]">{match.suggestedNextAction}</p>
          </div>

          <AiDraftButton target={target} connection={match.connection} matchType={match.matchType} />
        </div>
      )}
    </div>
  );
}

function AiAnalysisPanel({ target }: { target: WarmPathResult['target'] }) {
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis({ ...data, generatedAt: new Date().toISOString() });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI analysis failed');
    } finally {
      setLoading(false);
    }
  }, [target]);

  useEffect(() => { runAnalysis(); }, [runAnalysis]);

  if (loading) {
    return (
      <div className="bg-white border border-[#E5E3DE] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={15} className="text-purple-500" />
          <span className="font-medium text-[#0D0D0D]">AI Analysis</span>
          <span className="text-xs text-[#6B7280]">— generating with Groq...</span>
        </div>
        <div className="space-y-2.5">
          {[80, 60, 90, 50].map((w, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#E5E3DE] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-purple-500" />
            <span className="font-medium text-[#0D0D0D]">AI Analysis</span>
          </div>
          <button onClick={runAnalysis} className="text-xs text-[#6B7280] hover:text-[#0D0D0D] flex items-center gap-1">
            <RefreshCw size={11} /> Retry
          </button>
        </div>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-white border border-[#E5E3DE] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-purple-500" />
          <span className="font-medium text-[#0D0D0D]">AI Analysis</span>
          <span className="text-xs text-[#6B7280] bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded">{analysis.track}</span>
        </div>
        <button onClick={runAnalysis} className="text-xs text-[#6B7280] hover:text-[#0D0D0D] flex items-center gap-1">
          <RefreshCw size={11} /> Regenerate
        </button>
      </div>

      {/* ICP Score */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <TrendingUp size={14} className="text-[#6B7280] shrink-0" />
          <span className="text-sm text-[#6B7280]">ICP Fit</span>
          <ProgressBar value={analysis.icpFitScore} className="flex-1" />
          <span className="text-sm font-semibold text-[#0D0D0D] w-10 text-right">{analysis.icpFitScore}/100</span>
        </div>
      </div>

      {/* Why */}
      <div>
        <div className="text-xs font-medium text-[#6B7280] mb-1">ICP assessment</div>
        <p className="text-sm text-[#0D0D0D] leading-relaxed">{analysis.icpFitReason}</p>
      </div>

      {/* Pain points */}
      <div>
        <div className="text-xs font-medium text-[#6B7280] mb-1">Likely pain points</div>
        <p className="text-sm text-[#0D0D0D] leading-relaxed">{analysis.likelyPainPoints}</p>
      </div>

      {/* Why Synopsis */}
      <div>
        <div className="text-xs font-medium text-[#6B7280] mb-1">Why Synopsis may matter</div>
        <p className="text-sm text-[#0D0D0D] leading-relaxed">{analysis.whySynopsisMayMatter}</p>
      </div>

      {/* Outreach */}
      <div className="border-t border-[#E5E3DE] pt-4 space-y-3">
        <div className="text-xs font-medium text-[#6B7280]">Outreach guidance</div>

        <div>
          <div className="text-xs text-[#9CA3AF] mb-1">Angle</div>
          <p className="text-sm text-[#0D0D0D] bg-[#F7F7F5] rounded-lg px-3 py-2.5 leading-relaxed">{analysis.outreachAngle}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-[#9CA3AF]">Subject line</div>
              <CopyButton text={analysis.subjectLine} />
            </div>
            <div className="text-sm text-[#0D0D0D] border border-[#E5E3DE] rounded-lg px-3 py-2 bg-white font-medium">
              {analysis.subjectLine}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-[#9CA3AF]">First call hook</div>
              <CopyButton text={analysis.firstCallHook} />
            </div>
            <div className="text-sm text-[#0D0D0D] border border-[#E5E3DE] rounded-lg px-3 py-2 bg-white italic">
              {analysis.firstCallHook}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TargetProfile({ result }: { result: WarmPathResult }) {
  const t = result.target;
  return (
    <div className="bg-white border border-[#E5E3DE] rounded-2xl p-5 flex items-start justify-between gap-4">
      <div>
        <div className="text-lg font-semibold text-[#0D0D0D]">{t.rawName || <span className="text-gray-400">No name</span>}</div>
        {t.rawTitle && <div className="text-sm text-[#6B7280]">{t.rawTitle}</div>}
        {t.rawCompany && <div className="text-sm text-[#0D0D0D] mt-0.5 font-medium">{t.rawCompany}</div>}
        <div className="flex flex-wrap gap-2 mt-3">
          {t.rawLinkedIn && (
            <a
              href={`https://linkedin.com/in/${t.normLinkedIn}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <ExternalLink size={10} /> LinkedIn
            </a>
          )}
          {t.rawEmail && (
            <a href={`mailto:${t.rawEmail}`} className="text-xs text-[#6B7280] hover:text-[#0D0D0D]">
              {t.rawEmail}
            </a>
          )}
          {t.rawDomain && (
            <a
              href={`https://${t.rawDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#6B7280] hover:text-[#0D0D0D]"
            >
              {t.rawDomain}
            </a>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <Badge variant={qualityToVariant(result.warmPathQuality)} className="text-sm px-3 py-1">
          {result.warmPathQuality}
        </Badge>
        <div className="text-xs text-[#6B7280] mt-1.5">Warm Path Quality</div>
      </div>
    </div>
  );
}

export default function DetailView() {
  const { state, dispatch } = useStore();
  const result = state.results.find(r => r.id === state.selectedResultId);

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center text-[#6B7280]">
        <p>No result selected.</p>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 6 })}
          className="mt-4 text-sm text-[#0D0D0D] underline"
        >
          Back to Results
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => dispatch({ type: 'SET_STEP', payload: 6 })}
        className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0D0D0D] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Results
      </button>

      <div className="space-y-5">
        {/* Target profile */}
        <TargetProfile result={result} />

        {/* Warm path matches */}
        {result.allMatches.length > 0 ? (
          <div>
            <div className="text-sm font-medium text-[#0D0D0D] mb-3">
              {result.allMatches.length} possible warm path{result.allMatches.length !== 1 ? 's' : ''} found
            </div>
            <div className="space-y-2">
              {result.allMatches.map((match, idx) => (
                <MatchCard key={idx} match={match} target={result.target} isExpanded={idx === 0} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E3DE] rounded-2xl p-5">
            <div className="flex items-center gap-2 text-[#6B7280] mb-2">
              <AlertTriangle size={16} />
              <span className="font-medium text-[#0D0D0D]">No known warm path found</span>
            </div>
            <p className="text-sm text-[#6B7280]">
              No direct, company, domain, or past-company match was found between this target and your team connections.
            </p>
          </div>
        )}

        {/* AI Analysis — always shown, loads on mount */}
        <AiAnalysisPanel target={result.target} />

        {/* Data gaps */}
        {result.dataGaps.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={15} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-900">Data gaps</span>
            </div>
            <ul className="space-y-1">
              {result.dataGaps.map((gap, i) => (
                <li key={i} className="text-sm text-amber-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {gap}
                </li>
              ))}
            </ul>
            <p className="text-xs text-amber-700 mt-3">
              Adding this data to your target file and re-uploading may reveal additional warm paths.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-[#9CA3AF] bg-white border border-[#E5E3DE] rounded-lg px-4 py-3 leading-relaxed">
          Connection strength measures usefulness. Evidence confidence measures how reliable the data is. A strong-looking path with low confidence still needs review. This tool does not prove that two people know each other — same-company matches require human confirmation before requesting introductions.
        </div>
      </div>
    </div>
  );
}
