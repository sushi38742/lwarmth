'use client';
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ArrowLeft, ExternalLink, AlertTriangle, TrendingUp } from 'lucide-react';
import Badge, { qualityToVariant } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { MatchResult, WarmPathResult } from '@/lib/types';
import { HelpHighlight } from '@/components/HelpSystem';

function MatchCard({ match, expanded }: { match: MatchResult; expanded: boolean }) {
  const [open, setOpen] = useState(expanded);
  return (
    <div className="border border-[#E5E3DE] rounded-2xl overflow-hidden bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F7F7F5] transition-colors text-left">
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant={qualityToVariant(match.evidenceConfidence)}>{match.evidenceConfidence}</Badge>
          <span className="text-base font-medium text-[#0D0D0D] truncate">{match.connection.rawName || 'Unknown'}</span>
          {match.connection.rawConnectedThrough && <span className="text-sm text-[#6B7280] shrink-0">via {match.connection.rawConnectedThrough}</span>}
        </div>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{match.matchType}</span>
          <div className="flex items-center gap-2 w-28">
            <ProgressBar value={match.connectionStrength} className="flex-1" />
            <span className="text-sm font-medium text-[#0D0D0D] w-7">{match.connectionStrength}</span>
          </div>
          <span className="text-[#6B7280] text-sm">{open ? '−' : '+'}</span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-[#E5E3DE] space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
            <div>
              <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Connection</div>
              <div className="font-medium text-[#0D0D0D] text-base">{match.connection.rawName || 'Unknown'}</div>
              {match.connection.rawTitle && <div className="text-sm text-[#6B7280]">{match.connection.rawTitle}</div>}
              {match.connection.rawCompany && <div className="text-sm text-[#0D0D0D]">{match.connection.rawCompany}</div>}
              {match.connection.rawLinkedIn && (
                <a href={`https://linkedin.com/in/${match.connection.normLinkedIn}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2">
                  <ExternalLink size={12} /> LinkedIn
                </a>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Connected Through</div>
              <div className="font-medium text-[#0D0D0D] text-base">{match.connection.rawConnectedThrough || <span className="text-gray-400">Not specified</span>}</div>
              <div className="text-sm text-[#6B7280] mt-1">{match.matchType}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Why this match</div>
            <p className="text-base text-[#0D0D0D] bg-[#F7F7F5] rounded-xl px-4 py-3 leading-relaxed">{match.reason}</p>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Next action</div>
            <p className="text-base text-[#0D0D0D] leading-relaxed">{match.suggestedNextAction}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TargetProfile({ result }: { result: WarmPathResult }) {
  const t = result.target;
  return (
    <div className="bg-white border border-[#E5E3DE] rounded-3xl p-7 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div className="text-2xl font-semibold text-[#0D0D0D]">{t.rawName || <span className="text-gray-400">No name</span>}</div>
        {t.rawTitle && <div className="text-base text-[#6B7280] mt-1">{t.rawTitle}</div>}
        {t.rawCompany && <div className="text-base text-[#0D0D0D] mt-0.5 font-medium">{t.rawCompany}</div>}
        <div className="flex flex-wrap gap-3 mt-4">
          {t.rawLinkedIn && <a href={`https://linkedin.com/in/${t.normLinkedIn}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"><ExternalLink size={12} /> LinkedIn</a>}
          {t.rawEmail && <a href={`mailto:${t.rawEmail}`} className="text-sm text-[#6B7280] hover:text-[#0D0D0D]">{t.rawEmail}</a>}
          {t.rawDomain && <a href={`https://${t.rawDomain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#6B7280] hover:text-[#0D0D0D]">{t.rawDomain}</a>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <Badge variant={qualityToVariant(result.warmPathQuality)} className="text-base px-3.5 py-1">{result.warmPathQuality}</Badge>
        <div className="text-xs text-[#6B7280] mt-2 uppercase tracking-wide">Path quality</div>
      </div>
    </div>
  );
}

export default function DetailView() {
  const { state, dispatch } = useStore();
  const result = state.results.find(r => r.id === state.selectedResultId);

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center text-[#6B7280]">
        <p>No result selected.</p>
        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })} className="mt-4 text-sm text-[#0D0D0D] underline">Back to results</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D0D0D] transition-colors mb-7">
        <ArrowLeft size={15} /> Back to results
      </button>

      <div className="space-y-6">
        <HelpHighlight title="Target" body="The person you're trying to reach. Quality badge summarizes how usable the warm path is." placement="bottom">
          <TargetProfile result={result} />
        </HelpHighlight>

        {result.allMatches.length > 0 ? (
          <HelpHighlight title="Matches" body="Each row is a possible path. Strength is 0–100; confidence reflects evidence quality. Click to expand for reasoning." placement="top">
            <div>
              <div className="text-base font-semibold text-[#0D0D0D] mb-3">{result.allMatches.length} path{result.allMatches.length !== 1 ? 's' : ''} found</div>
              <div className="space-y-3">
                {result.allMatches.map((m, i) => <MatchCard key={i} match={m} expanded={i === 0} />)}
              </div>
            </div>
          </HelpHighlight>
        ) : (
          <div className="bg-white border border-[#E5E3DE] rounded-3xl p-7">
            <div className="flex items-center gap-2.5 mb-2">
              <AlertTriangle size={18} className="text-[#6B7280]" />
              <span className="font-semibold text-lg text-[#0D0D0D]">No warm path found</span>
            </div>
            <p className="text-base text-[#6B7280] leading-relaxed">No direct, company, domain, or past-company match between this target and your connections.</p>
          </div>
        )}

        <HelpHighlight title="ICP fit" body="How well this target matches Synopsis's ideal customer profile, scored 0–100 from title, industry, and PE/VC signals." placement="top">
          <div className="bg-white border border-[#E5E3DE] rounded-3xl p-7">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <TrendingUp size={18} className="text-[#6B7280]" />
                <span className="font-semibold text-lg text-[#0D0D0D]">ICP fit</span>
              </div>
              <div className="flex items-center gap-3">
                <ProgressBar value={result.icpFitScore} className="w-32" />
                <span className="text-xl font-semibold text-[#0D0D0D]">{result.icpFitScore}<span className="text-sm text-[#6B7280]">/100</span></span>
              </div>
            </div>
            <p className="text-base text-[#6B7280] leading-relaxed">{result.icpFitReason}</p>
          </div>
        </HelpHighlight>

        {result.warmPathQuality === 'None' && result.fallbackOutreachAngle && (
          <div className="bg-white border border-[#E5E3DE] rounded-3xl p-7 space-y-5">
            <div className="font-semibold text-lg text-[#0D0D0D]">Cold outreach suggestion</div>
            <div>
              <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Angle</div>
              <p className="text-base text-[#0D0D0D] bg-[#F7F7F5] rounded-xl px-4 py-3 leading-relaxed">{result.fallbackOutreachAngle}</p>
            </div>
            {result.suggestedSubjectLine && (
              <div>
                <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Subject line</div>
                <div className="text-base text-[#0D0D0D] border border-[#E5E3DE] rounded-xl px-4 py-3">{result.suggestedSubjectLine}</div>
              </div>
            )}
            {result.suggestedFirstCallHook && (
              <div>
                <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">First call hook</div>
                <div className="text-base text-[#0D0D0D] border border-[#E5E3DE] rounded-xl px-4 py-3 italic">{result.suggestedFirstCallHook}</div>
              </div>
            )}
          </div>
        )}

        {result.dataGaps.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <span className="text-base font-semibold text-amber-900">Data gaps</span>
            </div>
            <ul className="space-y-1.5">
              {result.dataGaps.map((g, i) => <li key={i} className="text-sm text-amber-800 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{g}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
