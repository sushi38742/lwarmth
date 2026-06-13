'use client';
import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { WarmPathResult, WarmPathQuality } from '@/lib/types';
import Badge, { qualityToVariant } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { Download, ChevronRight, RotateCcw } from 'lucide-react';
import { exportFullResults, exportIntroRequests, exportNeedsReview, exportNoKnownPath, downloadCsv } from '@/lib/export';

const qualityColors: Record<WarmPathQuality, string> = {
  'Strong': 'text-emerald-700',
  'Good': 'text-blue-700',
  'Possible': 'text-amber-700',
  'Weak': 'text-gray-500',
  'None': 'text-red-600',
  'Needs Data': 'text-purple-700',
};

const qualityBg: Record<WarmPathQuality, string> = {
  'Strong': 'bg-emerald-50 border-emerald-200',
  'Good': 'bg-blue-50 border-blue-200',
  'Possible': 'bg-amber-50 border-amber-200',
  'Weak': 'bg-gray-50 border-gray-200',
  'None': 'bg-red-50 border-red-200',
  'Needs Data': 'bg-purple-50 border-purple-200',
};

const ALL_QUALITIES: WarmPathQuality[] = ['Strong', 'Good', 'Possible', 'Weak', 'None', 'Needs Data'];

function SummaryCard({ quality, count }: { quality: WarmPathQuality; count: number }) {
  return (
    <div className={`flex-1 min-w-[100px] border rounded-xl px-4 py-3 ${qualityBg[quality]}`}>
      <div className={`text-2xl font-bold ${qualityColors[quality]}`}>{count}</div>
      <div className="text-xs text-[#6B7280] mt-0.5">{quality}</div>
    </div>
  );
}

