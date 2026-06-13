'use client';
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ArrowLeft, Copy, Check, ExternalLink, AlertTriangle, TrendingUp } from 'lucide-react';
import Badge, { qualityToVariant } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { MatchResult, WarmPathResult } from '@/lib/types';

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

function MatchCard({ match, isExpanded }: { match: MatchResult; isExpanded: boolean }) {
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

          {match.introRequestDraft && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-medium text-[#6B7280]">Intro request draft</div>
                <CopyButton text={match.introRequestDraft} />
              </div>
              <textarea
                defaultValue={match.introRequestDraft}
                rows={4}
                className="w-full text-sm border border-[#E5E3DE] rounded-lg px-3 py-2.5 text-[#0D0D0D] bg-white resize-none focus:outline-none focus:border-[#1A1A1A] transition-colors"
              />
            </div>
          )}
        </div>
      )}
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
        <TargetProfile result={result} />

        {result.allMatches.length > 0 ? (
          <div>
            <div className="text-sm font-medium text-[#0D0D0D] mb-3">
              {result.allMatches.length} possible warm path{result.allMatches.length !== 1 ? 's' : ''} found
            </div>
            <div className="space-y-2">
              {result.allMatches.map((match, idx) => (
                <MatchCard key={idx} match={match} isExpanded={idx === 0} />
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

        <div className="bg-white border border-[#E5E3DE] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#6B7280]" />
              <span className="font-medium text-[#0D0D0D]">ICP Fit Score</span>
            </div>
            <div className="flex items-center gap-2">
              <ProgressBar value={result.icpFitScore} className="w-24" />
              <span className="text-sm font-semibold text-[#0D0D0D]">{result.icpFitScore}/100</span>
            </div>
          </div>
          <p className="text-sm text-[#6B7280]">{result.icpFitReason}</p>
        </div>

        {result.warmPathQuality === 'None' && result.fallbackOutreachAngle && (
          <div className="bg-white border border-[#E5E3DE] rounded-2xl p-5 space-y-4">
            <div className="font-medium text-[#0D0D0D]">Strategic Cold Outreach Suggestion</div>

            <div>
              <div className="text-xs font-medium text-[#6B7280] mb-1.5">Outreach angle</div>
              <p className="text-sm text-[#0D0D0D] bg-[#F7F7F5] rounded-lg px-3 py-2.5 leading-relaxed">
                {result.fallbackOutreachAngle}
              </p>
            </div>

            {result.suggestedSubjectLine && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs font-medium text-[#6B7280]">Suggested subject line</div>
                  <CopyButton text={result.suggestedSubjectLine} />
                </div>
                <div className="text-sm text-[#0D0D0D] border border-[#E5E3DE] rounded-lg px-3 py-2.5 bg-white">
                  {result.suggestedSubjectLine}
                </div>
              </div>
            )}

            {result.suggestedFirstCallHook && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs font-medium text-[#6B7280]">First call hook</div>
                  <CopyButton text={result.suggestedFirstCallHook} />
                </div>
                <div className="text-sm text-[#0D0D0D] border border-[#E5E3DE] rounded-lg px-3 py-2.5 bg-white italic">
                  {result.suggestedFirstCallHook}
                </div>
              </div>
            )}
          </div>
        )}

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

        <div className="text-xs text-[#9CA3AF] bg-white border border-[#E5E3DE] rounded-lg px-4 py-3 leading-relaxed">
          Connection strength measures usefulness. Evidence confidence measures how reliable the data is. A strong-looking path with low confidence still needs review. This tool does not prove that two people know each other — same-company matches require human confirmation before requesting introductions.
        </div>
      </div>
    </div>
  );
}
