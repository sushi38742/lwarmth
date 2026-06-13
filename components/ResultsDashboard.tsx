'use client';
import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { WarmPathResult, WarmPathQuality } from '@/lib/types';
import Badge, { qualityToVariant } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { Download, ChevronRight, RotateCcw } from 'lucide-react';
import { exportFullResults, exportIntroRequests, exportNeedsReview, exportNoKnownPath, downloadCsv } from '@/lib/export';
import { HelpHighlight } from '@/components/HelpSystem';

const qColor: Record<WarmPathQuality, string> = {
  'Strong': 'text-emerald-700', 'Good': 'text-blue-700', 'Possible': 'text-amber-700',
  'Weak': 'text-gray-500', 'None': 'text-red-600', 'Needs Data': 'text-purple-700',
};
const qBg: Record<WarmPathQuality, string> = {
  'Strong': 'bg-emerald-50 border-emerald-200', 'Good': 'bg-blue-50 border-blue-200',
  'Possible': 'bg-amber-50 border-amber-200', 'Weak': 'bg-gray-50 border-gray-200',
  'None': 'bg-red-50 border-red-200', 'Needs Data': 'bg-purple-50 border-purple-200',
};
const QUALITIES: WarmPathQuality[] = ['Strong', 'Good', 'Possible', 'Weak', 'None', 'Needs Data'];

export default function ResultsDashboard() {
  const { state, dispatch } = useStore();
  const [qFilters, setQFilters] = useState<WarmPathQuality[]>([]);
  const [ctFilter, setCtFilter] = useState('');

  const summary = useMemo(() => {
    const c: Record<WarmPathQuality, number> = { Strong: 0, Good: 0, Possible: 0, Weak: 0, None: 0, 'Needs Data': 0 };
    for (const r of state.results) c[r.warmPathQuality]++;
    return c;
  }, [state.results]);

  const ctOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of state.results) { const v = r.bestMatch?.connection.rawConnectedThrough; if (v) s.add(v); }
    return Array.from(s).sort();
  }, [state.results]);

  const filtered = useMemo(() => state.results.filter(r => {
    if (qFilters.length > 0 && !qFilters.includes(r.warmPathQuality)) return false;
    if (ctFilter && r.bestMatch?.connection.rawConnectedThrough !== ctFilter) return false;
    return true;
  }), [state.results, qFilters, ctFilter]);

  const toggleQ = (q: WarmPathQuality) => setQFilters(p => p.includes(q) ? p.filter(x => x !== q) : [...p, q]);
  const open = (r: WarmPathResult) => { dispatch({ type: 'SET_SELECTED_RESULT', payload: r.id }); dispatch({ type: 'SET_STEP', payload: 6 }); };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-4xl font-semibold text-[#0D0D0D] tracking-tight">Results</h2>
          <p className="text-base text-[#6B7280] mt-1.5">{state.results.length} targets analyzed</p>
        </div>
        <button onClick={() => dispatch({ type: 'RESET' })} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D0D0D] border border-[#E5E3DE] rounded-lg px-4 py-2 bg-white transition-colors">
          <RotateCcw size={13} /> Start over
        </button>
      </div>

      <HelpHighlight title="Path quality at a glance" body="Strong = a direct connection. Good/Possible = same company or domain. Click any tile to filter the table below." placement="bottom">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          <div className="border border-[#E5E3DE] rounded-2xl px-5 py-4 bg-white">
            <div className="text-3xl font-bold text-[#0D0D0D]">{state.results.length}</div>
            <div className="text-xs text-[#6B7280] mt-1">Total</div>
          </div>
          {QUALITIES.map(q => (
            <button key={q} onClick={() => toggleQ(q)} className={`border rounded-2xl px-5 py-4 text-left transition-all ${qBg[q]} ${qFilters.includes(q) ? 'ring-2 ring-[#1A1A1A]' : 'hover:ring-1 hover:ring-gray-300'}`}>
              <div className={`text-3xl font-bold ${qColor[q]}`}>{summary[q]}</div>
              <div className="text-xs text-[#6B7280] mt-1">{q}</div>
            </button>
          ))}
        </div>
      </HelpHighlight>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        {ctOptions.length > 0 && (
          <select value={ctFilter} onChange={e => setCtFilter(e.target.value)} className="text-sm border border-[#E5E3DE] rounded-lg px-3 py-2 bg-white outline-none">
            <option value="">All teammates</option>
            {ctOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        {(qFilters.length > 0 || ctFilter) && (
          <button onClick={() => { setQFilters([]); setCtFilter(''); }} className="text-sm text-[#6B7280] hover:text-[#0D0D0D] underline">Clear</button>
        )}
        <div className="flex-1" />
        <HelpHighlight title="Exports" body="Download filtered or full data as CSV for follow-up in your CRM or sequencer." placement="left">
          <div className="flex flex-wrap gap-2">
            {[
              { l: 'Full', fn: () => downloadCsv(exportFullResults(state.results), 'warm-path-full.csv') },
              { l: 'Intros', fn: () => downloadCsv(exportIntroRequests(state.results), 'warm-path-intros.csv') },
              { l: 'Needs review', fn: () => downloadCsv(exportNeedsReview(state.results), 'warm-path-review.csv') },
              { l: 'No path', fn: () => downloadCsv(exportNoKnownPath(state.results), 'warm-path-none.csv') },
            ].map(b => (
              <button key={b.l} onClick={b.fn} className="flex items-center gap-1.5 text-sm border border-[#E5E3DE] rounded-lg px-3.5 py-2 text-[#0D0D0D] hover:border-[#1A1A1A] bg-white transition-colors">
                <Download size={13} /> {b.l}
              </button>
            ))}
          </div>
        </HelpHighlight>
      </div>

      <div className="bg-white border border-[#E5E3DE] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E5E3DE]">
                {['Target', 'Company', 'Best Connection', 'Strength', 'Quality', 'ICP', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E3DE]">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-[#F7F7F5] cursor-pointer transition-colors" onClick={() => open(r)}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-[#0D0D0D]">{r.target.rawName || <span className="text-gray-400">—</span>}</div>
                    {r.target.rawTitle && <div className="text-xs text-[#6B7280] mt-0.5">{r.target.rawTitle}</div>}
                  </td>
                  <td className="px-5 py-4 text-[#0D0D0D]">{r.target.rawCompany || <span className="text-gray-400">—</span>}</td>
                  <td className="px-5 py-4">
                    {r.bestMatch ? (
                      <>
                        <div className="font-medium text-[#0D0D0D]">{r.bestMatch.connection.rawName}</div>
                        {r.bestMatch.connection.rawConnectedThrough && <div className="text-xs text-[#6B7280] mt-0.5">via {r.bestMatch.connection.rawConnectedThrough}</div>}
                      </>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-4 w-32">
                    {r.bestMatch ? (
                      <div className="flex items-center gap-2">
                        <ProgressBar value={r.bestMatch.connectionStrength} className="flex-1" />
                        <span className="text-xs text-[#6B7280] w-6">{r.bestMatch.connectionStrength}</span>
                      </div>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-4"><Badge variant={qualityToVariant(r.warmPathQuality)}>{r.warmPathQuality}</Badge></td>
                  <td className="px-5 py-4 text-[#0D0D0D]">{r.icpFitScore}</td>
                  <td className="px-5 py-4"><ChevronRight size={16} className="text-gray-400" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-[#6B7280]">No results match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-xs text-[#6B7280] text-right">{filtered.length} of {state.results.length} shown</div>
    </div>
  );
}