export default function ResultsDashboard() {
  const { state, dispatch } = useStore();
  const [qualityFilters, setQualityFilters] = useState<WarmPathQuality[]>([]);
  const [connectedThroughFilter, setConnectedThroughFilter] = useState('');
  const [matchTypeFilter, setMatchTypeFilter] = useState('');

  const summary = useMemo(() => {
    const counts: Record<WarmPathQuality, number> = { Strong: 0, Good: 0, Possible: 0, Weak: 0, None: 0, 'Needs Data': 0 };
    for (const r of state.results) counts[r.warmPathQuality]++;
    return counts;
  }, [state.results]);

  const connectedThroughOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of state.results) {
      const ct = r.bestMatch?.connection.rawConnectedThrough;
      if (ct) set.add(ct);
    }
    return Array.from(set).sort();
  }, [state.results]);

  const matchTypeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of state.results) {
      if (r.bestMatch) set.add(r.bestMatch.matchType);
    }
    return Array.from(set).sort();
  }, [state.results]);

  const filtered = useMemo(() => {
    return state.results.filter(r => {
      if (qualityFilters.length > 0 && !qualityFilters.includes(r.warmPathQuality)) return false;
      if (connectedThroughFilter && r.bestMatch?.connection.rawConnectedThrough !== connectedThroughFilter) return false;
      if (matchTypeFilter && r.bestMatch?.matchType !== matchTypeFilter) return false;
      return true;
    });
  }, [state.results, qualityFilters, connectedThroughFilter, matchTypeFilter]);

  const toggleQuality = (q: WarmPathQuality) => {
    setQualityFilters(prev => prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]);
  };

  const handleRowClick = (result: WarmPathResult) => {
    dispatch({ type: 'SET_SELECTED_RESULT', payload: result.id });
    dispatch({ type: 'SET_STEP', payload: 7 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#0D0D0D]">Results</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">{state.results.length} targets analyzed</p>
        </div>
        <button
          onClick={() => { dispatch({ type: 'RESET' }); }}
          className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#0D0D0D] border border-[#E5E3DE] rounded-lg px-3 py-1.5 transition-colors"
        >
          <RotateCcw size={12} />
          Start Over
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5 mb-6">
        <div className="flex-1 min-w-[100px] border border-[#E5E3DE] rounded-xl px-4 py-3 bg-white">
          <div className="text-2xl font-bold text-[#0D0D0D]">{state.results.length}</div>
          <div className="text-xs text-[#6B7280] mt-0.5">Total Targets</div>
        </div>
        {ALL_QUALITIES.map(q => (
          <SummaryCard key={q} quality={q} count={summary[q]} />
        ))}
      </div>

      <div className="mb-5 text-xs text-[#6B7280] bg-white border border-[#E5E3DE] rounded-lg px-4 py-2.5">
        Warm Path Finder identifies evidence-based possible paths — it does not prove personal relationships. Same-company matches require human confirmation before requesting introductions.
      </div>

      <div className="bg-white border border-[#E5E3DE] rounded-xl px-4 py-3 mb-4 flex flex-wrap gap-3 items-center">
        <div className="text-xs font-medium text-[#6B7280] shrink-0">Filter by:</div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_QUALITIES.map(q => (
            <button
              key={q}
              onClick={() => toggleQuality(q)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                qualityFilters.includes(q)
                  ? `${qualityBg[q]} ${qualityColors[q]}`
                  : 'border-[#E5E3DE] text-[#6B7280] hover:border-gray-300'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        {connectedThroughOptions.length > 0 && (
          <select
            value={connectedThroughFilter}
            onChange={e => setConnectedThroughFilter(e.target.value)}
            className="text-xs border border-[#E5E3DE] rounded-lg px-2.5 py-1 bg-white outline-none"
          >
            <option value="">All Team Members</option>
            {connectedThroughOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        {matchTypeOptions.length > 0 && (
          <select
            value={matchTypeFilter}
            onChange={e => setMatchTypeFilter(e.target.value)}
            className="text-xs border border-[#E5E3DE] rounded-lg px-2.5 py-1 bg-white outline-none"
          >
            <option value="">All Match Types</option>
            {matchTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        {(qualityFilters.length > 0 || connectedThroughFilter || matchTypeFilter) && (
          <button
            onClick={() => { setQualityFilters([]); setConnectedThroughFilter(''); setMatchTypeFilter(''); }}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: 'Full Results', fn: () => downloadCsv(exportFullResults(state.results), 'warm-path-full-results.csv') },
          { label: 'Intro Requests', fn: () => downloadCsv(exportIntroRequests(state.results), 'warm-path-intro-requests.csv') },
          { label: 'Needs Review', fn: () => downloadCsv(exportNeedsReview(state.results), 'warm-path-needs-review.csv') },
          { label: 'No Known Path', fn: () => downloadCsv(exportNoKnownPath(state.results), 'warm-path-no-known-path.csv') },
        ].map(({ label, fn }) => (
          <button
            key={label}
            onClick={fn}
            className="flex items-center gap-1.5 text-xs border border-[#E5E3DE] rounded-lg px-3 py-1.5 text-[#6B7280] hover:text-[#0D0D0D] hover:border-gray-300 bg-white transition-colors"
          >
            <Download size={11} />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#E5E3DE] rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E3DE]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap">Best Connection</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap">Match Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap w-28">Strength</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap">Quality</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap">ICP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E3DE]">
              {filtered.map(result => (
                <tr
                  key={result.id}
                  className="hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                  onClick={() => handleRowClick(result)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#0D0D0D] text-sm">{result.target.rawName || <span className="text-gray-400">—</span>}</div>
                    {result.target.rawTitle && <div className="text-xs text-[#6B7280]">{result.target.rawTitle}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#0D0D0D]">
                    {result.target.rawCompany || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {result.bestMatch ? (
                      <>
                        <div className="text-sm text-[#0D0D0D] font-medium">{result.bestMatch.connection.rawName}</div>
                        {result.bestMatch.connection.rawConnectedThrough && (
                          <div className="text-xs text-[#6B7280]">via {result.bestMatch.connection.rawConnectedThrough}</div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">No match found</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {result.bestMatch ? (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded whitespace-nowrap">
                        {result.bestMatch.matchType}
                      </span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 w-28">
                    {result.bestMatch ? (
                      <div className="flex items-center gap-2">
                        <ProgressBar value={result.bestMatch.connectionStrength} className="flex-1" />
                        <span className="text-xs text-[#6B7280] w-6">{result.bestMatch.connectionStrength}</span>
                      </div>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {result.bestMatch ? (
                      <Badge variant={qualityToVariant(result.bestMatch.evidenceConfidence)}>
                        {result.bestMatch.evidenceConfidence}
                      </Badge>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={qualityToVariant(result.warmPathQuality)}>
                      {result.warmPathQuality}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{result.icpFitScore}</td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-0.5 text-xs text-[#6B7280] hover:text-[#0D0D0D] whitespace-nowrap">
                      View <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-[#6B7280]">
                    No results match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-xs text-[#6B7280] text-right">{filtered.length} of {state.results.length} results shown</div>
    </div>
  );
}
